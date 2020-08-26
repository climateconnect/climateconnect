import countries from "./countries.json";

export default {
  availability: {
    name: "Availability",
    key: "availability",
    type: "select",
    missingMessage: "This user hasn't specified their availibility yet."
  },
  skills: {
    name: "Skills",
    key: "skills",
    type: "array",
    addText: "Add skill",
    missingMessage: "This user hasn't added their skills yet",
    maxEntries: 8
  },
  bio: {
    name: "Bio",
    type: "text",
    key: "bio",
    missingMessage: "This user hasn't added a bio yet.",
    maxLength: 240
  },
  website: {
    name: "Website",
    type: "text",
    key: "bio",
    maxLength: 240,
    linkify: true
  },
  city: {
    name: "City",
    key: "city",
    missingMessage: "This user hasn't specified their city yet.",
    type: "location",
    order: 1
  },
  country: {
    name: "Country",
    key: "country",
    missingMessage: "This user hasn't specified their country yet.",
    type: "select",
    order: 0,
    options: countries.map(c => ({ key: c.toLowerCase(), name: c }))
  },
  location: {
    name: "Location",
    key: "location",
    missingMessage: "This user hasn't specified their location yet.",
    type: "location"
  }
};
