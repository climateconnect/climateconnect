# Django imports
from django.conf import settings

# Third party imports
from googlemaps import Client as maps_client


def get_geo_location(location: str) -> dict:
    maps = maps_client(key=settings.GOOGLE_MAPS_API_KEY)

    # Now get geocode result for the provided location
    # TODO [Maybe?]: Add check on location. 
    geo_location = maps.geocode(location)

    return {
        'location': geo_location[0]['formatted_address'],
        'latitude': geo_location[0]['geometry']['location']['lat'],
        'longitude': geo_location[0]['geometry']['location']['lng']
    }
