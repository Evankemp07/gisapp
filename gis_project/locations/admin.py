from django.contrib import admin
from django import forms
from django.utils.safestring import mark_safe
from django.urls import path
from django.http import JsonResponse
from django.utils.html import format_html
from django.templatetags.static import static
from locations.models import Location
import markdown
import re
import logging

logger = logging.getLogger(__name__)


COLOR_MAP = {
    "/r": "red",
    "/o": "orange",
    "/y": "yellow",
    "/g": "green",
    "/b": "blue",
    "/p": "purple",
    "/lr": "#ff6666",
    "/lo": "#ffa500",
    "/ly": "#ffff66",
    "/lg": "#66ff66",
    "/lb": "#66b3ff",
    "/lp": "#ff99ff",
}

def apply_colored_text(text):
    """
    Function to replace color-coded tags with styled HTML spans.
    Example: "/rThis is red/r" → "<span style='color: red;'>This is red</span>"
    """
    def replacer(match):
        tag = match.group(1)
        content = match.group(2)
        color = COLOR_MAP.get(f"/{tag}", "black")
        return f"<span style='color: {color};'>{content.strip()}</span>"

    pattern = re.compile(r"/(r|o|y|g|b|p|lr|lo|ly|lg|lb|lp)(.*?)/\1", re.DOTALL)
    return re.sub(pattern, replacer, text)

class LocationAdminForm(forms.ModelForm):
    """
    form for Location admin with a Markdown preview.
    """
    description = forms.CharField(widget=forms.Textarea(attrs={"rows": 5, "cols": 50}), required=False)

    class Meta:
        model = Location
        fields = "__all__"

    class Media:
        js = (static("admin/js/markdown_preview.js"),)

@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    form = LocationAdminForm
    list_display = ('name', 'latitude', 'longitude', 'is_animated', 'created_at')
    search_fields = ('name', 'address', 'description')
    list_filter = ('is_animated', 'created_at')
    actions = ['mark_as_animated']

    @admin.action(description="Mark selected locations as animated")
    def mark_as_animated(self, request, queryset):
        queryset.update(is_animated=True)

    def get_urls(self):
        """
        Extend Django Admin URLs to include a custom endpoint for Markdown preview.
        """
        urls = super().get_urls()
        custom_urls = [
            path(
                "locations/markdown_preview/",  
                self.admin_site.admin_view(self.markdown_preview_view),
                name="locations_markdown_preview",
            ),
        ]
        logger.info(f"Registering admin URL: {custom_urls[0].pattern}")
        return custom_urls + urls

    def markdown_preview_view(self, request):
        """
        Handles AJAX requests for rendering Markdown preview with colored text.
        """
        if request.method == "POST":
            raw_text = request.POST.get("text", "")
            colored_text = apply_colored_text(raw_text)
            rendered_html = markdown.markdown(colored_text, extensions=['extra'], output_format='html')

            return JsonResponse({"preview": mark_safe(rendered_html)})

        return JsonResponse({"error": "Invalid request"}, status=400)

    def preview_field(self, obj=None):
        """
        Placeholder div for the Markdown preview.
        """
        return format_html('<div id="markdown-preview" style="border: 1px solid #ccc; padding: 10px; min-height: 50px;"></div>')

    preview_field.short_description = "Markdown Preview"
