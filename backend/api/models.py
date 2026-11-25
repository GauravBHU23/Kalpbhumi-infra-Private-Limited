from django.db import models
from django.core.exceptions import ValidationError
from pathlib import Path

class CompanyProfile(models.Model):
    company_name = models.CharField(max_length=180, default="Kalpbhumi Infra")
    short_profile = models.TextField(blank=True)
    history = models.TextField(blank=True)
    mission = models.TextField(blank=True)
    vision = models.TextField(blank=True)
    experience = models.TextField(blank=True)
    expertise = models.TextField(blank=True)
    phone = models.CharField(max_length=40, blank=True)
    email = models.EmailField(blank=True)
    address = models.CharField(max_length=240, blank=True)
    map_embed_url = models.URLField(blank=True)
    founded_year = models.PositiveSmallIntegerField(null=True, blank=True)
    projects_delivered = models.PositiveIntegerField(null=True, blank=True)
    states_covered = models.PositiveSmallIntegerField(null=True, blank=True)

    def __str__(self):
        return self.company_name


class SiteVisitCounter(models.Model):
    total_visits = models.PositiveBigIntegerField(default=0)


class Project(models.Model):
    class Category(models.TextChoices):
        ROADS = "roads", "Roads"
        BUILDINGS = "buildings", "Buildings"
        WATER = "water", "Water & drainage"
        DESIGN = "design", "Architecture & design"

    class ClientType(models.TextChoices):
        GOVERNMENT = "government", "Government"
        PRIVATE = "private", "Private"
        THIRD_PARTY = "third_party", "Third-party"

    class Status(models.TextChoices):
        COMPLETED = "completed", "Completed"
        UPCOMING = "upcoming", "Upcoming"

    name = models.CharField(max_length=180)
    slug = models.SlugField(unique=True)
    category = models.CharField(max_length=20, choices=Category.choices)
    location = models.CharField(max_length=180)
    client_name = models.CharField(max_length=180, blank=True)
    client_type = models.CharField(max_length=20, choices=ClientType.choices, default=ClientType.PRIVATE)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.COMPLETED)
    image_url = models.URLField(blank=True)
    start_date = models.DateField(null=True, blank=True)
    completion_date = models.DateField(null=True, blank=True)
    featured = models.BooleanField(default=False)
    published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-featured", "-completion_date", "name"]

    def __str__(self):
        return self.name

class ProjectImage(models.Model):
    class MediaType(models.TextChoices):
        PHOTO = "photo", "Site / project photo"
        DESIGN_2D = "design_2d", "2D drawing"
        DESIGN_3D = "design_3d", "3D design"
        VIDEO = "video", "Site video"

    project = models.ForeignKey(Project, related_name="images", on_delete=models.CASCADE)
    file = models.FileField(upload_to="projects/%Y/%m/", blank=True)
    image_url = models.URLField(blank=True, help_text="Optional external image URL if no file is uploaded.")
    video_url = models.URLField(blank=True, help_text="Optional video URL for video gallery items.")
    media_type = models.CharField(max_length=20, choices=MediaType.choices, default=MediaType.PHOTO)
    alt_text = models.CharField(max_length=180, blank=True)
    position = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["position", "id"]

    def clean(self):
        if not self.file:
            return
        extension = Path(self.file.name).suffix.lower()
        allowed = {
            self.MediaType.PHOTO: {".jpg", ".jpeg", ".png", ".webp"},
            self.MediaType.DESIGN_2D: {".pdf", ".jpg", ".jpeg", ".png", ".webp"},
            self.MediaType.DESIGN_3D: {".pdf", ".jpg", ".jpeg", ".png", ".webp"},
            self.MediaType.VIDEO: {".mp4", ".webm"},
        }
        if extension not in allowed[self.media_type]:
            raise ValidationError({"file": "Choose a file type supported by the selected gallery media type."})

    def __str__(self):
        return f"{self.project.name} image {self.position + 1}"

class TeamMember(models.Model):
    class Department(models.TextChoices):
        MANAGEMENT = "management", "Management"
        TECHNICAL = "technical", "Technical staff"
        SITE = "site", "Site & supervision"
        ADMIN = "admin", "Administrative"
        SUPPORT = "support", "Supporting staff"

    name = models.CharField(max_length=120)
    designation = models.CharField(max_length=120)
    department = models.CharField(max_length=20, choices=Department.choices, default=Department.TECHNICAL)
    experience_years = models.PositiveSmallIntegerField(default=0)
    biography = models.TextField(blank=True)
    photo = models.ImageField(upload_to="team/%Y/%m/", blank=True)
    image_url = models.URLField(blank=True)
    position = models.PositiveSmallIntegerField(default=0)
    published = models.BooleanField(default=False)

    class Meta:
        ordering = ["position", "name"]

    def __str__(self):
        return f"{self.name} — {self.designation}"

class Tender(models.Model):
    class NoticeType(models.TextChoices):
        TENDER = "tender", "Tender notice"
        WORK_ORDER = "work_order", "Work order"
        CONTRACT = "contract", "Contract opportunity"
        VENDOR = "vendor", "Vendor opportunity"

    class ClientType(models.TextChoices):
        GOVERNMENT = "government", "Government"
        PRIVATE = "private", "Private"

    class Status(models.TextChoices):
        OPEN = "open", "Open"
        UPCOMING = "upcoming", "Upcoming"
        CLOSED = "closed", "Closed"

    title = models.CharField(max_length=200)
    location = models.CharField(max_length=180)
    category = models.CharField(max_length=120)
    notice_type = models.CharField(max_length=20, choices=NoticeType.choices, default=NoticeType.TENDER)
    client_type = models.CharField(max_length=20, choices=ClientType.choices, default=ClientType.GOVERNMENT)
    status = models.CharField(max_length=20, choices=Status.choices)
    closing_date = models.DateField(null=True, blank=True)
    notice_url = models.URLField(blank=True)
    document = models.FileField(upload_to="tenders/%Y/%m/", blank=True)
    description = models.TextField(blank=True)
    published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["closing_date", "-created_at"]

    def clean(self):
        if self.document and Path(self.document.name).suffix.lower() not in {".pdf", ".doc", ".docx", ".xls", ".xlsx"}:
            raise ValidationError({"document": "Tender documents must be PDF, DOC/DOCX or XLS/XLSX files."})

    def __str__(self):
        return self.title

class Enquiry(models.Model):
    class RequestType(models.TextChoices):
        QUOTATION = "quotation", "Request a quotation"
        PROJECT = "project", "Project consultation"
        TENDER = "tender", "Tender / contract"
        OTHER = "other", "Other"

    name = models.CharField(max_length=120)
    email = models.EmailField()
    phone = models.CharField(max_length=32, blank=True)
    service = models.CharField(max_length=80)
    request_type = models.CharField(max_length=20, choices=RequestType.choices, default=RequestType.QUOTATION)
    project_location = models.CharField(max_length=180, blank=True)
    budget_range = models.CharField(max_length=80, blank=True)
    message = models.TextField(max_length=5000)
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} — {self.created_at:%Y-%m-%d}"


class StaffProfile(models.Model):
    """Extra details for employees who use the admin panel (linked to Django's auth user)."""
    user = models.OneToOneField("auth.User", related_name="staff_profile", on_delete=models.CASCADE)
    phone = models.CharField(max_length=32, blank=True)
    designation = models.CharField(max_length=120, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.get_username()} profile"
