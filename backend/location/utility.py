from rest_framework.exceptions import ValidationError
from location.models import Location
from django.contrib.gis.geos import (MultiPolygon, Polygon, GEOSGeometry)


def get_location(location_object):
    required_params = [
        'osm_id', 
        'place_id', 
        'city',
        'state',
        'country',
        'name',
        'geojson'
    ]
    for param in required_params:
        if param not in location_object:
            raise ValidationError('Required parameter is missing')
    loc = Location.objects.filter(place_id=location_object['place_id'])
    if loc.exists():
        return loc[0]
    else:
        print(location_object['geojson'])
        polygon = GEOSGeometry(str(location_object['geojson']))
        print(polygon)
        for coord in polygon.coords:
            points = get_points_from_poly(coord)
        print("done----")
        multipolygon = MultiPolygon([polygon])
        print(polygon)
        loc = Location.objects.create(
            osm_id=location_object['osm_id'],
            place_id=location_object['place_id'],
            city=location_object['city'],
            state=location_object['state'],
            country=location_object['country'],
            name=location_object['name'],
            multi_polygon=multipolygon,
        )
        return loc

def get_points_from_poly()