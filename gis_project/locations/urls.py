from django.urls import path
from .views import locations, get_location_by_id, render_markdown, update_or_delete_location

urlpatterns = [
    path('api/locations/', locations, name="locations"),
    path('api/location/<int:id>/', get_location_by_id, name="get_location_by_id"),
    path('api/location/<int:id>/update_delete/', update_or_delete_location, name="update_or_delete_location"),
    path("api/locations/render_markdown/", render_markdown, name="render_markdown"),
]
