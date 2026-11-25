"""Staff-only JSON API that powers the Next.js admin panel (replaces Django admin HTML)."""
from django.contrib.auth import get_user_model
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import viewsets, throttling
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from .admin_serializers import (
    CompanyProfileAdminSerializer,
    EnquiryAdminSerializer,
    ProjectAdminSerializer,
    ProjectImageAdminSerializer,
    TeamMemberAdminSerializer,
    TenderAdminSerializer,
)
from .staff_views import IsSuperUser
from .models import CompanyProfile, Enquiry, Project, ProjectImage, TeamMember, Tender

UPLOAD_PARSERS = [JSONParser, MultiPartParser, FormParser]


@method_decorator(ensure_csrf_cookie, name="dispatch")
class CsrfView(APIView):
    """Sets the csrftoken cookie so the browser can send X-CSRFToken on writes."""
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        return Response({"ok": True})


class DashboardView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        recent = Enquiry.objects.all()[:5]
        return Response({
            "projects": Project.objects.count(),
            "projects_published": Project.objects.filter(published=True).count(),
            "tenders": Tender.objects.count(),
            "tenders_open": Tender.objects.filter(status=Tender.Status.OPEN).count(),
            "team": TeamMember.objects.count(),
            "enquiries": Enquiry.objects.count(),
            "enquiries_unread": Enquiry.objects.filter(is_read=False).count(),
            "recent_enquiries": EnquiryAdminSerializer(recent, many=True).data,
            "staff_pending": (
                get_user_model().objects.filter(is_active=True, is_staff=False).count()
                if request.user.is_superuser else 0
            ),
        })


class CompanyProfileAdminView(APIView):
    permission_classes = [IsSuperUser]
    throttle_classes = [throttling.ScopedRateThrottle]
    throttle_scope = "admin_mutations"

    def get_object(self):
        return CompanyProfile.objects.order_by("id").first()

    def get(self, request):
        obj = self.get_object()
        if obj is None:
            return Response(CompanyProfileAdminSerializer(CompanyProfile()).data | {"id": None})
        return Response(CompanyProfileAdminSerializer(obj).data)

    def put(self, request):
        obj = self.get_object()
        serializer = CompanyProfileAdminSerializer(obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    patch = put


class ProjectAdminViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.prefetch_related("images")
    serializer_class = ProjectAdminSerializer
    permission_classes = [IsAdminUser]
    throttle_classes = [throttling.ScopedRateThrottle]
    throttle_scope = "admin_mutations"


class ProjectImageAdminViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectImageAdminSerializer
    permission_classes = [IsAdminUser]
    parser_classes = UPLOAD_PARSERS
    throttle_classes = [throttling.ScopedRateThrottle]
    throttle_scope = "admin_mutations"

    def get_queryset(self):
        queryset = ProjectImage.objects.select_related("project")
        project = self.request.query_params.get("project")
        return queryset.filter(project_id=project) if project else queryset

    def perform_destroy(self, instance):
        if instance.file:
            instance.file.delete(save=False)
        instance.delete()


class TeamMemberAdminViewSet(viewsets.ModelViewSet):
    queryset = TeamMember.objects.all()
    serializer_class = TeamMemberAdminSerializer
    permission_classes = [IsAdminUser]
    parser_classes = UPLOAD_PARSERS
    throttle_classes = [throttling.ScopedRateThrottle]
    throttle_scope = "admin_mutations"


class TenderAdminViewSet(viewsets.ModelViewSet):
    queryset = Tender.objects.all()
    serializer_class = TenderAdminSerializer
    permission_classes = [IsAdminUser]
    parser_classes = UPLOAD_PARSERS
    throttle_classes = [throttling.ScopedRateThrottle]
    throttle_scope = "admin_mutations"


class EnquiryAdminViewSet(viewsets.ModelViewSet):
    queryset = Enquiry.objects.all()
    serializer_class = EnquiryAdminSerializer
    permission_classes = [IsAdminUser]
    http_method_names = ["get", "patch", "delete", "head", "options"]
