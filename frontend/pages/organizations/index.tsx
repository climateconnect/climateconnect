import NextCookies from "next-cookies";
import React, { useContext, useEffect, useMemo } from "react";
import Cookies from "universal-cookie";
import {
  getOrganizationTagsOptions,
  getSectorOptions,
  getSkillsOptions,
} from "../../public/lib/getOptions";
import { getLocationFilteredBy } from "../../public/lib/locationOperations";
import { nullifyUndefinedValues } from "../../public/lib/profileOperations";
import BrowseOrganisationsContent from "../../src/components/browse/BrowseOrganisationsContent";
import UserContext from "../../src/components/context/UserContext";
import { HubContext } from "../../src/components/context/HubContext";
import WideLayout from "../../src/components/layouts/WideLayout";
import HubTabsNavigation from "../../src/components/hub/HubTabsNavigation";
import MobileBottomMenu from "../../src/components/browse/MobileBottomMenu";
import { FilterProvider } from "../../src/components/provider/FilterProvider";
import { BrowseTab } from "../../src/types";
import { useRouter } from "next/router";
import { useMediaQuery, Theme } from "@mui/material";
import getTexts from "../../public/texts/texts";

export async function getServerSideProps(ctx) {
  const { hideInfo } = NextCookies(ctx);
  const locale = ctx.locale ?? "en";
  const [organization_types, location_filtered_by, sectorOptions, skills] = await Promise.all([
    getOrganizationTagsOptions(locale),
    getLocationFilteredBy(ctx.query, locale),
    getSectorOptions(locale),
    getSkillsOptions(locale),
  ]);
  return {
    props: nullifyUndefinedValues({
      filterChoices: { organization_types, sectors: sectorOptions, skills },
      hideInfo: hideInfo === "true",
      initialLocationFilter: location_filtered_by,
    }),
  };
}

const TYPES_BY_TAB_VALUE: BrowseTab[] = ["projects", "organizations", "members"];

export default function OrganisationsPage({ filterChoices, initialLocationFilter }: any) {
  const cookies = new Cookies();
  const token = cookies.get("auth_token");
  const { locale, refreshUser } = useContext(UserContext);
  const { hubs } = useContext(HubContext);
  const router = useRouter();
  const isNarrowScreen = useMediaQuery<Theme>((theme) => theme.breakpoints.down("md"));
  const texts = useMemo(() => getTexts({ page: "hub", locale }), [locale]);

  useEffect(() => {
    if (refreshUser && token) refreshUser();
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    const tab = TYPES_BY_TAB_VALUE[newValue];
    const targetPath =
      tab === "projects" ? "/browse" : tab === "organizations" ? "/organizations" : "/members";
    const params = new URLSearchParams(window.location.search);
    router.push(`${targetPath}${params.toString() ? `?${params}` : ""}`);
  };

  return (
    <WideLayout>
      <HubTabsNavigation
        TYPES_BY_TAB_VALUE={TYPES_BY_TAB_VALUE}
        tabValue={1}
        handleTabChange={handleTabChange}
        type_names={{
          projects: texts.projects,
          organizations: isNarrowScreen ? texts.orgs : texts.organizations,
          members: texts.members,
        }}
        hubUrl=""
        className=""
        allHubs={hubs}
        fromPage={undefined}
        subHubSegment={undefined}
      />
      <FilterProvider
        filterChoices={filterChoices}
        initialLocationFilter={initialLocationFilter}
        locale={locale}
        token={token}
      >
        <BrowseOrganisationsContent
          key={router.asPath}
          filterChoices={filterChoices}
          initialLocationFilter={initialLocationFilter}
        />
      </FilterProvider>
      {isNarrowScreen && (
        <MobileBottomMenu
          tabValue={1}
          handleTabChange={handleTabChange}
          TYPES_BY_TAB_VALUE={TYPES_BY_TAB_VALUE}
          hubAmbassador={null}
        />
      )}
    </WideLayout>
  );
}
