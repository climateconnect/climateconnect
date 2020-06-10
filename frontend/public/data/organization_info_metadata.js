import PlaceIcon from "@material-ui/icons/Place";
import DescriptionIcon from "@material-ui/icons/Description";
import SchoolIcon from "@material-ui/icons/School";
import LocationCityIcon from "@material-ui/icons/LocationCity";
import PublicIcon from "@material-ui/icons/Public";
import SupervisorAccountIcon from "@material-ui/icons/SupervisorAccount";

export default {
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
    key: "shortdescription"
  },
  school: {
    icon: SchoolIcon,
    iconName: "SchoolIcon",
    name: "School/University",
    key: "school"
  },
  city: {
    icon: LocationCityIcon,
    iconName: "LocationCityIcon",
    name: "City",
    key: "city"
  },
  state: {
    PublicIcon,
    iconName: "PublicIcon",
    name: "State",
    key: "state"
  },
  country: {
    icon: PublicIcon,
    iconName: "PublicIcon",
    name: "Country",
    key: "country"
  },
  organ: {
    icon: SupervisorAccountIcon,
    iconName: "SupervisorAccountIcon",
    name: "Organ",
    key: "organ"
  }
};
