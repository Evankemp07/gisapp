from django.contrib import admin
from django import forms
from django.utils.safestring import mark_safe
from django.urls import path, reverse
from django.http import JsonResponse
from django.utils.html import format_html
from django.templatetags.static import static
from django.utils.http import urlencode
from django.shortcuts import render, redirect
from django.contrib import messages

from locations.models import Location
import markdown
import re
import logging

logger = logging.getLogger(__name__)

COLOR_MAP = {
    "/r": "red", "/o": "orange", "/y": "yellow", "/g": "green",
    "/b": "blue", "/p": "purple",
    "/lr": "#ff6666", "/lo": "#ffa500", "/ly": "#ffff66",
    "/lg": "#66ff66", "/lb": "#66b3ff", "/lp": "#ff99ff",
}

def apply_colored_text(text):
    def replacer(match):
        tag = match.group(1)
        content = match.group(2)
        color = COLOR_MAP.get(f"/{tag}", "black")
        return f"<span style='color: {color};'>{content.strip()}</span>"
    pattern = re.compile(r"/(r|o|y|g|b|p|lr|lo|ly|lg|lb|lp)(.*?)/\1", re.DOTALL)
    return re.sub(pattern, replacer, text)

class ColorChangeForm(forms.Form):
    OPERATION_CHOICES = [
        ("replace", "Replace existing color tag"),
        ("remove", "Remove color tag"),
        ("add", "Add color tag if missing"),
    ]

    operation = forms.ChoiceField(choices=OPERATION_CHOICES, label="Operation")
    old_color = forms.ChoiceField(
        choices=[(k, k) for k in COLOR_MAP.keys()],
        label="Old Color Tag",
        required=False,
    )
    new_color = forms.ChoiceField(
        choices=[(k, k) for k in COLOR_MAP.keys()],
        label="New Color Tag",
        required=False,
    )

    def clean(self):
        cleaned_data = super().clean()
        operation = cleaned_data.get("operation")
        old_color = cleaned_data.get("old_color")
        new_color = cleaned_data.get("new_color")

        if operation == "replace" and (not old_color or not new_color):
            raise forms.ValidationError("Both old and new color tags are required for replacement.")
        if operation == "remove" and not old_color:
            raise forms.ValidationError("Old color tag is required for removal.")
        if operation == "add" and not new_color:
            raise forms.ValidationError("New color tag is required for addition.")

        return cleaned_data


class LocationAdminForm(forms.ModelForm):
    google_maps_url = forms.URLField(
        required=False,
        label="Google Maps Link",
        help_text="Paste a Google Maps URL to auto-fill address and coordinates."
    )

    description = forms.CharField(
        widget=forms.Textarea(attrs={"rows": 5, "cols": 50}),
        required=False
    )

    class Meta:
        model = Location
        fields = "__all__"
        
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        if self.instance and self.instance.custom_icon:
            self.fields['custom_icon'].help_text = mark_safe(
                f'<div style="margin-top: 10px;">Current Icon:<br>'
                f'<img src="{self.instance.custom_icon.url}" height="50" alt="Current SVG Icon"/></div>'
            )

    class Media:
        js = (
            static("admin/js/markdown_preview.js"),
            static("admin/js/maps_autofill.js"),
        )

    def clean(self):
        cleaned_data = super().clean()
        url = cleaned_data.get("google_maps_url")

        if url:
            import urllib.parse as urlparse

            try:
                parsed_url = urlparse.urlparse(url)
                coords_match = re.search(r'@(-?\d+\.\d+),(-?\d+\.\d+)', url)
                address_match = re.search(r'/place/(.*?)/@', url)

                if coords_match:
                    lat = float(coords_match.group(1))
                    lon = float(coords_match.group(2))
                    cleaned_data['latitude'] = lat
                    cleaned_data['longitude'] = lon

                if address_match:
                    address = address_match.group(1).replace('+', ' ').strip()
                    cleaned_data['address'] = address

            except Exception as e:
                raise forms.ValidationError(f"Error parsing Google Maps link: {e}")

        return cleaned_data

@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    form = LocationAdminForm
    list_display = ('name', 'address', 'latitude', 'longitude', 'is_animated', 'created_at')
    search_fields = ('name', 'address', 'description')
    list_filter = ('is_animated', 'created_at', 'is_contestant')
    actions = ['mark_as_animated', 'mark_as_contestant', 'bulk_replace_color_tag']

    @admin.action(description="Mark selected locations as animated")
    def mark_as_animated(self, request, queryset):
        queryset.update(is_animated=True)

    @admin.action(description="Mark selected locations as contestants")
    def mark_as_contestant(self, request, queryset):
        updated = queryset.update(is_contestant=True)
        self.message_user(request, f"{updated} location(s) marked as contestants.")

    @admin.action(description="Bulk replace color tags in name")
    def bulk_replace_color_tag(self, request, queryset):
        selected = queryset.values_list("pk", flat=True)
        return redirect(
            f"{reverse('admin:locations_color_replace')}?{urlencode({'ids': ','.join(map(str, selected))})}"
        )

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path(
                "locations/markdown_preview/",
                self.admin_site.admin_view(self.markdown_preview_view),
                name="locations_markdown_preview",
            ),
            path(
                "locations/color_replace/",
                self.admin_site.admin_view(self.color_replace_view),
                name="locations_color_replace",
            ),
        ]
        return custom_urls + urls

    def markdown_preview_view(self, request):
        if request.method == "POST":
            raw_text = request.POST.get("text", "")
            colored_text = apply_colored_text(raw_text)
            rendered_html = markdown.markdown(colored_text, extensions=['extra'], output_format='html')
            return JsonResponse({"preview": mark_safe(rendered_html)})

        return JsonResponse({"error": "Invalid request"}, status=400)

    def color_replace_view(self, request):
        ids = request.GET.get("ids", "")
        id_list = ids.split(",")
        queryset = Location.objects.filter(pk__in=id_list)

        if request.method == "POST":
            form = ColorChangeForm(request.POST)
            if form.is_valid():
                operation = form.cleaned_data["operation"]
                old_color = form.cleaned_data.get("old_color")
                new_color = form.cleaned_data.get("new_color")
                updated_count = 0

                for obj in queryset:
                    name = obj.name or ""

                    if operation == "replace" and old_color in name:
                        name = name.replace(old_color, new_color)
                        obj.name = name
                        obj.save()
                        updated_count += 1

                    elif operation == "remove" and old_color in name:
                        name = name.replace(old_color, "")
                        obj.name = name
                        obj.save()
                        updated_count += 1

                    elif operation == "add" and new_color not in name:
                        obj.name = f"{new_color} {name}".strip()
                        obj.save()
                        updated_count += 1

                self.message_user(request, f"{updated_count} location(s) updated via '{operation}' operation.")
                return redirect("..")
        else:
            form = ColorChangeForm()

        return render(request, "admin/bulk_color_replace.html", {
            "form": form,
            "queryset": queryset,
            "title": "Bulk Replace / Remove / Add Color Tags",
        })


    def preview_field(self, obj=None):
        return format_html(
            '<div id="markdown-preview" style="border: 1px solid #ccc; padding: 10px; min-height: 50px;"></div>'
        )

    preview_field.short_description = "Markdown Preview"
