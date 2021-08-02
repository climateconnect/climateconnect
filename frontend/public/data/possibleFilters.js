import CreateIcon from "@material-ui/icons/Create";
import DoneAllOutlinedIcon from "@material-ui/icons/DoneAllOutlined";
import ExploreIcon from "@material-ui/icons/Explore";
import GroupIcon from "@material-ui/icons/Group";
import GroupAddIcon from "@material-ui/icons/GroupAdd";
import LocationOnOutlinedIcon from "@material-ui/icons/LocationOnOutlined";
import getTexts from "../texts/texts";

export default function getFilters({ key, filterChoices, locale }) {
  const texts = getTexts({ page: "filter_and_search", locale: locale });
  const english_texts = getTexts({ page: "filter_and_search", locale: "en" });
  if (!filterChoices) {
    throw new Error("No filter choices supplied");
  }

  if (key === "projects") {
    return getProjectsFilters(filterChoices, texts, english_texts);
  } else if (key === "organizations") {
    return getOrganizationsFilters(filterChoices, texts);
  } else if (key === "members") {
    return getMembersFilters(filterChoices, texts);
  } else if (key === "ideas") {
    return getIdeasFilters(filterChoices, texts);
  } else if (key === "all") {
    const projectsFilters = getProjectsFilters(filterChoices, texts, english_texts);
    const organizationsFilters = getOrganizationsFilters(filterChoices, texts);
    const membersFilters = getMembersFilters(filterChoices, texts);
    return [
      ...projectsFilters,
      ...organizationsFilters.filter((o) => !projectsFilters.map((p) => p.key).includes(o.key)),
      ...membersFilters
        .filter((m) => !projectsFilters.map((p) => p.key).includes(m.key))
        .filter((m) => !organizationsFilters.map((o) => o.key).includes(m.key)),
    ];
  }

  console.log("possibleFilters invalid input:" + key);
}

const getLocationFilters = (texts) => {
  if (process.env.ENABLE_LEGACY_LOCATION_FORMAT === "true") {
    return [
      {
        icon: LocationOnOutlinedIcon,
        iconName: "LocationOnOutlinedIcon",
        title: texts.city,
        type: "text",
        key: "city",
      },
      {
        icon: LocationOnOutlinedIcon,
        iconName: "LocationOnOutlinedIcon",
        title: texts.country,
        type: "text",
        key: "country",
      },
    ];
  }
  return [
    {
      icon: LocationOnOutlinedIcon,
      iconName: "LocationOnOutlinedIcon",
      title: texts.location,
      type: "location",
      key: "location",
      tooltipText: "Only show projects within the selected radius of the location",
    },
  ];
};

const getSearchFilter = () => {
  return {
    type: "search",
    key: "search",
  };
};

const getIdeasFilters = (filterChoices, texts) => [...getLocationFilters(texts)];

const getMembersFilters = (filterChoices, texts) => [
  ...getLocationFilters(texts),
  getSearchFilter(),
  {
    icon: CreateIcon,
    iconName: "CreateIcon",
    title: texts.skills,
    type: "openMultiSelectDialogButton",
    key: "skills",
    itemType: "skills",
    options: filterChoices?.skills?.map((s) => ({ ...s, key: s.id })),
    tooltipText: texts.skills_tooltip,
  },
];

const getOrganizationsFilters = (filterChoices, texts) => [
  ...getLocationFilters(texts),
  getSearchFilter(),
  {
    icon: GroupIcon,
    iconName: "GroupIcon",
    title: texts.organization_type,
    type: "multiselect",
    options: filterChoices?.organization_types?.map((t) => ({ ...t, key: t.id })),
    key: "organization_type",
    tooltipText: texts.organization_type_tooltip,
  },
];

const getProjectsFilters = (filterChoices, texts, english_texts) => [
  ...getLocationFilters(texts),
  getSearchFilter(),
  {
    icon: DoneAllOutlinedIcon,
    iconName: "DoneAllOutlinedIcon",
    title: texts.status,
    type: "multiselect",
    options: filterChoices?.project_statuses?.map((s) => ({ ...s, key: s.id })),
    key: "status",
    tooltipText: texts.status_tooltip,
  },
  {
    icon: GroupIcon,
    iconName: "GroupIcon",
    // A hack: need an extra space character to create some horizontal space between the icon and text
    title: " " + texts.organization_type,
    type: "multiselect",
    options: filterChoices?.organization_types?.map((t) => ({ ...t, key: t.id })),
    key: "organization_type",
    tooltipText: texts.organization_type_tooltip,
  },
  {
    icon: ExploreIcon,
    iconName: "ExploreIcon",
    title: texts.categories,
    type: "openMultiSelectDialogButton",
    key: "category",
    itemType: "project categories",
    options: filterChoices?.project_categories?.map((c) => ({ ...c, key: c.id })),
    tooltipText: texts.categories_tooltip,
  },
  {
    icon: GroupAddIcon,
    iconName: "GroupAddIcon",
    title: texts.collaboration,
    type: "select",
    key: "collaboration",
    options: [
      {
        key: "",
        name: "",
        original_name: "",
      },
      {
        key: "yes",
        name: texts.yes,
        original_name: english_texts?.yes,
      },
      {
        key: "no",
        name: texts.no,
        original_name: english_texts?.no,
      },
    ],
    tooltipText: texts.collaboration_tooltip,
  },
  {
    icon: CreateIcon,
    iconName: "CreateIcon",
    title: texts.skills,
    type: "openMultiSelectDialogButton",
    key: "skills",
    itemType: "skills",
    options: filterChoices?.skills?.map((s) => ({ ...s, key: s.id })),
    tooltipText: texts.skills_tooltip,
  },
];
