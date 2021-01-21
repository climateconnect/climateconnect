import countries from "./countries.json";
import PlaceIcon from "@material-ui/icons/Place";

export default {
  availability: {
    name: "Availability",
    key: "availability",
    type: "select",
    missingMessage: "This user hasn't specified their availibility yet.",
  },
  skills: {
    name: "Skills",
    key: "skills",
    type: "array",
    addText: "Add skill",
    missingMessage: "This user hasn't added their skills yet",
    maxEntries: 8,
  },
  bio: {
    name: "Bio",
    type: "bio",
    key: "bio",
    missingMessage: "This user hasn't added a bio yet.",
    maxLength: 240,
    weight: 1,
  },
  website: {
    name: "Website",
    type: "text",
    key: "bio",
    maxLength: 240,
    linkify: true,
  },
  location: {
    name: "Location",
    key: "location",
    icon: PlaceIcon,
    missingMessage: "This user hasn't specified their location yet.",
    type: "location",
    weight: 0,
  },
};
