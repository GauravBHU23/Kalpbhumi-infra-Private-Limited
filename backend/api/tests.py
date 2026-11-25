from rest_framework.test import APITestCase

from .models import CompanyProfile, Project, SiteVisitCounter


class PublicCompanyProfileTests(APITestCase):
    def test_company_endpoint_returns_default_when_profile_is_not_configured(self):
        CompanyProfile.objects.all().delete()

        response = self.client.get("/api/company/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["company_name"], "Kalpbhumi Infra")


class ProjectStatusTests(APITestCase):
    def test_ongoing_is_not_a_supported_project_status(self):
        self.assertNotIn("ongoing", dict(Project.Status.choices))


class SiteVisitCounterTests(APITestCase):
    def test_homepage_visit_increments_the_aggregate_counter(self):
        initial = SiteVisitCounter.objects.get(pk=1).total_visits

        first = self.client.post("/api/visits/", {}, format="json")
        second = self.client.post("/api/visits/", {}, format="json")

        self.assertEqual(first.status_code, 200)
        self.assertEqual(first.data["total_visits"], initial + 1)
        self.assertEqual(second.status_code, 200)
        self.assertEqual(second.data["total_visits"], initial + 2)

    def test_get_returns_the_current_visit_total_without_incrementing(self):
        initial = SiteVisitCounter.objects.get(pk=1).total_visits

        response = self.client.get("/api/visits/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["total_visits"], initial)
