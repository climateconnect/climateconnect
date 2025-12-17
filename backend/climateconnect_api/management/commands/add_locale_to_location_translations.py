import csv
import time
from pathlib import Path

import requests
from django.core.management.base import BaseCommand
from django.db.models import QuerySet
from tqdm import tqdm

from climateconnect_api.models.language import Language

#from django.db import transaction
from location.models import Location, LocationTranslation

NOMINATIM_DETAILS_URL = "https://nominatim.openstreetmap.org/lookup"
CUSTOM_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
MAPPING_TABLE_PATH = Path(__file__).parent / "osm_lookup_tables" / "mapping.csv"


def load_osm_mapping() -> dict[str, list[int]]:
    """
    Lädt die Mapping-Tabelle und gibt ein Dict zurück:
    osm_combination -> list of location_ids
    """
    mapping = {}
    if not MAPPING_TABLE_PATH.exists():
        print(f"warning: mapping table not found at {MAPPING_TABLE_PATH}")
        return mapping
    
    with open(MAPPING_TABLE_PATH, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            osm_combination = row["osm_combination"]
            location_ids_str = row["location_ids"]
            if location_ids_str:
                location_ids = [int(id_str) for id_str in location_ids_str.split(",")]
                mapping[osm_combination] = location_ids
    
    return mapping

def create_name_from_translation_data(original_location: Location, translation_data: dict) -> str:
        
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


def get_language_id(locale: str) -> int:
    
    try:
        language = Language.objects.get(language_code=locale.lower())
        return language.id
    
    except Exception as e:
        print(f"error: {e}")
        return None 


def translate_locations(locs: list["Location"], locale: str, osm_mapping: dict[str, list[int]]):

    if not locs:
        return 0

    language_id = get_language_id(locale)
    batch_size = 50

    locations_created_count = 0

    for i in tqdm(range(0, len(locs), batch_size)):

        batch_locations = locs[i:i + batch_size]
        osm_ids = set()
        unique_translations = {}


        for loc in batch_locations:
            if loc.osm_id and loc.osm_type:
                osm_type_letter = loc.osm_type[0].upper()
                if osm_type_letter is None:
                    print(f"invalid osm_type: {loc.osm_type}")
                    continue

                osm_string = f"{osm_type_letter}{loc.osm_id}"
                osm_ids.add(osm_string)
            elif not loc.osm_id:
                print(f"warning: location '{loc.name}' does not have osm_id")
            else:
                print(f"warning: location '{loc.name}' does not have osm_type")

        
        params = {
            'osm_ids': ",".join(osm_ids), 
            'format': 'json',
            'extratags': 1, 
            'addressdetails': 1,
            'accept-language': locale 
        }

        headers = {
        'User-Agent': CUSTOM_USER_AGENT
        }
        
        # Retry-Logic for Nominatim (503 errors may occur when too many requests are sent)
        max_retries = 3
        retry_delay = 5  
        data = None
        
        for attempt in range(max_retries):
            try:
                response = requests.get(NOMINATIM_DETAILS_URL, params=params, headers=headers, timeout=30)
                response.raise_for_status()
                data = response.json()
                break 
                
            except requests.exceptions.RequestException as e:
                if attempt < max_retries - 1:
                    wait_time = retry_delay * (attempt + 1) 
                    tqdm.write(f"Request failed (attempt {attempt + 1}/{max_retries}): {e}")
                    tqdm.write(f"Retrying in {wait_time} seconds...")
                    time.sleep(wait_time)
                else:
                    tqdm.write(f"error with batch request of {len(osm_ids)} osm_ids after {max_retries} attempts: {e}")
                    continue 
        
        if data is None:
            continue  
        
        time.sleep(1)

        for result in data:
            osm_type_letter = result.get('osm_type', '')[0].upper() if result.get('osm_type') else ''
            osm_id = result.get('osm_id')
            osm_class = result.get('class', '')
            osm_class_type = result.get('type', '')
            
            osm_combination = f"{osm_type_letter}{osm_id}-{osm_class}:{osm_class_type}"
            
            location_ids = osm_mapping.get(osm_combination, [])

            if not location_ids:
                print(f"warning: no mapping found for osm_combination: {osm_combination}")
                continue

            address = result.get('address', {})
            translation_data = {
                'name_translation': result.get('localname'),
                'city_translation': address.get('city') or address.get('town') or address.get('village'),
                'state_translation': address.get('state'),
                'country_translation': address.get('country'),
            }
            
            for loc_id in location_ids:
                name = translation_data['name_translation']
                if not name:
                    try:
                        loc = Location.objects.get(id=loc_id)
                        name = create_name_from_translation_data(loc, translation_data)
                        if not name:
                            name = loc.name
                    except Location.DoesNotExist:
                        continue
                
                unique_key = (loc_id, language_id)
                if unique_key not in unique_translations:
                    unique_translations[unique_key] = LocationTranslation(
                        location_id=loc_id,
                        language_id=language_id,
                        name_translation=name,
                        city_translation=translation_data.get('city_translation'),
                        state_translation=translation_data.get('state_translation'),
                        country_translation=translation_data.get('country_translation'),
                    )

        translations_to_create = list(unique_translations.values())

        if translations_to_create:
            try:
                LocationTranslation.objects.bulk_create(translations_to_create, ignore_conflicts=True)
                locations_created_count += len(translations_to_create)
            
            except Exception as e:
                 print(f"error: {e}")

    return locations_created_count
        

class Command(BaseCommand):
    help = "add translations of name into <locale> to LocationTranslation table"

    def add_arguments(self, parser):
        
        parser.add_argument(
            "locale",
            type=str,
            help="locale of the language that should be added to the LocationTranslation table"
        )
        
        parser.add_argument(
            "-n",
            "--number",
            type=int,
            help="limits number of translation for testing purposes",
            default=None
        )

    def handle(self, *args, **options) -> str:
        locale = options.get("locale")
        limit = options.get("number")
        language_id = get_language_id(locale)
        
        #find locations in DB that need to be translated
        if language_id is None:
            self.stdout.write(self.style.ERROR(f"language '{locale}' not found in database"))
            return

        # Load OSM Mapping-Table
        self.stdout.write(f"Loading OSM mapping table from {MAPPING_TABLE_PATH}...")
        osm_mapping = load_osm_mapping()
        if not osm_mapping:
            self.stdout.write(self.style.ERROR("OSM mapping table is empty or not found. Run map_type_id_class_to_location_id.py first."))
            return
        self.stdout.write(f"Loaded {len(osm_mapping)} OSM combinations.")
        
        locations_to_translate: QuerySet[Location] = Location.objects.exclude(
            translate_location__language_id=language_id
        )

        if limit is not None:
            locations_to_translate = locations_to_translate[:limit]

        locations_list = list(locations_to_translate)
        if not locations_list:
            self.stdout.write(self.style.SUCCESS(f"all {len(Location.objects.all())} locations already translated into '{locale}' with language_id: {language_id}."))
            return
        
        self.stdout.write(f"Translating {len(locations_list)} locations into '{locale}'...")
        
        #start translation job
        try:
            created_count = translate_locations(locations_list, locale, osm_mapping)
            self.stdout.write(self.style.SUCCESS(f"created {created_count} translations."))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"{e}"))

