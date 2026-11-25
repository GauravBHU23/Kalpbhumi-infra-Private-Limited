from django.db.models import F
from rest_framework import generics, throttling, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from .models import CompanyProfile, Enquiry, Project, SiteVisitCounter, TeamMember, Tender
from .serializers import CompanyProfileSerializer, EnquirySerializer, ProjectSerializer, TeamMemberSerializer, TenderSerializer
from .bot_verification import verify_turnstile

class CompanyProfileView(generics.RetrieveAPIView):
    serializer_class = CompanyProfileSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        return CompanyProfile.objects.order_by("id").first() or CompanyProfile()


class SiteVisitCountView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        counter = SiteVisitCounter.objects.get(pk=1)
        return Response({"total_visits": counter.total_visits})

    def post(self, request):
        updated = SiteVisitCounter.objects.filter(pk=1).update(total_visits=F("total_visits") + 1)
        if not updated:
            raise RuntimeError("The site visit counter has not been initialized.")
        counter = SiteVisitCounter.objects.get(pk=1)
        return Response({"total_visits": counter.total_visits})


class ProjectList(generics.ListAPIView):
    queryset = Project.objects.filter(published=True).prefetch_related("images")
    serializer_class = ProjectSerializer
    permission_classes = [AllowAny]

class TenderList(generics.ListAPIView):
    queryset = Tender.objects.filter(published=True)
    serializer_class = TenderSerializer
    permission_classes = [AllowAny]

class TeamList(generics.ListAPIView):
    queryset = TeamMember.objects.filter(published=True)
    serializer_class = TeamMemberSerializer
    permission_classes = [AllowAny]

class EnquiryCreate(generics.CreateAPIView):
    queryset = Enquiry.objects.all()
    serializer_class = EnquirySerializer
    permission_classes = [AllowAny]
    throttle_classes = [throttling.ScopedRateThrottle]
    throttle_scope = "public_enquiries"

    def create(self, request, *args, **kwargs):
        if str(request.data.get("website", "")).strip():
            return Response({"detail": "Automated submissions are not allowed."}, status=status.HTTP_400_BAD_REQUEST)
        if not verify_turnstile(request):
            return Response({"detail": "Complete the bot verification and try again."}, status=status.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)
