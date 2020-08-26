import PlaceIcon from "@material-ui/icons/Place";
import DescriptionIcon from "@material-ui/icons/Description";
import SchoolIcon from "@material-ui/icons/School";
import SupervisorAccountIcon from "@material-ui/icons/SupervisorAccount";
import AccountBalanceIcon from "@material-ui/icons/AccountBalance";
import countries from "./countries.json";

export default {
  city: {
    icon: PlaceIcon,
    iconName: "PlaceIcon",
    name: "City",
    type: "location",
    key: "city"
  },
  country: {
    icon: PlaceIcon,
    iconName: "PlaceIcon",
    name: "Country",
    key: "country",
    type: "select",
    options: countries.map(c => ({ key: c.toLowerCase(), name: c }))
  },
  location: {
    icon: PlaceIcon,
    iconName: "PlaceIcon",
    name: "Location",
    type: "location",
    key: "location"
  },
  shortdescription: {
    icon: DescriptionIcon,
    iconName: "DescriptionIcon",
    name: "Description",
    key: "shortdescription",
    helptext:
      "Describe what your organization is doing, how you work and what impact you have on climate change. Please only use english!"
  },
  school: {
    icon: SchoolIcon,
    iconName: "SchoolIcon",
    name: "School/University",
    key: "school"
  },
  organ: {
    icon: SupervisorAccountIcon,
    iconName: "SupervisorAccountIcon",
    name: "Organ",
    key: "organ"
  },
  website: {
    name: "Website",
    type: "text",
    key: "bio",
    maxLength: 240,
    linkify: true
  },
  has_parent_organization: {
    type: "checkbox",
    label: "We are a sub-organization of a larger organization (e.g. local group)"
  },
  parent_organization: {
    icon: AccountBalanceIcon,
    iconName: "AccountBalanceIcon",
    type: "auto_complete_searchbar",
    name: "Parent organization",
    key: "parent_organization",
    label: "Edit your parent organization",
    show_if_ticked: "has_parent_organization",
    baseUrl: "/api/organizations/?search=",
    helperText: "Type the name of your parent organization"
  }
};
