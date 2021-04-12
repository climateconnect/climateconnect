import DoneAllOutlinedIcon from "@material-ui/icons/DoneAllOutlined";
import ExploreOutlinedIcon from "@material-ui/icons/ExploreOutlined";
import GroupIcon from "@material-ui/icons/Group";
import GroupAddIcon from "@material-ui/icons/GroupAdd";
import LocationOnOutlinedIcon from "@material-ui/icons/LocationOnOutlined";
import { useContext } from "react";
import UserContext from "../../src/components/context/UserContext";
import getTexts from "../texts/texts";

export default function getFilters(key, filterChoices) {
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "filter_and_search", locale: locale });
  if (!filterChoices) {
    throw new Error("No filter choices supplied");
  }

  if (key === "projects") {
    return getProjectsFilters(filterChoices, texts);
  } else if (key === "organizations") {
    return getOrganizationsFilters(filterChoices, texts);
  } else if (key === "members") {
    return getMembersFilters(filterChoices, texts);
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

const getMembersFilters = (filterChoices, texts) => [
  ...getLocationFilters(texts),
  {
    icon: GroupAddIcon,
    iconName: "ExploreIcon",
    title: texts.skills,
    type: "openMultiSelectDialogButton",
    key: "skills",
    itemType: "skills",
    itemsToChooseFrom: filterChoices?.skills?.map((s) => ({ ...s, key: s.id })),
    tooltipText: texts.skills_tooltip,
  },
];

const getOrganizationsFilters = (filterChoices, texts) => [
  ...getLocationFilters(texts),
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

const getProjectsFilters = (filterChoices, texts) => [
  ...getLocationFilters(texts),
  {
    icon: DoneAllOutlinedIcon,
    iconName: "DoneAllOutlinedIcon",
    title: texts.status,
    type: "multiselect",
    options: filterChoices?.project_statuses.map((s) => ({ ...s, key: s.id })),
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
    icon: ExploreOutlinedIcon,
    iconName: "ExploreIcon",
    title: texts.categories,
    type: "openMultiSelectDialogButton",
    key: "category",
    itemType: "project categories",
    itemsToChooseFrom: filterChoices?.project_categories?.map((c) => ({ ...c, key: c.id })),
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
        key: "yes",
        name: texts.yes,
      },
      {
        key: "no",
        name: texts.no,
      },
    ],
    tooltipText: texts.collaboration_tooltip,
  },
  {
    icon: GroupAddIcon,
    iconName: "ExploreIcon",
    title: texts.skills,
    type: "openMultiSelectDialogButton",
    key: "skills",
    itemType: "skills",
    itemsToChooseFrom: filterChoices?.skills?.map((s) => ({ ...s, key: s.id })),
    tooltipText: texts.skills_tooltip,
  },
];
