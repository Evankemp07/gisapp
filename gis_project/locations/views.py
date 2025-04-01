from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Location
from .serializers import LocationSerializer
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import markdown
import re

@api_view(['GET', 'POST'])
def locations(request):
    if request.method == 'GET':
        locations = Location.objects.all().order_by('-latitude')
        serializer = LocationSerializer(locations, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = LocationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


@api_view(['GET'])
def get_location_by_id(request, id):
    try:
        location = Location.objects.get(id=id)
        serializer = LocationSerializer(location)
        return Response(serializer.data)
    except Location.DoesNotExist:
        return Response({"error": "Location not found"}, status=404)

@api_view(['PUT', 'DELETE'])
def update_or_delete_location(request, id):
    try:
        location = Location.objects.get(id=id)
    except Location.DoesNotExist:
        return Response({"error": "Location not found"}, status=404)

    if request.method == 'PUT':
        serializer = LocationSerializer(location, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    elif request.method == 'DELETE':
        location.delete()
        return Response({"message": "Location deleted successfully"}, status=204)


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
    
    # Preserve newlines
    colored_text = re.sub(pattern, replacer, text)
    
    return colored_text.replace("\n", "<br>")

@csrf_exempt
def render_markdown(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            markdown_text = data.get("text", "")

            colored_text = apply_colored_text(markdown_text)

            rendered_html = markdown.markdown(colored_text, extensions=['extra', 'nl2br'], output_format='html')

            return JsonResponse({"html": rendered_html})
        
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Invalid request"}, status=400)

