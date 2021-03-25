import AccountBalanceIcon from "@material-ui/icons/AccountBalance";
import DescriptionIcon from "@material-ui/icons/Description";
import LanguageIcon from "@material-ui/icons/Language";
import PlaceIcon from "@material-ui/icons/Place";
import SchoolIcon from "@material-ui/icons/School";
import SupervisorAccountIcon from "@material-ui/icons/SupervisorAccount";
import getTexts from "../texts/texts";

export default function getOrganizationInfoMetadata(locale) {
  const texts = getTexts({page: "organization", locale: locale})
  return {
    shortdescription: {
      icon: DescriptionIcon,
      iconName: "DescriptionIcon",
      name: texts.description,
      key: "shortdescription",
      type: "text",
      weight: 1,
      helptext: texts.how_to_describe_organization,
    },
    location: {
      icon: PlaceIcon,
      iconName: "PlaceIcon",
      name: texts.location,
      type: "location",
      key: "location",
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
    school: {
      icon: SchoolIcon,
      iconName: "SchoolIcon",
      name: "School/University",
      key: "school",
    },
    organ: {
      icon: SupervisorAccountIcon,
      iconName: "SupervisorAccountIcon",
      name: "Organ",
      key: "organ",
    },
    website: {
      icon: LanguageIcon,
      name: texts.website,
      type: "text",
      key: "website",
      maxLength: 240,
      linkify: true,
    },
    has_parent_organization: {
      type: "checkbox",
      label: texts.we_are_a_suborganization,
    },
    parent_organization: {
      icon: AccountBalanceIcon,
      iconName: "AccountBalanceIcon",
      type: "auto_complete_searchbar",
      name: texts.parent_organization,
      key: "parent_organization",
      label: texts.edit_parent_organization_label,
      show_if_ticked: "has_parent_organization",
      baseUrl: "/api/organizations/?search=",
      helperText: texts.edit_parent_organization_helper_text,
    },
  }
}
