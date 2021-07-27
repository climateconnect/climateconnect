import general_texts from "./general_texts.json";

export default function getFilterAndSearchTexts({ filterType, hubName, locale }) {
  return {
    point_out_max_selections: {
      en: "You can only choose up to",
      de: "Maximale Auswahl:",
    },
    search_for_keywords: {
      en: "Search for keywords",
      de: "Suche nach Stichwörtern",
    },
    selected: {
      en: "Selected",
      de: "Ausgewählt",
    },
    choose_between_on_and: {
      en: "Select between 1 and ",
      de: "Wähle zwischen 1 und ",
    },
    search_projects: {
      en: "Search for climate action projects",
      de: "Suche nach Klimaprojekten",
    },
    search_organizations: {
      en: "Search for organizations fighting climate change",
      de: "Suche nach Organisationen, die den Klimawandel bekämpfen",
    },
    search_active_people: {
      en: "Search for people active against climate change",
      de: "Suche nach Menschen, die gegen den Klimawandel aktiv sind",
    },
    status_tooltip: {
      en: "Only show projects in the selected stage of completion",
      de: "Zeige nur Projekte im ausgewählten Stadium an",
    },
    organization_type_tooltip: {
      en: "Only shows projects created by organizations of the selected type",
      de: "Zeige nur Projekte an, die von Organisationen des ausgewählten Typs erstellt wurden",
    },
    categories_tooltip: {
      en: "Only shows projects from selected fields",
      de: "Zeige nur Projekte aus ausgewählten Feldern an",
    },
    collaboration_tooltip: {
      en: "Filter by whether a project is open to collaborate",
      de: "Filtere danach, ob ein Projekt für die Zusammenarbeit offen ist",
    },
    skills_tooltip: {
      en: "Filter by the skills a project is looking for",
      de: "Filtere nach den Fähigkeiten, die ein Projekt sucht",
    },
    start_typing: {
      en: "Start typing",
      de: "Beginne zu tippen",
    },
    no_options: {
      en: "No options",
      de: "Keine Auswahlmöglichkeiten",
    },
    apply_filters: {
      en: "Apply filters",
      de: "Filter anwenden",
    },
    filters: {
      en: "Filters",
      de: "Filter",
    },
    radius_km: {
      en: "Radius(km)",
      de: "Radius(km)",
    },
    selected_filters: {
      en: "Selected Filters",
      de: "Ausgewählte Filter",
    },
    could_not_find_any_items_of_type: {
      en: `Could not find any ${filterType ? general_texts[filterType][locale] : ""} ${
        hubName ? `in the ${hubName} hub ` : ""
      }that match your filters`,
      de: `Wir konnten keine ${filterType ? general_texts[filterType][locale] : ""} ${
        hubName ? `im ${hubName} Hub ` : ""
      }finden, die deinen Filtern entsprechen`,
    },
  };
}
