import requests

LOCATIONS_URL = "https://nominatim.openstreetmap.org/lookup"
HEADERS = {"User-Agent": "DjangoProjekt/1.0 (<someone>@climateconnect.earth)"}
params = {"osm_ids": "R7444", "format": "json", "extratags": 0}

response = requests.get(LOCATIONS_URL, params=params, headers=HEADERS, timeout=20)

response.raise_for_status()
data = response.json()

print(data[0])