from django.urls import path
from .views import CompanyProfileView, EnquiryCreate, ProjectList, SiteVisitCountView, TeamList, TenderList

urlpatterns = [
    path("company/", CompanyProfileView.as_view(), name="company-profile"),
    path("visits/", SiteVisitCountView.as_view(), name="site-visits"),
    path("projects/", ProjectList.as_view(), name="projects"),
    path("tenders/", TenderList.as_view(), name="tenders"),
    path("team/", TeamList.as_view(), name="team"),
    path("enquiries/", EnquiryCreate.as_view(), name="enquiries"),
]
