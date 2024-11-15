import general_texts from "./general_texts.json";

export default function getFilterAndSearchTexts({ filterType, hubName, locale }) {
  return {
    point_out_max_selections: {
      en: "You can only choose up to",
      de: "Maximale Auswahl:",
      fr: "Choix max:"
    },
    search_for_keywords: {
      en: "Search for keywords",
      de: "Suche nach Stichwörtern",
      fr: "Recherche par mots clés"
    },
    selected: {
      en: "Selected",
      de: "Ausgewählt",
      fr: "Sélectionne"
    },
    choose_between_on_and: {
      en: "Select between 1 and ",
      de: "Wähle zwischen 1 und ",
      fr: "Choisir entre 1 et"
    },
    search_projects: {
      en: "Search for climate action projects",
      de: "Suche nach Klimaprojekten",
      fr: "Recherche de projets climatiques "
    },
    search_organizations: {
      en: "Search for organizations fighting climate change",
      de: "Suche nach Organisationen, die den Klimawandel bekämpfen",
      fr: "Recherche d'organisations environnementales"
    },
    search_active_people: {
      en: "Search for people active against climate change",
      de: "Suche nach Menschen, die gegen den Klimawandel aktiv sind",
      fr: "Recherche de personnes actives dans la lutte contre le changement climatique"
    },
    status_tooltip: {
      en: "Only show projects in the selected stage of completion",
      de: "Zeige nur Projekte im ausgewählten Stadium an",
      fr: "N'affiche que les projets au stade sélectionné"
    },
    organization_type_tooltip: {
      en: "Only shows projects created by organizations of the selected type",
      de: "Zeige nur Projekte an, die von Organisationen des ausgewählten Typs erstellt wurden",
      fr: "Affiche uniquement les projets créés par des organisations du type sélectionné."
    },
    categories_tooltip: {
      en: "Only shows projects from selected fields",
      de: "Zeige nur Projekte aus ausgewählten Feldern an",
      fr: "Affiche uniquement les projets des champs sélectionnés"
    },
    collaboration_tooltip: {
      en: "Filter by whether a project is open to collaborate",
      de: "Filtere danach, ob ein Projekt für die Zusammenarbeit offen ist",
      fr: "Filtre pour savoir si un projet est ouvert à la collaboration"
    },
    skills_tooltip: {
      en: "Filter by the skills a project is looking for",
      de: "Filtere nach den Fähigkeiten, die ein Projekt sucht",
      fr: "Filtrer selon les compétences recherchées par un projet"
    },
    start_typing: {
      en: "Start typing",
      de: "Beginne zu tippen",
      fr: "Commence à taper"
    },
    no_options: {
      en: "No options",
      de: "Keine Auswahlmöglichkeiten",
      fr: "Aucun choix possible"
    },
    apply_filters: {
      en: "Apply filters",
      de: "Filter anwenden",
      fr: "Appliquer les filtres"
    },
    filters: {
      en: "Filters",
      de: "Filter",
      fr: "Filtres"
    },
    radius_km: {
      en: "Radius(km)",
      de: "Radius(km)",
      fr: "Rayon (km)"
    },
    selected_filters: {
      en: "Selected Filters",
      de: "Ausgewählte Filter",
      fr: "Filtres sélectionnés"
    },
    could_not_find_any_items_of_type: {
      en: `Could not find any ${filterType ? general_texts[filterType][locale] : ""} ${
        hubName ? `in the ${hubName} hub ` : ""
      }that match your filters.`,
      de: `Wir konnten keine ${filterType ? general_texts[filterType][locale] : ""} ${
        hubName ? `im ${hubName} Hub ` : ""
      }finden, die deinen Filtern entsprechen.`,
      fr: `On n'a pas pu trouver de ${filterType ? general_texts[filterType][locale] : ""} ${
        hubName ? `dans le hub ${hubName} ` : ""
      }qui correspond à tes critéres.`
    },
    additional_infos_for_location: {
      en: "Additional info (e.g. room, ...)",
      de: "Zusätzliche Infos (z.B. Raum, ...)",
      fr: "Plus d'information (ex: salle,...)"
    },
  };
}
