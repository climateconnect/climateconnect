import LocationOnOutlinedIcon from "@material-ui/icons/LocationOnOutlined";
import DoneAllOutlinedIcon from "@material-ui/icons/DoneAllOutlined";
import GroupIcon from "@material-ui/icons/Group";
import ExploreOutlinedIcon from "@material-ui/icons/ExploreOutlined";
import GroupAddIcon from "@material-ui/icons/GroupAdd";
import countries from "./countries.json";
export default function getFilters(key, filterChoices) {
  if (key === "projects") return getProjectsFilters(filterChoices);
  else if (key === "organizations") return getOrganizationsFilters(filterChoices);
  else if (key === "members") return getMembersFilters(filterChoices);
  else console.log("possibleFilters invalid input:" + key);
}

const getMembersFilters = filterChoices => [
  {
    icon: LocationOnOutlinedIcon,
    iconName: "LocationOnOutlinedIcon",
    title: "Country",
    type: "select",
    key: "country",
    options: countries.map(c => ({ key: c.toLowerCase(), name: c }))
  },
  {
    icon: LocationOnOutlinedIcon,
    iconName: "LocationOnOutlinedIcon",
    title: "City",
    type: "text",
    key: "city"
  },
  {
    icon: GroupAddIcon,
    iconName: "ExploreIcon",
    title: "Skills",
    type: "openMultiSelectDialogButton",
    key: "skills",
    itemType: "skills",
    itemsToChooseFrom: filterChoices.skills.map(s => ({ ...s, key: s.id }))
  }
];

const getOrganizationsFilters = filterChoices => [
  {
    icon: LocationOnOutlinedIcon,
    iconName: "LocationOnOutlinedIcon",
    title: "Country",
    type: "select",
    key: "country",
    options: countries.map(c => ({ key: c.toLowerCase(), name: c }))
  },
  {
    icon: LocationOnOutlinedIcon,
    iconName: "LocationOnOutlinedIcon",
    title: "City",
    type: "text",
    key: "city"
  },
  {
    icon: GroupIcon,
    iconName: "GroupIcon",
    title: "Organization type",
    type: "multiselect",
    options: filterChoices.organization_types.map(t => ({ ...t, key: t.id })),
    key: "organization_type"
  }
];

const getProjectsFilters = filterChoices => [
  {
    icon: LocationOnOutlinedIcon,
    iconName: "LocationOnOutlinedIcon",
    title: "Country",
    type: "select",
    key: "country",
    options: countries.map(c => ({ key: c.toLowerCase(), name: c }))
  },
  {
    icon: LocationOnOutlinedIcon,
    iconName: "LocationOnOutlinedIcon",
    title: "City",
    type: "text",
    key: "city"
  },
  {
    icon: DoneAllOutlinedIcon,
    iconName: "DoneAllOutlinedIcon",
    title: "Status",
    type: "multiselect",
    options: filterChoices.project_statuses.map(s => ({ ...s, key: s.id })),
    key: "status"
  },
  {
    icon: GroupIcon,
    iconName: "GroupIcon",
    title: "Organization type",
    type: "multiselect",
    options: filterChoices.organization_types.map(t => ({ ...t, key: t.id })),
    key: "organization_type"
  },
  {
    icon: ExploreOutlinedIcon,
    iconName: "ExploreIcon",
    title: "Categories",
    type: "openMultiSelectDialogButton",
    key: "category",
    itemType: "project categories",
    itemsToChooseFrom: filterChoices.project_categories.map(c => ({ ...c, key: c.id }))
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
        name: "yes"
      },
      {
        key: "no",
        name: "no"
      }
    ]
  },
  {
    icon: GroupAddIcon,
    iconName: "ExploreIcon",
    title: "Skills",
    type: "openMultiSelectDialogButton",
    key: "skills",
    itemType: "skills",
    itemsToChooseFrom: filterChoices.skills.map(s => ({ ...s, key: s.id }))
  }
];
