import requests
from tqdm import tqdm

NOMINATIM_DETAILS_URL = "https://nominatim.openstreetmap.org/lookup"
CUSTOM_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"


class MockLocation:
    def __init__(
        self,
        id,
        name,
        osm_id,
        osm_type,
        place_name=None,
        exact_address=None,
        state=None,
        country=None,
        city=None,
    ):
        self.id = id
        self.name = name
        self.osm_id = osm_id
        self.osm_type = osm_type
        self.place_name = place_name
        self.exact_address = exact_address
        self.sate = state
        self.country = country
        self.city = city


class MockLocationTranslation:
    def __init__(
        self,
        location_id,
        language_id,
        name_translation,
        city_translation=None,
        state_translation=None,
        country_translation=None,
    ):
        self.location_id = location_id
        self.language_id = language_id
        self.name_translation = name_translation
        self.city_translation = city_translation
        self.state_translation = state_translation
        self.country_translation = country_translation


def create_mock_locations_all_equal() -> list[MockLocation]:
    mock_locs = []
    for i in range(20):
        loc = MockLocation(
            id=i,
            name="Paris, Île-de-France, France",
            osm_id=7444,
            osm_type="R",
            place_name="Paris",
            state="Île-de-France",
            country="France",
            exact_address="",
        )
        mock_locs.append(loc)
    return mock_locs


def get_language_id(locale: str) -> int:
    return 1


def create_name_from_translation_data(
    original_location: MockLocation, translation_data: dict
) -> str:

    name = []
    if original_location.place_name:
        name.append(original_location.place_name)

    if original_location.exact_address:
        name.append(original_location.exact_address)

    for key in ["city_translation", "state_translation", "country_translation"]:
        value = translation_data.get(key)
        if value:
            name.append(value)

    return ", ".join(name)


def parse_full_osm_type(type: str) -> str:
    if type == "R":
        return "relation"
    elif type == "N":
        return "node"
    elif type == "W":
        return "way"
    else:
        return None


def translate_locations(locs: list[MockLocation], locale: str):

    language_id = get_language_id(locale)
    batch_size = 10

    locations_created_count = 0

    for i in tqdm(range(0, len(locs), batch_size)):

        batch_locations = locs[i : i + batch_size]
        osm_ids = set()
        location_map = {}
        unique_translations = {}

        # debugging
        received_osm_ids = set()
        missing_locs = set()

        for loc in batch_locations:
            if loc.osm_id and loc.osm_type:
                osm_type_full = parse_full_osm_type(loc.osm_type)
                osm_type_letter = loc.osm_type[0].upper()
                if osm_type_letter is None or osm_type_full is None:
                    print(f"invalid osm_type: {loc.osm_type}")
                osm_string = f"{osm_type_letter}{loc.osm_id}"
                osm_ids.add(osm_string)

                osm_id_keymap = f"{osm_type_full}{loc.osm_id}"
                location_map[osm_id_keymap] = loc
            elif not loc.osm_id:
                print(f"warning: location '{loc.name}' does not have osm_id")
            else:
                print(f"warning: location '{loc.name}' does not have osm_type")

        params = {
            "osm_ids": ",".join(osm_ids),
            "format": "json",
            "extratags": 1,
            "addressdetails": 1,
            "accept-language": locale,
        }

        headers = {"User-Agent": CUSTOM_USER_AGENT}

        try:
            response = requests.get(
                NOMINATIM_DETAILS_URL, params=params, headers=headers
            )
            response.raise_for_status()
            data = response.json()

        except requests.exceptions.RequestException as e:
            print(f"error with batch request of {len(osm_ids)} osm_ids: {e}")
            return locations_created_count, missing_locs

        for result in data:
            osm_id_key = f"{result.get('osm_type')}{result.get('osm_id')}"
            loc = location_map.get(osm_id_key)

            if not loc:
                print(
                    f"warning: something went wrong with the evaluation of request with osm_id: {osm_id_key}"
                )
                continue

            received_osm_ids.add(
                f"{result.get('osm_type')[0].upper()}{result.get('osm_id')}"
            )

            address = result.get("address", {})
            one_translation_data = {}

            one_translation_data["name_translation"] = result.get("localname")
            one_translation_data["city_translation"] = (
                address.get("city") or address.get("town") or address.get("village")
            )
            one_translation_data["state_translation"] = address.get("state")
            one_translation_data["country_translation"] = address.get("country")

            if not one_translation_data["name_translation"]:
                one_translation_data["name_translation"] = (
                    create_name_from_translation_data(loc, one_translation_data)
                )
                if not one_translation_data["name_translation"]:
                    one_translation_data["name_translation"] = loc.name

            locationTranslation = MockLocationTranslation(
                location_id=loc.id,
                language_id=language_id,
                name_translation=one_translation_data["name_translation"],
                city_translation=one_translation_data.get("city_translation"),
                state_translation=one_translation_data.get("state_translation"),
                country_translation=one_translation_data.get("country_translation"),
            )

            unique_key = (loc.id, language_id)
            if unique_key not in unique_translations:
                unique_translations[unique_key] = locationTranslation

            translations_to_create = list(unique_translations.values())

            # debugging start
            missing_osm_ids = osm_ids - received_osm_ids
            osm_string_to_location = {
                f"{loc.osm_type[0].upper()}{loc.osm_id}": loc
                for loc in batch_locations
                if loc.osm_type
            }
            for missing_osm in missing_osm_ids:
                missing_loc = osm_string_to_location.get(missing_osm)
                missing_locs.add(missing_loc)

            # debugging end

        if translations_to_create:
            try:
                # MockLocationTranslation.objects.bulk_create(translations_to_create, ignore_conflicts=True)
                locations_created_count += len(translations_to_create)
                # tqdm.write(f"successfully saved {len(translations_data)} for batch {i // 50 + 1}")

            except Exception as e:
                print(f"error: {e}")

    return locations_created_count, missing_locs


test_locations = create_mock_locations_all_equal()
created_count, missing = translate_locations(test_locations, "de")
print(f"created {created_count} translations")
if missing:
    missing_list = [str(loc.id) for loc in missing if loc]
    print(f"Missing locations for IDs: {', '.join(missing_list)}")
