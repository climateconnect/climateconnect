from hubs.models.hubs_translation import HubStatTranslation, HubTranslation
from hubs.models.hub import Hub, HubStat
from climateconnect_api.models import Language
from typing import Any
from django.core.management.base import BaseCommand

hub_translations = [
    {
        "url_slug": "land_use",
        "name_translation": "Forst - und Landwirtschaft",
        "headline_translation": "Klimafreundliche Forst- und Landwirtschaft",
        "sub_headline_translation": "Wie wir unser Klima retten können, indem wir die Art und Weise ändern, wie wir unser Land nutzen",
        "segway_text_translation": "",
        "image_attribution_translation": "",
        "quick_info_translation": "Wir haben das Potenzial, aktiv zu werden und das Land unseres Planeten wieder \
            nachhaltig zu nutzen. Von Permakultur, regenerativer Landwirtschaft und anderen nachhaltigen Anbaumethoden \
            bis hin zum Pflanzen von Bäumen durch Software und dem Schutz unserer Wälder. Auf dieser Seite sehen sie, \
            an welchen Klimaschutz-Projekten und Lösungen Climate Connect Nutzer im Bereich Forst- und Landwirtschaft \
            arbeiten.",
        "stat_box_title_translation": "Forst- und Landwirtschaft sind verantwortlich für",
        "target_language": "de",
    },
    {
        "url_slug": "energy",
        "name_translation": "Energie",
        "headline_translation": "Klimafreundliche Energieerzeugung",
        "sub_headline_translation": "Wie man den Klimawandel mit erneuerbaren Energien löst",
        "segway_text_translation": ".",
        "image_attribution_translation": "",
        "quick_info_translation": "Elektrizität und Heizung betreiben die Welt. Wir brauchen sie für alles, \
            von unserem Transportsystem über das Heizen und Betreiben unserer Häuser bis hin zum Aufbau von \
            Infrastruktur sowie für alle Industriezweige. Im Moment verlassen wir uns hauptsächlich auf \
            fossile Energiequellen wie Öl, Kohle und Gas und setzen dabei CO² aus dem Boden frei, das dort \
            seit Millionen von Jahren eingeschlossen war. Wenn wir den Klimawandel stoppen wollen, müssen \
            wir so schnell wie möglich auf erneuerbare und nachhaltige Energiequellen umsteigen. Zum Glück \
            gibt es viele kluge Köpfe, die zum Beispiel daran arbeiten, den Anteil der erneuerbaren Energien \
            zu erhöhen und gleichzeitig dafür zu sorgen, dass unsere Stromnetze trotz der Unbeständigkeit \
            der erneuerbaren Energien stabil bleiben.",
        "stat_box_title_translation": "Energie(erzeugung) ist verantwortlich für",
        "target_language": "de",
    },
    {
        "url_slug": "food",
        "name_translation": "Ernährung",
        "headline_translation": "Klimafreundliche Ernährung",
        "sub_headline_translation": "Auswirkungen unserer Ernährungsweise auf den Klimawandel",
        "segway_text_translation": "Wir haben die Macht, zu handeln und die Klimawirkung unserer Ernährung zu \
            verkleinern. Von der Senkung des Lebensmittelabfalls über die nachhaltigere Produktion von Lebensmitteln \
            bis hin zur Förderung nachhaltigerer Ernährungsweisen wie dem Veganismus. Weiter unten findest du \
            Klimaprojekte im Bereich Ernährung, an denen Climate Connect Nutzer*innen arbeiten",
        "image_attribution_translation": "",
        "quick_info_translation": "Die Art und Weise, wie wir uns derzeit ernähren, schadet sowohl den Menschen als \
            auch dem Planeten, und wir müssen handeln, bevor es zu spät ist. Man könnte meinen, dass wir nicht viel \
            dagegen tun können, weil wir alle essen müssen. Aber wir könnten mehr Menschen ernähren und gleichzeitig \
            die durch Lebensmittel verursachten Emissionen und den Flächenverbrauch drastisch reduzieren. Es gibt \
            viele kluge Leute, die an Lösungen arbeiten, um die negativen Auswirkungen unseres Essens zu reduzieren. \
            Schon heute gibt es tolle Projekte, um Lebensmittel klimafreundlicher zu produzieren, \
            Lebensmittelverschwendung zu vermeiden und nachhaltigere Ernährungsweisen wie Veganismus zu fördern.",
        "stat_box_title_translation": "Essen ist verantwortlich für",
        "target_language": "de",
    },
    {
        "url_slug": "education",
        "name_translation": "Bildung und Öffentlichkeitsarbeit",
        "headline_translation": "Bildung und Öffentlichkeitsarbeit zum Klimaschutz",
        "sub_headline_translation": "Wirkungsvolle Wege, um über den Klimawandel zu informieren und Druck zum Handeln zu erzeugen",
        "segway_text_translation": "",
        "image_attribution_translation": "Holli | shutterstock.com",
        "quick_info_translation": "Positive Veränderungen werden nicht stattfinden, wenn die Gesellschaft nicht über \
            den Klimawandel aufgeklärt werden. Klimabildung und Druck auf die Mächtigen, die Handeln könnten, sind \
            essenziell für die Rettung unseres Planeten. Junge Menschen sind sich mehr und mehr des Klimawandels und \
            der Auswirkungen auf unsere Zukunft bewusst. Es gibt viele Menschen, die großartige Arbeit leisten, um die \
            Öffentlichkeit über den Klimawandel aufzuklären und Druck auf die Politiker auszuüben, damit sie handeln.",
        "stat_box_title_translation": "Bewusstsein zum Klimawandel",
        "target_language": "de",
    },
    {
        "url_slug": "transportation",
        "name_translation": "Mobilität",
        "headline_translation": "Klimafreundliche Mobilität",
        "sub_headline_translation": "Wie wir mit unseren Fortbewegungsmitteln das Klima beeinflussen",
        "segway_text_translation": "",
        "image_attribution_translation": "",
        "quick_info_translation": "Die meisten unserer verkehrsbedingten Treibhausgasemissionen (THG) stammen aus der \
            Verbrennung von Kraftstoff. Insgesamt ist der Transportsektor (Individual- und Güterverkehr) für 16 % der \
            gesamten THG-Emissionen verantwortlich. Der Straßenverkehr ist für den größten Teil davon verantwortlich \
            (12 %), aber Flugzeuge sind die größten Verursacher pro km/Passagier. Wie können wir in einer globalisierten \
            Welt wie der unseren die Klimaauswirkungen des Verkehrs senken?",
        "stat_box_title_translation": "Mobilität ist verantwortlich für",
        "target_language": "de",
    },
    {
        "url_slug": "fashion",
        "name_translation": "Nachhaltige Mode",
        "headline_translation": "Klimafreundliche und nachhaltige Mode",
        "sub_headline_translation": "Wie wir die Modebranche klimafreundlicher machen können",
        "segway_text_translation": ".",
        "image_attribution_translation": "",
        "quick_info_translation": "Klamotten einkaufen ist eine der Lieblingsbeschäftigungen unserer Zeit. Es ist zu einem \
            natürlichen Instinkt geworden, so wie es ist, uns mit Kleidung zu bedecken. Der Kaufreiz ist so mächtig, dass er \
            sich auf alles anwenden lässt, und angetrieben durch unsere auf endlosem Wachstum und Konsum basierende \
            Gesellschaft außer Kontrolle geraten ist.\
            \
            \
            Erst in jüngster Zeit haben wir begonnen anzuerkennen, dass die Umweltauswirkungen der Modeindustrie weit \
            verbreitet und erheblich sind. Glücklicherweise gibt es viele großartige Lösungen für eine nachhaltigere Modeindustrie.",
        "stat_box_title_translation": "Mode ist verantwortlich für",
        "target_language": "de",
    },
    {
        "url_slug": "erlangen",
        "name_translation": "Erlangen",
        "headline_translation": "Climate action in Erlangen",
        "sub_headline_translation": "Here, climate actors, interested citizens and activists can find climate solutions from Erlangen.",
        "segway_text_translation": ".",
        "image_attribution_translation": "",
        "quick_info_translation": "This is where the ClimateHub Erlangen comes into being. We are in Early Access, which \
            means that the page can only be accessed with the link. All content can already be created by you, so that \
            there is already a lot to discover at the official launch.",
        "stat_box_title_translation": "Erlangen 2020",
        "target_language": "en",
    },
]

hub_stat_translations = [
    {
        "name": "CO2 emissions percentage of transportation",
        "name_translation": "Durch Mobilität ausgestoßener Anteil an Treibhausgasen in %",
        "value_translation": "16,2%",
        "value_description_translation": "der globalen Treibhausgas-Emissionen",
        "description_translation": "enthält nicht die Emissionen der Herstellung von Fahrzeugen",
        "source_name_translation": "ourworldindata.org",
        "target_language": "de",
    },
    {
        "name": "Erlangen CO2",
        "name_translation": "Erlangen CO2",
        "value_translation": "24%",
        "value_description_translation": "weniger CO2-Emissionen als 1990 ausgestoßen",
        "description_translation": "",
        "source_name_translation": "www.erlangen.de",
        "target_language": "en",
    },
    {
        "name": "GHGs % emission from fashion",
        "name_translation": "Durch Mode ausgestoßener Anteil an Treibhausgasen in %",
        "value_translation": "10%",
        "value_description_translation": "der globalen Treibhausgas-Emissionen",
        "description_translation": "",
        "source_name_translation": "World Bank",
        "target_language": "de",
    },
    {
        "name": "Climate change awareness",
        "name_translation": "Bewusstsein über den Klimawandel",
        "value_translation": "67%",
        "value_description_translation": "der Menschen sehen den Klimawandel als eine große Bedrohung",
        "description_translation": "",
        "source_name_translation": "Pew Research Center",
        "target_language": "de",
    },
    {
        "name": "Energy GHG emissions",
        "name_translation": "Durch Energieverbrauch ausgestoßener Anteil an Treibhausgasen in %",
        "value_translation": "73.2%",
        "value_description_translation": "of global greenhouse gas emissions",
        "description_translation": "Dies enthält Energieverbrauch durch Mobilität, Industrie and Gebäude",
        "source_name_translation": "ourworldindata.org",
        "target_language": "de",
    },
    {
        "name": "CO2 emissions of agriculture, forestry and land use",
        "name_translation": "Durch Forst- und Landwirtschaft ausgestoßener Anteil an Treibhausgasen in %",
        "value_translation": "18.4%",
        "value_description_translation": "der globalen Treibhausgas-Emissionen",
        "description_translation": "Dies überlappt mit dem Ernährungs-Hub",
        "source_name_translation": "ourworldindata.org",
        "target_language": "de",
    },
    {
        "name": "Percentage of global habitable land used for food",
        "name_translation": "Prozentsatz an bewohnbarem Land, das für Essen genutzt wird",
        "value_translation": "50%",
        "value_description_translation": "des globalen bewohnbaren Land",
        "description_translation": "Dies überlappt mit dem Ernährungs-Hub",
        "source_name_translation": "ourworldindata.org",
        "target_language": "de",
    },
    {
        "name": "CO2 emissions percentage of food",
        "name_translation": "Durch Ernährung ausgestoßener Anteil an Treibhausgasen in %",
        "value_translation": "26%",
        "value_description_translation": "der globalen Treibhausgas-Emissionen",
        "description_translation": "Dies überlappt mit den Emissionen des Landwirtschaftsbereich",
        "source_name_translation": "ourworldindata.org",
        "target_language": "de",
    },
]


def translate_hubs(hubs):
    print("{} hubs to translate".format(hubs.count()))
    for hub in hubs:
        print(hub.url_slug)
        translation = [tn for tn in hub_translations if tn["url_slug"] == hub.url_slug][
            0
        ]
        if translation:
            HubTranslation.objects.create(
                hub=hub,
                language=Language.objects.get(
                    language_code=translation["target_language"]
                ),
                name_translation=translation["name_translation"],
                headline_translation=translation["headline_translation"],
                sub_headline_translation=translation["sub_headline_translation"],
                segway_text_translation=translation["segway_text_translation"],
                image_attribution_translation=translation[
                    "image_attribution_translation"
                ],
                quick_info_translation=translation["quick_info_translation"],
                stat_box_title_translation=translation["stat_box_title_translation"],
            )
            print("successfully translationed hub {}".format(hub.url_slug))


def translate_hub_stats(hub_stats):
    print("{} hub stats to translate".format(hub_stats.count()))
    for hub_stat in hub_stats:
        translation = [
            tn for tn in hub_stat_translations if tn["name"] == hub_stat.name
        ][0]
        if translation:
            HubStatTranslation.objects.create(
                hub_stat=hub_stat,
                language=Language.objects.get(
                    language_code=translation["target_language"]
                ),
                name_translation=translation["name_translation"],
                value_translation=translation["value_translation"],
                value_description_translation=translation[
                    "value_description_translation"
                ],
                description_translation=translation["description_translation"],
                source_name_translation=translation["source_name_translation"],
            )
            print("successfully translationed hub stat {}".format(hub_stat.name))


class Command(BaseCommand):
    help = "Add german hub translations for all existing hubs"

    def handle(self, *args: Any, **options: Any) -> None:
        hubs = Hub.objects.filter(translate_hub=None)
        hub_stats = HubStat.objects.filter(translation_hub_stat=None)
        translate_hubs(hubs)
        translate_hub_stats(hub_stats)
