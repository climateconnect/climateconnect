import { getFashionHubDescription } from "./hubDescriptions/fashion";
import { getFoodHubDescription } from "./hubDescriptions/food";

export default function getHubTexts({ hubName, hubAmbassador }) {
  const generalHubTexts = {
    search_for_solutions_in_sector: {
      en: "Search for climate solutions in the " + hubName + " sector",
      de: "Durchsuche Klimaschutzprojekte im Bereich " + hubName,
      fr: "Rechercher des solutions environnementales dans le secteur " + hubName
    },
    search_projects_in_location: {
      en: "Search climate projects in " + hubName,
      de: "Suche Klimaprojekte in " + hubName,
      fr: "Chercher des projets environnmentaux dans " + hubName
    },
    search_ideas_in_location: {
      en: "Find inspiring climate ideas from " + hubName,
      de: "Finde inspirierende Klimaschutz-Ideen aus " + hubName,
      fr: "Trouve des idées inspirantes pour la protection du climat dans" +hubName
    },
    search_for_organizations_in_sector: {
      en: "Search for climate organizations in the " + hubName + " sector",
      de: "Durchsuche Klimaschutzorganisationen im Bereich " + hubName,
      fr: "Trouver des organisations environnementales dans le secteur de " + hubName
    },
    search_organization_in_location: {
      en: "Search organizations in " + hubName,
      de: "Suche Organisationen in " + hubName,
      fr: "Rechercher une organisation dans" + hubName
    },
    search_profiles_in_location: {
      en: "Search climate actors in " + hubName,
      de: "Suche Klimaschützer*innen in " + hubName,
      fr: "Rechercher des acteurs.ices environnementaux dans" + hubName
    },
    more_info_about_hub_coming_soon: {
      en:
        "More Info coming soon! Have a look at the projects and solutions submitted by Climate Connect users below!",
      de:
        "Mehr Infos kommen in Kürze! Schau dir unten die Projekte und Lösungen an, die von Climate Connect Nutzern erstellt wurden!",
      fr: 
        "Plus d'informations arrivent bientôt! Jette un oeil en attendant aux projets et solutions portés par la communauté de Climate Connect!"
    },
    less_info: {
      en: "Less Info",
      de: "Weniger Infos",
      fr: "Plus d'informations"
    },
    more_info: {
      en: "More Info",
      de: "Mehr Infos",
      fr: "Plus d'infos"
    },
    show_projects: {
      en: "Show Projects",
      de: "Zeige Projekte",
      fr: "Voir les projets"
    },
    browse_explainer_text: {
      en: "Find impactful climate change solutions created by Climate Connect users.",
      de: "Finde wirksame Klimaschutzprojekte von anderen Climate Connect Nutzer:innen.",
      fr: "Voir les solutions environnementalse des autres membres de Climate Connect"
    },
    loading_chart: {
      en: "Loading Chart",
      de: "Lade Diagramm",
      fr: "Chargement du graphique"
    },
    climate_action_hubs: {
      en: "Climate Action Hubs",
      de: "Klimaschutz Hubs",
      fr: "Hub Action Climat"
    },
    hubs_overview_image_alt: {
      en: "Beautiful flat landscape with many hot air balloons taking off",
      de: "Schöne flache Landschaft mit vielen abhebenden Heißluftballons",
      fr: "Beau paysage plat avec de nombreuses montgolfières qui décollent"
    },
    find_climate_solutions_in_each_hub: {
      en: "Find climate solutions in each hub",
      de: "Finde Klima-Lösungen in jedem Hub",
      fr: "Trouver des solutions environnementales dans chaque hub"
    },
    find_the_best_ways_to_tackle_climate_change_in_each_sector: {
      en: "Find the best ways to tackle climate change in each sector",
      de: "Finde die besten Wege, den Klimawandel in jedem Bereich zu bekämpfen",
      fr: "Trouver les meilleurs façons de battre le changement climatique dans chaque secteur"
    },
    hubs_overview_mobile_explainer_text: {
      en:
        "Find information and concrete solutions on how to effectively fight climate change in each sector.",
      de:
        "Finde Informationen und konkrete Lösungen wie Klimawandel in jedem Bereich effektiv bekämpft werden kann.",
      fr: 
        "Trouver des informations et des solutions concrétes sur comment efficacement combattre le changement climatique dans chaque secteur"
    },
    hubs_overview_largescreen_explainer_text_first_part: {
      en: `On the hub pages you can find information on how to effectively fight climate change in each
        sector. You can find concrete and impactful solutions created by Climate Connect users. Get
        inspired and see possible actions how to fight climate change and get involved in a project
        you like. Who knows, maybe you will even find a really cool project that is already working
        great somewhere else and can reproduce it in your home town! Contact the solutions'
        creators directly on the solutions' pages to start a conversation!`,
      de: `In den Hubs findest du Informationen, wie der Klimawandel in jedem Bereich bekämpft werden kann.
        Dort findest du konkrete und wirkungsvolle Lösungen, die von Climate Connect Nutzern erstellt wurden.
        Lass dich inspirieren, finde Aktionen, die zeigen, wie du den Klimawandel bekämpfen kannst und
        engagiere dich in einem Projekt, das dir gefällt. Wer weiß, vielleicht findest du ja auch ein richtig cooles
        Projekt, das woanders schon erfolgreich ist und du kannst es in deiner Stadt reproduzieren! Kontaktiere
        die Projektersteller direkt über die Projektseite und tausche dich mit Ihnen aus!`,
        fr: `Dans les hubs, tu trouveras des informations sur la manière dont le changement climatique peut être 
        combattu dans chaque domaine. Tu y trouveras des solutions concrètes et efficaces créées par les 
        utilisateurs.ices de Climate Connect. Laisse-toi inspirer, trouve des actions qui montrent comment 
        tu peux lutter contre le changement climatique et engage-toi dans un projet qui te plaît. 
        Tu trouveras peut-être ce projet vraiment cool qui a déjà du succès ailleurs et que tu peux reproduire 
        dans ta ville ! Contacte les responsables de projets directement via la page du projet et échange avec eux !`
    },
    hubs_overview_largescreen_explainer_text_last_part: {
      en: `Have fun exploring what is possible to save our planet! Remember: The clock is ticking and
      every tenth of a degree matters.`,
      de: `Viel Spaß beim Entdecken der Möglichkeiten wie wir unseren Planeten schützen können! Denk dran: Die Uhr tickt
      und jedes Zehntel-Grad zählt.`,
      fr: `Amuse toi à explorer ce qu'il est possible de faire pour notre planète et ta ville! Rappel toi: Chaque dixiéme de degré compte.`
    },
    find_climate_projects_in_each_sector_in_our_hubs: {
      en: "Find climate projects in each sector in our hubs",
      de: "Finde Klimaprojekte in jedem Sektor in unseren Hubs",
      fr: "Trouve des projets environnementaux dans chace secteur via nos Hubs"
    },
    find_climate_projects_in_each_sector_in_our_hubs_text: {
      en: `Discover facts and concrete climate actions, projects and solutions Climate Connect users
      are working on by visiting the Hubs. Get a rundown of every main field of action in the fight
      against climate change.`,
      de: `Entdecke Fakten und konkrete Klima-Aktionen, -Projekte und -Lösungen, an denen Climate Connect Nutzer
      arbeiten, indem du die Hubs besuchst. Verschaffe dir damit einen Überblick über alle wichtigen
      Handlungsfelder im Kampf gegen den Klimawandel.`,
      fr: `Découvre des faits et des actions, des projets et des solutions concrètes pour le climat 
      sur lesquels les membres de Climate Connect travaillent en visitant les hubs. 
      Gagne ainsi une vue d'ensemble de tous les projets importants qui se font à côté de chez toi et dans le monde entier.`
    },
    click_here_to_minimize_info: {
      en: "Click here to minimize the info about the hub",
      de: "Klicke hier, um den Info-Bereich der Hub auszublenden",
      fr: "Clique ici pour réduire les infos à propos du hub"
    },
    add_a_hub_where_you_are_active: {
      en: "Add a Sector",
      de: "Füge einen Aktivitätsbereich hinzu",
      fr: "Ajouter un secteur"
    },
    add_hubs_in_which_your_organization_is_active: {
      en: "Add Hubs (sectors) in which your organization is active",
      de: "Füge Hubs (Aktivitätsbereiche) hinzu, in denen deine Organisation aktiv ist",
      fr: "Ajouter un Hub (secteur) dans lequel ton organisation est active"
    },
    please_create_an_account_or_log_in_to_contact_the_ambassador: {
      en: `Please sign up to contact ${hubAmbassador?.user?.first_name}.`,
      de: `Bitte melde dich an, um ${hubAmbassador?.user?.first_name} zu kontaktieren.`,
      fr: `Tu dois te créer un compte pour contacter ${hubAmbassador?.user?.first_name}.`
    },
    contact_ambassador: {
      en: `Contact ${hubAmbassador?.title}`,
      de: `${hubAmbassador?.title} kontaktieren`,
      fr: `Contacter ${hubAmbassador?.title}`
    },
    all_locations: {
      en: "All Locations",
      de: "Alle Orte",
      fr: "Tous les lieux"
    },
    do_you_need_support: {
      en: "Do you need support?",
      de: "Brauchst du Unterstützung?",
      fr: "As tu besoin d'aide ?"
    },
    local_ambassador_is_there_for_you: {
      en: `${hubAmbassador?.user?.first_name} is responsible for the ClimateHub ${hubName} and is there for you.`,
      de: `${hubAmbassador?.user?.first_name} koordiniert den ClimateHub ${hubName} und ist für dich da.`,
      fr: `${hubAmbassador?.user?.first_name} est responsable du ClimateHub ${hubName} et est là pour toi.`
    },
  };

  if (hubName === "Fashion") return { ...generalHubTexts, ...getFashionHubDescription() };
  if (hubName === "Food") return { ...generalHubTexts, ...getFoodHubDescription() };

  return generalHubTexts;
}
