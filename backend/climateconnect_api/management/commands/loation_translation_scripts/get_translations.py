import requests
#from location.models import Location


class MockLocation:
    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)


NOMINATIM_DETAILS_URL = "https://nominatim.openstreetmap.org/lookup"
CUSTOM_USER_AGENT = "DjangoProjekt/1.0 (katharina.auer@climateconnect.earth)"

def create_name_from_translation_data(original_location: MockLocation, translation_data: dict) -> str:
        
    name = []
    if original_location.place_name:
        name.append(original_location.place_name)
        
    if original_location.exact_address:
        name.append(original_location.exact_address)
    
    for key in ['city_translation', 'state_translation', 'country_translation']:
        value = translation_data.get(key)
        if value:
            name.append(value)
        
            
    return ", ".join(name)




def get_translations(loc: MockLocation, locale: str) -> dict | None:
    
    if not loc.osm_id or not loc.osm_type:
        return None

    osm_string = f"{loc.osm_type}{loc.osm_id}"

    params = {
        'osm_ids': [osm_string],
        'format': 'json',
        'extratags': 1, 
        'addressdetails': 1,
        'accept-language': locale
    }

    headers = {
        'User-Agent': CUSTOM_USER_AGENT
    }

    try:
        response = requests.get(NOMINATIM_DETAILS_URL, params=params, headers=headers, timeout=10)
        response.raise_for_status()
        data = response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error at osm_id: {loc.osm_type}{loc.osm_id}: {e}")
        return None

    # Nominatim supplies translations in 'localname' fields.
    translation_data = {}
    address = data[0].get('address', {})
    translation_data['name_translation'] = data[0].get('localname')
    translation_data['city_translation'] = address.get('city') or address.get('town') or address.get('village')
    translation_data['state_translation'] = address.get('state')
    translation_data['country_translation'] = address.get('country')
    
    if translation_data["name_translation"] is None:
        translation_data['name_translation'] = create_name_from_translation_data(loc, translation_data)

    return translation_data


mock1 = MockLocation(
    place_name=None,
    exact_address=None,
    osm_id=7444,
    osm_type='R'
)
mock2 = MockLocation(
    place_name=None,
    exact_address=None,
    osm_id=17529,
    osm_type='R'
)
mock3 = MockLocation(
    place_name='Kunst- und Kreativhaus Rechenzentrum',
    exact_address='Dortustraße 46',
    osm_id=33201,
    osm_type='R'
)
mock4 = MockLocation(
    place_name=None,
    exact_address=None,
    osm_id=54413,
    osm_type='R'
)
mock5 = MockLocation(
    place_name='Stadtbücherei Würzburg',
    exact_address='Marktplatz 9',
    osm_id=259774388,
    osm_type='N'
)

test_data = [mock1, mock2, mock3, mock4, mock5]

for td in test_data:
    print(get_translations(td, 'fr'))
