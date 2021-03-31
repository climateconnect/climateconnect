import DoneAllOutlinedIcon from "@material-ui/icons/DoneAllOutlined";
import ExploreOutlinedIcon from "@material-ui/icons/ExploreOutlined";
import GroupIcon from "@material-ui/icons/Group";
import GroupAddIcon from "@material-ui/icons/GroupAdd";
import LocationOnOutlinedIcon from "@material-ui/icons/LocationOnOutlined";

export default function getFilters(key, filterChoices) {
  if (!filterChoices) {
    throw new Error("No filter choices supplied");
  }

  if (key === "projects") {
    return getProjectsFilters(filterChoices);
  } else if (key === "organizations") {
    return getOrganizationsFilters(filterChoices);
  } else if (key === "members") {
    return getMembersFilters(filterChoices);
  }

  console.log("possibleFilters invalid input:" + key);
}

const getLocationFilters = () => {
  if (process.env.ENABLE_LEGACY_LOCATION_FORMAT === "true") {
    return [
      {
        icon: LocationOnOutlinedIcon,
        iconName: "LocationOnOutlinedIcon",
        title: "City",
        type: "text",
        key: "city",
      },
      {
        icon: LocationOnOutlinedIcon,
        iconName: "LocationOnOutlinedIcon",
        title: "Country",
        type: "text",
        key: "country",
      },
    ];
  }
  return [
    {
      icon: LocationOnOutlinedIcon,
      iconName: "LocationOnOutlinedIcon",
      title: "Location",
      type: "location",
      key: "location",
      tooltipText: "Only show projects within the selected radius of the location",
    },
  ];
};

const getMembersFilters = (filterChoices) => [
  ...getLocationFilters(),
  {
    icon: GroupAddIcon,
    iconName: "ExploreIcon",
    title: "Skills",
    type: "openMultiSelectDialogButton",
    key: "skills",
    itemType: "skills",
    itemsToChooseFrom: filterChoices?.skills?.map((s) => ({ ...s, key: s.id })),
  },
];

const getOrganizationsFilters = (filterChoices) => [
  ...getLocationFilters(),
  {
    icon: GroupIcon,
    iconName: "GroupIcon",
    title: "Organization type",
    type: "multiselect",
    options: filterChoices?.organization_types?.map((t) => ({ ...t, key: t.id })),
    key: "organization_type",
  },
];

const getProjectsFilters = (filterChoices) => [
  ...getLocationFilters(),
  {
    icon: DoneAllOutlinedIcon,
    iconName: "DoneAllOutlinedIcon",
    title: "Status",
    type: "multiselect",
    options: filterChoices?.project_statuses?.map((s) => ({ ...s, key: s.id })),
    key: "status",
    tooltipText: "Only show projects in the selected stage of completion",
  },
  {
    icon: GroupIcon,
    iconName: "GroupIcon",
    // A hack: need an extra space character to create some horizontal space between the icon and text
    title: " Organization type",
    type: "multiselect",
    options: filterChoices?.organization_types?.map((t) => ({ ...t, key: t.id })),
    key: "organization_type",
    tooltipText: "Only shows projects created by organizations of the selected type",
  },
  {
    icon: ExploreOutlinedIcon,
    iconName: "ExploreIcon",
    title: "Categories",
    type: "openMultiSelectDialogButton",
    key: "category",
    itemType: "project categories",
    itemsToChooseFrom: filterChoices?.project_categories?.map((c) => ({ ...c, key: c.id })),
    tooltipText: "Only shows projects from selected fields",
  },
  {
    icon: GroupAddIcon,
    iconName: "GroupAddIcon",
    title: "Collaboration",
    type: "select",
    key: "collaboration",
    options: [
      {
        key: "yes",
        name: "yes",
      },
      {
        key: "no",
        name: "no",
      },
    ],
    tooltipText: "Filter by whether a project is open to collaborate",
  },
  {
    icon: GroupAddIcon,
    iconName: "ExploreIcon",
    title: "Skills",
    type: "openMultiSelectDialogButton",
    key: "skills",
    itemType: "skills",
    itemsToChooseFrom: filterChoices?.skills?.map((s) => ({ ...s, key: s.id })),
    tooltipText: "Filter by the skills a project is looking for",
  },
];
