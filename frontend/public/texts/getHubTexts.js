import { getFashionHubDescription } from "./hubDescriptions/fashion";
import { getFoodHubDescription } from "./hubDescriptions/food";

export default function getHubTexts({ hubName }) {
  const generalHubTexts = {
    search_for_solutions_in_sector: {
      en: "Search for climate solutions in the " + hubName + " sector",
      de: "Durchsuche Klimaschutzprojekte im Bereich " + hubName,
    },
    search_for_organizations_in_sector: {
      en: "Search for climate organizations in the " + hubName + " sector",
      de: "Durchsuche Klimaschutzorganisationen im Bereich " + hubName,
    },
    more_info_about_hub_coming_soon: {
      en:
        "More Info coming soon! Have a look at the projects and solutions submitted by Climate Connect users below!",
      de: "",
    },
    less_info: {
      en: "Less Info",
      de: "",
    },
    more_info: {
      en: "More Info",
      de: "",
    },
    show_projects: {
      en: "Show Projects",
      de: "",
    },
    browse_explainer_text: {
      en: "Find impactful climate change solutions created by Climate Connect users.",
      de: "",
    },
    loading_chart: {
      en: "Loading Chart",
      de: "",
    },
    climate_action_hubs: {
      en: "Climate Action Hubs",
      de: "",
    },
    hubs_overview_image_alt: {
      en: "Beautiful flat landscape with many hot air balloons taking off",
      de: "",
    },
    find_climate_solutions_in_each_hub: {
      en: "Find climate solutions in each hub",
      de: "",
    },
    find_the_best_ways_to_tackle_climate_change_in_each_sector: {
      en: "Find the best ways to tackle climate change in each sector",
      de: "",
    },
    hubs_overview_mobile_explainer_text: {
      en:
        "Find information and concrete solutions on how to effectively fight climate change in each sector.",
      de: "",
    },
    hubs_overview_largescreen_explainer_text_first_part: {
      en: `On the hub pages you can find information on how to effectively fight climate change in each
        sector. You can find concrete and impactful solutions created by Climate Connect users. Get
        inspired and see possible actions how to fight climate change and get involved in a project
        you like. Who knows, maybe you will even find a really cool project that is already working
        great somewhere else and can reproduce it in your home town! Contact the solutions'
        creators directly on the solutions' pages to start a conversation!`,
      de: ``,
    },
    hubs_overview_largescreen_explainer_text_last_part: {
      en: `Have fun exploring what is possible to save our planet! Remember: The clock is ticking and
      every tenth of an degree matters.`,
      de: ``,
    },
    find_climate_projects_in_each_sector_in_our_hubs: {
      en: "Find climate projects in each sector in our hubs",
      de: "",
    },
    find_climate_projects_in_each_sector_in_our_hubs_text: {
      en: `Discover facts and concrete climate actions, projects and solutions Climate Connect users
      are working on by vising the Hubs. Get a rundown of every main field of action in the fight
      against climate change.`,
      de: ``,
    },
  };
  if (hubName === "Fashion") return { ...generalHubTexts, ...getFashionHubDescription() };
  if (hubName === "Food") return { ...generalHubTexts, ...getFoodHubDescription() };
  return generalHubTexts;
}
