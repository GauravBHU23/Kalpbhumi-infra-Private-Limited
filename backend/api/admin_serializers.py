"""Serializers for the staff-only admin API used by the Next.js admin panel."""
from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils.text import slugify
from rest_framework import serializers

from .models import CompanyProfile, Enquiry, Project, ProjectImage, TeamMember, Tender


def absolute_file_url(serializer, field_file):
    if not field_file:
        return ""
    url = field_file.url
    request = serializer.context.get("request")
    return request.build_absolute_uri(url) if request else url


def run_model_clean(serializer, attrs):
    """Run the model's clean() so admin API uploads get the same validation as before."""
    model = serializer.Meta.model
    instance = serializer.instance or model()
    for key, value in attrs.items():
        setattr(instance, key, value)
    try:
        instance.clean()
    except DjangoValidationError as exc:
        raise serializers.ValidationError(exc.message_dict if hasattr(exc, "message_dict") else exc.messages)
    return attrs


class CompanyProfileAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyProfile
        fields = "__all__"
        read_only_fields = ["id"]


class ProjectImageAdminSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = ProjectImage
        fields = ["id", "project", "media_type", "file", "file_url", "image_url", "video_url", "alt_text", "position"]
        extra_kwargs = {"file": {"write_only": True, "required": False}}

    def get_file_url(self, obj):
        return absolute_file_url(self, obj.file)

    def validate(self, attrs):
        return run_model_clean(self, attrs)


class ProjectAdminSerializer(serializers.ModelSerializer):
    images = ProjectImageAdminSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = [
            "id", "name", "slug", "category", "location", "client_name", "client_type", "description",
            "status", "image_url", "start_date", "completion_date", "featured", "published", "created_at", "images",
        ]
        read_only_fields = ["id", "created_at"]
        extra_kwargs = {"slug": {"required": False, "allow_blank": True}}

    def validate(self, attrs):
        slug = attrs.get("slug")
        if not slug and (self.instance is None or "slug" in attrs):
            name = attrs.get("name") or (self.instance.name if self.instance else "")
            base = slugify(name)[:45] or "project"
            slug, counter = base, 2
            others = Project.objects.exclude(pk=self.instance.pk) if self.instance else Project.objects.all()
            while others.filter(slug=slug).exists():
                slug = f"{base}-{counter}"
                counter += 1
            attrs["slug"] = slug
        return attrs


class TeamMemberAdminSerializer(serializers.ModelSerializer):
    photo_url = serializers.SerializerMethodField()
    remove_photo = serializers.BooleanField(write_only=True, required=False, default=False)

    class Meta:
        model = TeamMember
        fields = [
            "id", "name", "designation", "department", "experience_years", "biography",
            "photo", "photo_url", "remove_photo", "image_url", "position", "published",
        ]
        extra_kwargs = {"photo": {"write_only": True, "required": False}}

    def get_photo_url(self, obj):
        return absolute_file_url(self, obj.photo)

    def update(self, instance, validated_data):
        if validated_data.pop("remove_photo", False) and "photo" not in validated_data:
            instance.photo.delete(save=False)
            instance.photo = None
        return super().update(instance, validated_data)

    def create(self, validated_data):
        validated_data.pop("remove_photo", None)
        return super().create(validated_data)


class TenderAdminSerializer(serializers.ModelSerializer):
    document_url = serializers.SerializerMethodField()
    remove_document = serializers.BooleanField(write_only=True, required=False, default=False)

    class Meta:
        model = Tender
        fields = [
            "id", "title", "location", "category", "notice_type", "client_type", "status", "closing_date",
            "notice_url", "document", "document_url", "remove_document", "description", "published", "created_at",
        ]
        read_only_fields = ["id", "created_at"]
        extra_kwargs = {"document": {"write_only": True, "required": False}}

    def get_document_url(self, obj):
        return absolute_file_url(self, obj.document)

    def validate(self, attrs):
        remove = attrs.pop("remove_document", False)
        run_model_clean(self, attrs)
        attrs["remove_document"] = remove
        return attrs

    def update(self, instance, validated_data):
        if validated_data.pop("remove_document", False) and "document" not in validated_data:
            instance.document.delete(save=False)
            instance.document = None
        return super().update(instance, validated_data)

    def create(self, validated_data):
        validated_data.pop("remove_document", None)
        return super().create(validated_data)


class EnquiryAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enquiry
        fields = [
            "id", "name", "email", "phone", "service", "request_type", "project_location",
            "budget_range", "message", "created_at", "is_read",
        ]
        read_only_fields = [f for f in fields if f != "is_read"]
