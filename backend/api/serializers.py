from rest_framework import serializers
from .models import CompanyProfile, Enquiry, Project, ProjectImage, TeamMember, Tender

class CompanyProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyProfile
        fields = ["company_name", "short_profile", "history", "mission", "vision", "experience", "expertise", "phone", "email", "address", "map_embed_url", "founded_year", "projects_delivered", "states_covered"]

class ProjectImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = ProjectImage
        fields = ["image_url", "video_url", "media_type", "alt_text", "position"]

    def get_image_url(self, obj):
        if obj.file:
            url = obj.file.url
            request = self.context.get("request")
            return request.build_absolute_uri(url) if request else url
        return obj.image_url or ""

class ProjectSerializer(serializers.ModelSerializer):
    images = ProjectImageSerializer(many=True, read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = ["id", "name", "slug", "category", "location", "client_name", "client_type", "description", "status", "image_url", "images", "start_date", "completion_date"]

    def get_image_url(self, obj):
        first_photo = obj.images.filter(media_type=ProjectImage.MediaType.PHOTO).first()
        if first_photo:
            return ProjectImageSerializer(first_photo, context=self.context).data["image_url"]
        if obj.image_url:
            request = self.context.get("request")
            return request.build_absolute_uri(obj.image_url) if request and obj.image_url.startswith("/") else obj.image_url
        return ""

class TeamMemberSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = TeamMember
        fields = ["id", "name", "designation", "department", "experience_years", "biography", "image_url"]

    def get_image_url(self, obj):
        if obj.photo:
            url = obj.photo.url
            request = self.context.get("request")
            return request.build_absolute_uri(url) if request else url
        return obj.image_url

class TenderSerializer(serializers.ModelSerializer):
    document_url = serializers.SerializerMethodField()

    class Meta:
        model = Tender
        fields = ["id", "title", "location", "category", "notice_type", "client_type", "status", "closing_date", "notice_url", "document_url", "description"]

    def get_document_url(self, obj):
        if obj.document:
            url = obj.document.url
            request = self.context.get("request")
            return request.build_absolute_uri(url) if request else url
        return ""

class EnquirySerializer(serializers.ModelSerializer):
    website = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Enquiry
        fields = ["id", "name", "email", "phone", "service", "request_type", "project_location", "budget_range", "message", "website", "created_at"]
        read_only_fields = ["id", "created_at"]

    def validate(self, attrs):
        if attrs.pop("website", "").strip():
            raise serializers.ValidationError("Automated submissions are not allowed.")
        return attrs

    def validate_service(self, value):
        allowed = {"Building & construction", "Roads & infrastructure", "Repair, maintenance & demolition", "Architecture & drawing services", "Tender / partnership", "Other"}
        if value not in allowed:
            raise serializers.ValidationError("Choose a valid service.")
        return value
