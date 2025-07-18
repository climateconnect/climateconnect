from django.core.management.base import BaseCommand
from hubs.models.hub import HubThemeColor, HubTheme
from climateconnect_api.models.language import Language
from organization.models import Sector
from hubs.models import Hub


class Command(BaseCommand):
    help = "Create a set of hubs"

    def handle(self, *args, **kwargs):
        hubs = [
            {
                "name": "Perth and Kinross",
                "url_slug": "perth-and-kinross",
                "headline": "Perth and Kinross Network",
                "sub_headline": "Connecting Perth and Kinross",
                "description": "A network of hubs in Perth and Kinross.",
                "welcome_message_logged_in": "Welcome to the Perth and Kinross Network!",
                "welcome_message_logged_out": "Welcome to the Perth and Kinross Network! Please log in to explore.",
                "hub_type": Hub.LOCATION_HUB_TYPE,
                "segway_text": "Explore the Perth and Kinross Network",
                "image_attribution": "Photo by Perth and Kinross",
                "image_path": "res/perth_kinross/hub.jpg",
                "icon_path": "res/perth_kinross/hub-icon.png",
                "icon_background_color": "#DDDDDD",
                "thumbnail_image_path": "res/perth_kinross/hub.jpg",
                "importance": 0,
                "sectors": None,
                "language": "en",
                # "location": has to be set manually, if the
                # landing_page_component TODO
                "parent_hub": None,
            },
            # Network Climate Cafés
            {
                "name": "Climate Cafés",
                "url_slug": "perth-climate-cafes",
                "headline": "Perth Climate Cafés",
                "sub_headline": "The Climate Cafés in Perth",
                "description": "A network of climate cafés in Perth.",
                "welcome_message_logged_in": "Welcome to the Perth Climate Cafés!",
                "welcome_message_logged_out": "Welcome to the Perth Climate Cafés! Please log in to explore.",
                "hub_type": Hub.SECTOR_HUB_TYPE,
                "segway_text": "Explore the Perth Climate Cafés",
                "image_attribution": "Photo by Perth Energy",
                "image_path": "res/perth_kinross/energy.jpg",
                "icon_path": "res/perth_kinross/energy-icon.png",
                "icon_background_color": "#2BAD70",
                "thumbnail_image_path": "res/perth_kinross/energy.jpg",
                "importance": 0,
                "sectors": "climate-cafes",
                "language": "en",
                # landing_page_component TODO
                "parent_hub": "perth-and-kinross",
            },
            # Network Food
            {
                "name": "Food Network",
                "url_slug": "perth-food",
                "headline": "Perth Food Network",
                "sub_headline": "Connecting food hubs in Perth",
                "description": "A network of food hubs in Perth.",
                "welcome_message_logged_in": "Welcome to the Perth Food Network!",
                "welcome_message_logged_out": "Welcome to the Perth Food Network! Please log in to explore.",
                "hub_type": Hub.SECTOR_HUB_TYPE,
                "segway_text": "Explore the Perth Food Network",
                "image_attribution": "Photo by Perth Food",
                "image_path": "res/perth_kinross/food.jpg",
                "icon_path": "res/perth_kinross/food-icon.png",
                "icon_background_color": "#476B84",
                "thumbnail_image_path": "res/perth_kinross/food.jpg",
                "importance": 0,
                "sectors": "food",
                "language": "en",
                # landing_page_component TODO
                "parent_hub": "perth-and-kinross",
            },
            # Network Nature
            {
                "name": "Nature Network",
                "url_slug": "perth-nature",
                "headline": "Perth Nature Network",
                "sub_headline": "Connecting nature hubs in Perth",
                "description": "A network of nature hubs in Perth.",
                "welcome_message_logged_in": "Welcome to the Perth Nature Network!",
                "welcome_message_logged_out": "Welcome to the Perth Nature Network! Please log in to explore.",
                "hub_type": Hub.SECTOR_HUB_TYPE,
                "segway_text": "Explore the Perth Nature Network",
                "image_attribution": "Photo by Perth Nature",
                "image_path": "res/perth_kinross/nature.jpg",
                "icon_path": "res/perth_kinross/nature-icon.png",
                "icon_background_color": "#327F60",
                "thumbnail_image_path": "res/perth_kinross/nature.jpg",
                "importance": 0,
                "sectors": "nature",
                "language": "en",
                # landing_page_component TODO
                "parent_hub": "perth-and-kinross",
            },
            # Network Transport
            {
                "name": "Transport Network",
                "url_slug": "perth-transport",
                "headline": "Perth Transport Network",
                "sub_headline": "Connecting transport hubs in Perth",
                "description": "A network of transport hubs in Perth.",
                "welcome_message_logged_in": "Welcome to the Perth Transport Network!",
                "welcome_message_logged_out": "Welcome to the Perth Transport Network! Please log in to explore.",
                "hub_type": Hub.SECTOR_HUB_TYPE,
                "segway_text": "Explore the Perth Transport Network",
                "image_attribution": "Photo by Perth Transport",
                "image_path": "res/perth_kinross/transport.jpg",
                "icon_path": "res/perth_kinross/transport-icon.png",
                "icon_background_color": "#2BA5B3",
                "thumbnail_image_path": "res/perth_kinross/transport.jpg",
                "importance": 0,
                "sectors": "transport",
                "language": "en",
                # landing_page_component TODO
                "parent_hub": "perth-and-kinross",
            },
            # Network Zero Waste
            {
                "name": "Zero Waste Network",
                "url_slug": "perth-zero-waste",
                "headline": "Perth Zero Waste Network",
                "sub_headline": "Connecting zero waste hubs in Perth",
                "description": "A network of zero waste hubs in Perth.",
                "welcome_message_logged_in": "Welcome to the Perth Zero Waste Network!",
                "welcome_message_logged_out": "Welcome to the Perth Zero Waste Network! Please log in to explore.",
                "hub_type": Hub.SECTOR_HUB_TYPE,
                "segway_text": "Explore the Perth Zero Waste Network",
                "image_attribution": "Photo by Perth Zero Waste",
                "image_path": "res/perth_kinross/zero_waste.jpg",
                "icon_path": "res/perth_kinross/zero_waste-icon.png",
                "icon_background_color": "#9ECD90",
                "thumbnail_image_path": "res/perth_kinross/zero_waste.jpg",
                "importance": 0,
                "sectors": "zero_waste",
                "language": "en",
                # landing_page_component TODO
                "parent_hub": "perth-and-kinross",
            },
            # Network Energy
            {
                "name": "Energy Network",
                "url_slug": "perth-energy",
                "headline": "Perth Energy Network",
                "sub_headline": "Connecting energy hubs in Perth",
                "description": "A network of energy hubs in Perth.",
                "welcome_message_logged_in": "Welcome to the Perth Energy Network!",
                "welcome_message_logged_out": "Welcome to the Perth Energy Network! Please log in to explore.",
                "hub_type": Hub.SECTOR_HUB_TYPE,
                "segway_text": "Explore the Perth Energy Network",
                "image_attribution": "Photo by Perth Energy",
                "image_path": "res/perth_kinross/energy.jpg",
                "icon_path": "res/perth_kinross/energy_icon.png",
                "icon_background_color": "#7C7692",
                "thumbnail_image_path": "res/perth_kinross/energy.jpg",
                "importance": 0,
                "sectors": "energy",
                "language": "en",
                # landing_page_component TODO
                "parent_hub": "perth-and-kinross",
            },
        ]

        for hub_data in hubs:

            # get the related sector
            sector = None
            if hub_data.get("sectors"):
                sector_key = hub_data["sectors"]
                sector = Sector.objects.filter(name=sector_key).first()

            language = Language.objects.filter(code=hub_data["language"]).first()

            hub, _ = Hub.objects.get_or_create(
                url_slug=hub_data["url_slug"],
                name=hub_data["name"],
                headline=hub_data["headline"],
                sub_headline=hub_data["sub_headline"],
                description=hub_data["description"],
                welcome_message_logged_in=hub_data["welcome_message_logged_in"],
                welcome_message_logged_out=hub_data["welcome_message_logged_out"],
                hub_type=hub_data["hub_type"],
                segway_text=hub_data["segway_text"],
                image_attribution=hub_data["image_attribution"],
                # TODO: fix images
                image_path=hub_data["image_path"],
                icon_path=hub_data["icon_path"],
                icon_background_color=hub_data["icon_background_color"],
                thumbnail_image_path=hub_data["thumbnail_image_path"],
                importance=hub_data["importance"],
                sectors=sector,
                language=language,
            )

            # TODO: translations
            # TODO: ambassador

            # setup the colors for the hub:
            main, _ = HubThemeColor.objects.get_or_create(
                name="Perth Main",
                main="#9DCC8F",
                light="#EFF5F2",
                extraLight="#EFF5F2",
                contrastText="#000033",
            )

            secondary, _ = HubThemeColor.objects.get_or_create(
                name="Perth Secondary",
                main="#476B84",
                light="#476B84",
                extraLight="#476B84",
                contrastText="#F8F8F8",
            )

            background, _ = HubThemeColor.objects.get_or_create(
                name="Perth Background",
                main="#FFFFFF",
                light="#FFFFFF",
                extraLight="#FFFFFF",
                contrastText="#000033",
            )

            perth_hub = Hub.objects.filter(url_slug="perth-and-kinross").first()

            HubTheme.objects.get_or_create(
                hub=perth_hub,
                primary=main,
                secondary=secondary,
                background_default=background,
            )
