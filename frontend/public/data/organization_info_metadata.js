import AccountBalanceIcon from "@material-ui/icons/AccountBalance";
import DescriptionIcon from "@material-ui/icons/Description";
import LanguageIcon from "@material-ui/icons/Language";
import PlaceIcon from "@material-ui/icons/Place";
import SchoolIcon from "@material-ui/icons/School";
import SupervisorAccountIcon from "@material-ui/icons/SupervisorAccount";
import getTexts from "../texts/texts";

export default function getOrganizationInfoMetadata(locale, organization) {
  const texts = getTexts({ page: "organization", locale: locale, organization: organization });
  return {
    short_description: {
      icon: DescriptionIcon,
      iconName: "DescriptionIcon",
      name: `${texts.summary} (${texts.twohundred_eighty_chars_max})`,
      key: "short_description",
      type: "bio",
      weight: 1,
      helptext: texts.how_to_summarize_organization,
      required: true,
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
    about: {
      name: `${texts.about}`,
      key: "about",
      type: "detailled_description",
      helptext: texts.how_to_describe_organization,
    },
    organization_size: {
      name: `${texts.organization_size}`,
      key: "organization_size",
      type: "select",
      options: [
        {
          key: 0,
          name: "1-10",
        },
        {
          key: 1,
          name: "11-50",
        },
        {
          key: 2,
          name: "51-250",
        },
        {
          key: 3,
          name: "251-500",
        },
        {
          key: 4,
          name: texts.large_medium_organization_size,
        },
        {
          key: 5,
          name: texts.large_organization_size,
        },
        {
          key: 6,
          name: texts.very_large_organization_size,
        },
        {
          key: 7,
          name: texts.huge_organization_size,
        },
      ],
    },
    hubs: {
      name: `${texts.sectors_of_activity}`,
      key: "hubs",
      type: "hubs",
      helptext: texts.how_to_select_hubs,
    },
  };
}
