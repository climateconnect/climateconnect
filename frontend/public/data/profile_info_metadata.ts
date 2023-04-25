import PlaceIcon from "@mui/icons-material/Place";
import getTexts from "../texts/texts";

export default function getProfileInfoMetadata(locale) {
  const texts = getTexts({ page: "profile", locale: locale });
  return {
    availability: {
      name: texts.availability,
      key: "availability",
      type: "select",
      missingMessage: texts.availability_user_profile_missing_message,
    },
    skills: {
      name: texts.skills,
      key: "skills",
      type: "array",
      addText: texts.add_skill,
      missingMessage: texts.skills_user_profile_missing_message,
      maxEntries: 8,
    },
    bio: {
      name: texts.bio,
      type: "bio",
      key: "bio",
      missingMessage: texts.bio_user_profile_missing_message,
      maxLength: 280,
      weight: 1,
      rows: 4,
      helptext: texts.enter_profile_bio_helptext,
      showCharacterCounter: true,
    },
    website: {
      name: texts.website,
      type: "text",
      key: "website",
      maxLength: 240,
      linkify: true,
    },
    location: {
      name: texts.location,
      key: "location",
      icon: PlaceIcon,
      missingMessage: texts.location_user_profile_missing_message,
      type: "location",
      weight: 0,
      legacy: {
        city: {
          icon: PlaceIcon,
          iconName: "PlaceIcon",
          name: texts.city,
          type: "text",
          key: "city",
        },
        country: {
          icon: PlaceIcon,
          iconName: "PlaceIcon",
          name: texts.country,
          key: "country",
          type: "text",
        },
      },
    },
  };
}
