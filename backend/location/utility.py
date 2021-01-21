from rest_framework.exceptions import ValidationError
from location.models import Location
from django.contrib.gis.geos import (MultiPolygon, Polygon)


def get_location(location_object):
    required_params = [
        'osm_id', 
        'place_id', 
        'city',
        'state',
        'country',
        'name',
        'polygon'
    ]
    for param in required_params:
        if param not in location_object:
            raise ValidationError('Required parameter is missing')
    loc = Location.objects.filter(place_id=location_object['place_id'])
    if loc.exists():
        return loc[0]
    else:
        multipolygon_raw = location_object['polygon']
        polygons = []
        for poly in multipolygon_raw:
            polygon = Polygon(poly)
            polygons.append(polygon)
            print(polygon)
            print("----")
            print(poly)
        multipolygon = MultiPolygon(polygons)
        loc = Location.objects.create(
            osm_id=location_object['osm_id'],
            place_id=location_object['place_id'],
            city=location_object['city'],
            state=location_object['state'],
            country=location_object['country'],
            name=location_object['name'],
            multi_polygon=multipolygon,
            main_polygon=polygons[0]
        )
        return loc