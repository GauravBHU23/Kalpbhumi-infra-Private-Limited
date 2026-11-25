"""Employee accounts: self-registration (needs admin approval), login, own profile and staff management.

Admin and staff are kept separate:
  * Admin    -> is_staff=True, is_superuser=True. Signs in at /admin/login only. Created only by another
               admin (Admins page) or "manage.py createsuperuser"; never through staff registration.
  * Staff    -> is_staff=True, is_superuser=False. Signs in at /staff/login only.
  * Pending  -> registered at /staff/register, waiting for admin approval (is_staff=False).
  * Disabled -> is_active=False.
"""
from django.contrib.auth import get_user_model, login, logout, update_session_auth_hash
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect
import os
import urllib.parse
import urllib.request
import json
from rest_framework import permissions, serializers, status, throttling, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import StaffProfile

User = get_user_model()


def verify_turnstile(request):
    secret = os.getenv("TURNSTILE_SECRET_KEY", "").strip()
    if not secret:
        return True
    token = str(request.data.get("turnstile_token", "")).strip()
    if not token:
        return False
    try:
        payload = urllib.parse.urlencode({
            "secret": secret,
            "response": token,
            "remoteip": request.META.get("REMOTE_ADDR", ""),
        }).encode()
        with urllib.request.urlopen(
            urllib.request.Request(
                "https://challenges.cloudflare.com/turnstile/v0/siteverify",
                data=payload,
                method="POST",
            ),
            timeout=5,
        ) as response:
            return bool(json.loads(response.read().decode()).get("success"))
    except Exception:
        return False


class IsSuperUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_active and request.user.is_staff and request.user.is_superuser)


def role_of(user):
    if not user.is_active:
        return "disabled"
    if user.is_superuser and user.is_staff:
        return "admin"
    return "staff" if user.is_staff else "pending"


def profile_of(user):
    profile, _ = StaffProfile.objects.get_or_create(user=user)
    return profile


def user_payload(user):
    profile = getattr(user, "staff_profile", None)
    return {
        "id": user.pk,
        "username": user.get_username(),
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "name": user.get_full_name() or user.get_username(),
        "phone": profile.phone if profile else "",
        "designation": profile.designation if profile else "",
        "role": role_of(user),
        "date_joined": user.date_joined,
        "last_login": user.last_login,
    }


def check_password_strength(password, user=None, field="password"):
    try:
        validate_password(password, user)
    except DjangoValidationError as exc:
        raise serializers.ValidationError({field: list(exc.messages)})


class RegisterSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    username = serializers.RegexField(r"^[\w.@+-]+$", max_length=150, error_messages={"invalid": "Use letters, numbers and . @ + - _ only."})
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=32, required=False, allow_blank=True)
    designation = serializers.CharField(max_length=120, required=False, allow_blank=True)
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value

    def validate_email(self, value):
        value = value.strip().lower()
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        candidate = User(username=attrs["username"], email=attrs["email"], first_name=attrs["first_name"], last_name=attrs.get("last_name", ""))
        check_password_strength(attrs["password"], candidate)
        return attrs

    @transaction.atomic
    def create(self, data):
        user = User.objects.create_user(
            username=data["username"], email=data["email"], password=data["password"],
            first_name=data["first_name"].strip(), last_name=data.get("last_name", "").strip(),
            is_staff=False, is_active=True,
        )
        StaffProfile.objects.create(user=user, phone=data.get("phone", ""), designation=data.get("designation", ""))
        return user


@method_decorator(csrf_protect, name="dispatch")
class RegisterView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [throttling.ScopedRateThrottle]
    throttle_scope = "admin_register"

    def post(self, request):
        if not verify_turnstile(request):
            return Response({"detail": "Complete the bot verification and try again."}, status=status.HTTP_403_FORBIDDEN)
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"detail": "Registration received. An administrator must approve your account before you can sign in."},
            status=status.HTTP_201_CREATED,
        )


@method_decorator(csrf_protect, name="dispatch")
class LoginView(APIView):
    """POST {username, password, portal: "admin" | "staff"}; each portal accepts only its own accounts."""
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [throttling.ScopedRateThrottle]
    throttle_scope = "admin_login"

    def post(self, request):
        if not verify_turnstile(request):
            return Response({"detail": "Complete the bot verification and try again."}, status=status.HTTP_403_FORBIDDEN)
        portal = request.data.get("portal")
        if portal not in {"admin", "staff"}:
            return Response({"detail": "Invalid sign-in portal."}, status=status.HTTP_400_BAD_REQUEST)
        identifier = str(request.data.get("username", "")).strip()
        password = str(request.data.get("password", ""))
        if not identifier or not password:
            return Response({"detail": "Enter your email / username and password."}, status=status.HTTP_400_BAD_REQUEST)

        lookup = {"email__iexact": identifier} if "@" in identifier else {"username__iexact": identifier}
        user = User.objects.filter(**lookup).order_by("id").first()
        if user is None and "@" in identifier:  # usernames may contain "@"
            user = User.objects.filter(username__iexact=identifier).first()
        if user is None or not user.check_password(password):
            return Response({"detail": "The email / username or password is incorrect."}, status=status.HTTP_400_BAD_REQUEST)
        if not user.is_active:
            return Response({"detail": "This account has been disabled. Contact an administrator."}, status=status.HTTP_403_FORBIDDEN)
        if portal == "admin" and not (user.is_superuser and user.is_staff):
            return Response({"detail": "This is not an administrator account."}, status=status.HTTP_403_FORBIDDEN)
        if portal == "staff":
            if user.is_superuser:
                return Response({"detail": "Administrator accounts cannot sign in here."}, status=status.HTTP_403_FORBIDDEN)
            if not user.is_staff:
                return Response({"detail": "Your account is waiting for administrator approval."}, status=status.HTTP_403_FORBIDDEN)

        login(request, user, backend="django.contrib.auth.backends.ModelBackend")
        return Response({"user": user_payload(user)})


class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        logout(request)
        return Response(status=status.HTTP_204_NO_CONTENT)


class ProfileSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=32, required=False, allow_blank=True)
    designation = serializers.CharField(max_length=120, required=False, allow_blank=True)

    def validate_email(self, value):
        value = value.strip().lower()
        if User.objects.filter(email__iexact=value).exclude(pk=self.instance.pk).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value

    def update(self, user, data):
        user.first_name = data["first_name"].strip()
        user.last_name = data.get("last_name", user.last_name).strip()
        user.email = data["email"]
        user.save(update_fields=["first_name", "last_name", "email"])
        profile = profile_of(user)
        profile.phone = data.get("phone", profile.phone)
        profile.designation = data.get("designation", profile.designation)
        profile.save()
        return user


class MeView(APIView):
    """GET own account; PATCH own profile."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        return Response({"user": user_payload(request.user)})

    def patch(self, request):
        serializer = ProfileSerializer(request.user, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        request.user.refresh_from_db()
        return Response({"user": user_payload(request.user)})


class ChangePasswordView(APIView):
    permission_classes = [IsAdminUser]
    throttle_classes = [throttling.ScopedRateThrottle]
    throttle_scope = "admin_mutations"

    def post(self, request):
        current = str(request.data.get("current_password", ""))
        new = str(request.data.get("new_password", ""))
        confirm = str(request.data.get("confirm_password", ""))
        if not request.user.check_password(current):
            return Response({"current_password": ["Current password is incorrect."]}, status=status.HTTP_400_BAD_REQUEST)
        if new != confirm:
            return Response({"confirm_password": ["Passwords do not match."]}, status=status.HTTP_400_BAD_REQUEST)
        check_password_strength(new, request.user, field="new_password")
        request.user.set_password(new)
        request.user.save(update_fields=["password"])
        update_session_auth_hash(request, request.user)  # stay signed in
        return Response({"detail": "Password changed."})


class BaseAccountViewSet(viewsets.ViewSet):
    """Shared helpers for the admin-only account pages."""
    permission_classes = [IsSuperUser]
    throttle_classes = [throttling.ScopedRateThrottle]
    throttle_scope = "admin_mutations"
    admins = False  # True -> manages administrator accounts, False -> staff accounts

    def scoped(self):
        return User.objects.select_related("staff_profile").filter(is_superuser=self.admins)

    def get_user(self, pk):
        return self.scoped().filter(pk=pk).first()

    def not_found(self):
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=["post"], url_path="set-password")
    def set_password(self, request, pk=None):
        user = self.get_user(pk)
        if user is None:
            return self.not_found()
        password = str(request.data.get("password", ""))
        check_password_strength(password, user)
        user.set_password(password)
        user.save(update_fields=["password"])
        if user.pk == request.user.pk:
            update_session_auth_hash(request, user)
        return Response({"detail": f"Password updated for {user.get_username()}."})


class StaffAdminViewSet(BaseAccountViewSet):
    """Admin-only management of staff (employee) accounts. Staff can never be promoted to admin here."""
    admins = False

    def list(self, request):
        return Response([user_payload(u) for u in self.scoped().order_by("is_staff", "-date_joined")])

    def partial_update(self, request, pk=None):
        user = self.get_user(pk)
        if user is None:
            return self.not_found()
        role = request.data.get("role")
        if role not in {"pending", "staff", "disabled"}:
            return Response({"role": ["Choose pending, staff or disabled."]}, status=status.HTTP_400_BAD_REQUEST)
        user.is_active = role != "disabled"
        if role != "disabled":
            user.is_staff = role == "staff"
        user.save(update_fields=["is_active", "is_staff"])
        return Response(user_payload(user))

    def destroy(self, request, pk=None):
        user = self.get_user(pk)
        if user is None:
            return self.not_found()
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminCreateSerializer(RegisterSerializer):
    def create(self, data):
        with transaction.atomic():
            user = User.objects.create_superuser(
                username=data["username"], email=data["email"], password=data["password"],
                first_name=data["first_name"].strip(), last_name=data.get("last_name", "").strip(),
            )
            StaffProfile.objects.create(user=user, phone=data.get("phone", ""), designation=data.get("designation", ""))
        return user


class AdminAccountViewSet(BaseAccountViewSet):
    """Admin-only management of administrator accounts (created directly, not via staff registration)."""
    admins = True

    def other_active_admins(self, user):
        return User.objects.filter(is_superuser=True, is_staff=True, is_active=True).exclude(pk=user.pk).exists()

    def list(self, request):
        return Response([user_payload(u) for u in self.scoped().order_by("-is_active", "date_joined")])

    def create(self, request):
        serializer = AdminCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(user_payload(serializer.save()), status=status.HTTP_201_CREATED)

    def partial_update(self, request, pk=None):
        user = self.get_user(pk)
        if user is None:
            return self.not_found()
        active = request.data.get("active")
        if not isinstance(active, bool):
            return Response({"active": ["Send true or false."]}, status=status.HTTP_400_BAD_REQUEST)
        if not active and user.pk == request.user.pk:
            return Response({"detail": "You cannot disable your own account."}, status=status.HTTP_400_BAD_REQUEST)
        if not active and not self.other_active_admins(user):
            return Response({"detail": "At least one active admin is required."}, status=status.HTTP_400_BAD_REQUEST)
        user.is_active = active
        user.is_staff = True
        user.save(update_fields=["is_active", "is_staff"])
        return Response(user_payload(user))

    def destroy(self, request, pk=None):
        user = self.get_user(pk)
        if user is None:
            return self.not_found()
        if user.pk == request.user.pk:
            return Response({"detail": "You cannot delete your own account."}, status=status.HTTP_400_BAD_REQUEST)
        if not self.other_active_admins(user):
            return Response({"detail": "At least one active admin is required."}, status=status.HTTP_400_BAD_REQUEST)
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
