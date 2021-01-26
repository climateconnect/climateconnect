from rest_framework.exceptions import ValidationError
from location.models import Location
from django.contrib.gis.geos import (MultiPolygon, Polygon, GEOSGeometry, LinearRing, Point)


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
        multipolygon = get_multipolygon_from_geojson(location_object['geojson'])
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

def get_multipolygon_from_geojson(geojson):
    input_polygon =  GEOSGeometry(str(geojson))
    
    if isinstance(input_polygon,Polygon):
        return MultiPolygon(
            get_polygon_with_switched_coordinates(input_polygon)
        )
    elif isinstance(input_polygon, MultiPolygon):
        polygons = list(input_polygon)
        switched_multipolygon = []
        for polygon in polygons:
            switched_polygon = get_polygon_with_switched_coordinates(polygon)
            switched_multipolygon.append(switched_polygon)        
        return MultiPolygon(switched_multipolygon)
    else:
        raise Exception("Wrong input")

def get_polygon_with_switched_coordinates(polygon):
    switched_poly = []
    linear_rings = list(polygon)
    for ring in linear_rings:
        switched_ring = []
        points = list(ring)
        for point in points:
            switched_point = (point[1], point[0])
            switched_ring.append(switched_point)
        switched_poly.append(LinearRing(switched_ring))
    return Polygon(*switched_poly)
