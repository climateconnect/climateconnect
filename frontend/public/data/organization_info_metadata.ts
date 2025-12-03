import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import DescriptionIcon from "@mui/icons-material/Description";
import LanguageIcon from "@mui/icons-material/Language";
import PlaceIcon from "@mui/icons-material/Place";
import SchoolIcon from "@mui/icons-material/School";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import getTexts from "../texts/texts";

export default function getOrganizationInfoMetadata(locale, organization?, isEditing?) {
  const texts = getTexts({ page: "organization", locale: locale, organization: organization });
  const metaData = {
    short_description: {
      ...getShortDescriptionField(texts),
    },
    location: {
      ...getLocationField(texts),
    },
    school: {
      ...getSchool(),
    },
    organ: {
      ...getOrgan(),
    },
    website: {
      ...getWebsite(texts),
    },
    has_parent_organization: {
      ...getHasParentOrganization(texts),
    },
    parent_organization: {
      ...getParentOrganization(texts),
    },
    about: {
      ...getAbout(texts),
    },
    ...(isEditing && {
      organization_size: {
        // if we are editing we want this property
        ...getOrganizationSize(texts),
      },
    }),
    ...(isEditing && {
      get_involved: {
        // if we are editing we want this property
        ...getGetInvolved(texts, isEditing),
      },
    }),
    ...(!isEditing && {
      organization_size_and_involvement: {
        // special property for displaying the 2 values in same line
        ...getOrganizationSizeAndInvolvement(texts, isEditing),
      },
    }),
    sectors: {
      ...getSectors(texts),
    },
  };
  return metaData;
}

/*
moved these down because I initially wanted to reuse the fields
twice with a conditional assignment of metaData with different fields based on editing
or not but opted for conditional assignment of properties like in organzationOperations.js
essentially the goal is to have different meta data if we are just viewing or editing/creating
*/

function getShortDescriptionField(texts) {
  return {
    icon: DescriptionIcon,
    iconName: "DescriptionIcon",
    name: `${texts.summary} (${texts.twohundred_eighty_chars_max})`,
    key: "short_description",
    type: "bio",
    weight: 1,
    rows: 4,
    helptext: texts.how_to_summarize_organization,
    required: true,
    maxLength: 280,
    showCharacterCounter: true,
  };
}

function getLocationField(texts) {
  return {
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
  };
}

function getSchool() {
  return {
    icon: SchoolIcon,
    iconName: "SchoolIcon",
    name: "School/University",
    key: "school",
  };
}

function getOrgan() {
  return {
    icon: SupervisorAccountIcon,
    iconName: "SupervisorAccountIcon",
    name: "Organ",
    key: "organ",
  };
}

function getWebsite(texts) {
  return {
    icon: LanguageIcon,
    name: texts.website,
    type: "text",
    key: "website",
    maxLength: 240,
    linkify: true,
  };
}

function getHasParentOrganization(texts) {
  return {
    type: "checkbox",
    label: texts.we_are_a_suborganization,
  };
}

function getParentOrganization(texts) {
  return {
    icon: AccountBalanceIcon,
    iconName: "AccountBalanceIcon",
    type: "auto_complete_searchbar",
    name: texts.parent_organization,
    key: "parent_organization",
    label: texts.edit_parent_organization_label,
    show_if_ticked: "has_parent_organization",
    baseUrl: "/api/organizations/?search=",
    helperText: texts.edit_parent_organization_helper_text,
  };
}

function getAbout(texts) {
  return {
    name: `${texts.about}`,
    key: "about",
    type: "detailled_description",
    helptext: texts.how_to_describe_organization,
  };
}

function getOrganizationSize(texts) {
  return {
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
  };
}

function getGetInvolved(texts, isEditing) {
  return {
    name: isEditing
      ? `${texts.get_involved} (${texts.twohundred_fifty_chars_max})`
      : texts.get_involved,
    key: "get_involved",
    type: "text",
    helptext: texts.get_involved_helptext,
    maxLength: 250,
    rows: 4,
    showCharacterCounter: true,
  };
}

function getSectors(texts) {
  return {
    name: `${texts.organization_is_active_in_these_sectors}`,
    key: "sectors",
    type: "sectors",
  };
}

function getOrganizationSizeAndInvolvement(texts, isEditing) {
  return {
    type: "selectwithtext",
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
    organization_size: {
      name: `${texts.organization_size}`,
      key: "organization_size",
    },
    get_involved: {
      name: isEditing
        ? `${texts.get_involved} (${texts.twohundred_fifty_chars_max})`
        : texts.get_involved,
      key: "get_involved",
      helptext: texts.get_involved_helptext,
      placeholder: "get involved",
      maxLength: 250,
    },
  };
}
