from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import admin_views as views
from . import staff_views

router = DefaultRouter()
router.include_root_view = False
router.register("projects", views.ProjectAdminViewSet, basename="admin-projects")
router.register("project-media", views.ProjectImageAdminViewSet, basename="admin-project-media")
router.register("team", views.TeamMemberAdminViewSet, basename="admin-team")
router.register("tenders", views.TenderAdminViewSet, basename="admin-tenders")
router.register("enquiries", views.EnquiryAdminViewSet, basename="admin-enquiries")
router.register("staff", staff_views.StaffAdminViewSet, basename="admin-staff")
router.register("admins", staff_views.AdminAccountViewSet, basename="admin-admins")

urlpatterns = [
    path("auth/csrf/", views.CsrfView.as_view(), name="admin-csrf"),
    path("auth/register/", staff_views.RegisterView.as_view(), name="admin-register"),
    path("auth/login/", staff_views.LoginView.as_view(), name="admin-login"),
    path("auth/logout/", staff_views.LogoutView.as_view(), name="admin-logout"),
    path("auth/me/", staff_views.MeView.as_view(), name="admin-me"),
    path("auth/password/", staff_views.ChangePasswordView.as_view(), name="admin-password"),
    path("dashboard/", views.DashboardView.as_view(), name="admin-dashboard"),
    path("company/", views.CompanyProfileAdminView.as_view(), name="admin-company"),
    path("", include(router.urls)),
]
