import NextCookies from "next-cookies";
import React, { useContext, useRef, useState } from "react";
import ROLE_TYPES from "../../public/data/role_types";
import getOrganizationInfoMetadata from "../../public/data/organization_info_metadata";
import { apiRequest, sendToLogin } from "../../public/lib/apiOperations";
import { getSectorOptions, getOrganizationTagsOptions } from "../../public/lib/getOptions";

import { parseOrganization } from "../../public/lib/organizationOperations";
import { nullifyUndefinedValues } from "../../public/lib/profileOperations";
import getTexts from "../../public/texts/texts";
import UserContext from "../../src/components/context/UserContext";
import WideLayout from "../../src/components/layouts/WideLayout";
import EditOrganizationRoot from "../../src/components/organization/EditOrganizationRoot";
import getHubTheme from "../../src/themes/fetchHubTheme";
import { transformThemeData } from "../../src/themes/transformThemeData";
import { SectorOptionType } from "../../src/types";

export async function getServerSideProps(ctx) {
  const { auth_token } = NextCookies(ctx);
  if (ctx.req && !auth_token) {
    const texts = getTexts({ page: "organization", locale: ctx.locale });
    const message = texts.log_in_to_edit_organization;
    return sendToLogin(ctx, message);
  }
  const hubUrl = ctx.query.hub;
  const url = encodeURI(ctx.query.organizationUrl);
  const [organization, members, tagOptions, allSectors, hubThemeData] = await Promise.all([
    getOrganizationByUrlIfExists(url, auth_token, ctx.locale, hubUrl),
    getMembersByOrganization(url, auth_token, ctx.locale),
    getOrganizationTagsOptions(ctx.locale),
    getSectorOptions(ctx.locale, hubUrl),
    getHubTheme(hubUrl),
  ]);

  return {
    props: nullifyUndefinedValues({
      organization: organization,
      members: members,
      tagOptions: tagOptions,
      allSectors: getSectorOptionsForEditOrg(organization, allSectors),
      hubUrl: hubUrl,
      hubThemeData: hubThemeData,
    }),
  };
}

//This route should only be accessible to admins of the organization
export default function EditOrganizationPage({
  organization,
  members,
  tagOptions,
  allSectors,
  hubUrl,
  hubThemeData,
}: {
  organization: any;
  members: any[];
  tagOptions: any;
  allSectors: SectorOptionType[];
  hubUrl?: string;
  hubThemeData?: any;
}) {
  const { locale, user } = useContext(UserContext);
  const user_role = members?.find((m) => m.id === user?.id)?.role;
  const texts = getTexts({ page: "organization", locale: locale });
  const organization_info_metadata = getOrganizationInfoMetadata(locale, organization, true);
  const [errorMessage, setErrorMessage] = useState("");
  const [existingUrlSlug, setExistingUrlSlug] = useState("");
  const [existingName, setExistingName] = useState("");
  const locationInputRef = useRef(null);
  const [locationOptionsOpen, setLocationOptionsOpen] = useState(false);

  const handleSetLocationOptionsOpen = (newValue) => {
    setLocationOptionsOpen(newValue);
  };

  const infoMetadata = {
    ...organization_info_metadata,
    location: {
      ...organization_info_metadata.location,
      locationOptionsOpen: locationOptionsOpen,
      setLocationOptionsOpen: handleSetLocationOptionsOpen,
      locationInputRef: locationInputRef,
    },
  };

  const handleSetErrorMessage = (msg) => {
    setErrorMessage(msg);
    window.scrollTo(0, 0);
  };

  const handleSetExistingUrlSlug = (urlSlug) => {
    setExistingUrlSlug(urlSlug);
  };

  const handleSetExistingName = (name) => {
    setExistingName(name);
  };
  const customTheme = hubThemeData ? transformThemeData(hubThemeData) : undefined;

  return (
    <WideLayout
      title={organization ? organization.name : texts.not_found_error}
      hubUrl={hubUrl}
      customTheme={customTheme}
    >
      <EditOrganizationRoot
        allSectors={allSectors}
        errorMessage={errorMessage}
        existingUrlSlug={existingUrlSlug}
        existingName={existingName}
        handleSetErrorMessage={handleSetErrorMessage}
        handleSetExistingName={handleSetExistingName}
        handleSetExistingUrlSlug={handleSetExistingUrlSlug}
        handleSetLocationOptionsOpen={handleSetLocationOptionsOpen}
        infoMetadata={infoMetadata}
        initialTranslations={organization.translations}
        locationInputRef={locationInputRef}
        organization={organization}
        tagOptions={tagOptions}
        hubUrl={hubUrl}
        user_role={user_role}
      />
    </WideLayout>
  );
}

function getSectorOptionsForEditOrg(organization, allSectors) {
  // add all sectors that are assigned to the organization to the possible sectors
  // so that, when editing a project with e.g. specific sectors all sectors - even
  // hub specific ones are available
  if (organization && organization.sectors) {
    for (const sector_mapping of organization.sectors) {
      if (!sector_mapping || !sector_mapping.sector) {
        continue;
      }
      const sector = sector_mapping.sector as SectorOptionType;
      // match by sector.key
      const exists = allSectors.find((s) => s.key === sector.key);
      if (!exists) {
        allSectors.push(sector);
      }
    }
    // sort sectors by name
    allSectors.sort((a, b) => (a.name < b.name ? -1 : 1));
  }
  return allSectors;
}

async function getOrganizationByUrlIfExists(organizationUrl, token, locale, hubUrl?: string) {
  let query = "";
  query += "/?edit_view=true";
  query += hubUrl ? `&hub=${hubUrl}` : "";

  try {
    const resp = await apiRequest({
      method: "get",
      url: "/api/organizations/" + organizationUrl + query,
      token: token,
      locale: locale,
    });
    return parseOrganization(resp.data, true);
  } catch (err: any) {
    console.log("Error when getting organization " + organizationUrl);
    return null;
  }
}

async function getMembersByOrganization(organizationUrl, token, locale) {
  try {
    const resp = await apiRequest({
      method: "get",
      url: "/api/organizations/" + organizationUrl + "/members/?page=1&page_size=24",
      token: token,
      locale: locale,
    });
    if (!resp.data) return null;
    else {
      return parseOrganizationMembers(resp.data.results);
    }
  } catch (err) {
    console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
}

function parseOrganizationMembers(members) {
  return members.map((m) => {
    const member = m.user;
    return {
      ...member,
      member_id: m.id,
      image: process.env.API_URL + member.image,
      name: member.first_name + " " + member.last_name,
      role: m.permission,
      time_per_week: m.time_per_week,
      role_in_organization: m.role_in_organization ? m.role_in_organization : "",
      location: member.location,
      isCreator: m.permission.role_type === ROLE_TYPES.all_type,
    };
  });
}
