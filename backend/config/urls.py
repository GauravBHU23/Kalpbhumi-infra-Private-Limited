from django.conf import settings
from django.conf.urls.static import static
from django.urls import include, path

# The admin UI lives in the Next.js frontend (/admin); Django only serves JSON.
urlpatterns = [
    path("api/admin/", include("api.admin_urls")),
    path("api/", include("api.urls")),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
