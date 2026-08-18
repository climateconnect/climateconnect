import NextCookies from "next-cookies";
import React, { useContext, useEffect, useMemo, useRef } from "react";
import Cookies from "universal-cookie";
import { getLocationFilteredBy } from "../public/lib/locationOperations";
import { nullifyUndefinedValues } from "../public/lib/profileOperations";
import BrowseProjectsContent from "../src/components/browse/BrowseProjectsContent";
import UserContext from "../src/components/context/UserContext";
import { HubContext } from "../src/components/context/HubContext";
import WideLayout from "../src/components/layouts/WideLayout";
import HubTabsNavigation from "../src/components/hub/HubTabsNavigation";
import MobileBottomMenu from "../src/components/browse/MobileBottomMenu";
import { FilterProvider } from "../src/components/provider/FilterProvider";
import { BrowseTab } from "../src/types";
import { useRouter } from "next/router";
import { useMediaQuery, Theme } from "@mui/material";
import getTexts from "../public/texts/texts";
import { getBrowsePathForType } from "../public/lib/urlOperations";

export async function getServerSideProps(ctx) {
  const { hideInfo } = NextCookies(ctx);
  const locale = ctx.locale ?? "en";
  const [organization_types, location_filtered_by, sectorOptions, skills] = await Promise.all([
    (await import("../public/lib/getOptions")).getOrganizationTagsOptions(locale),
    getLocationFilteredBy(ctx.query, locale),
    (await import("../public/lib/getOptions")).getSectorOptions(locale),
    (await import("../public/lib/getOptions")).getSkillsOptions(locale),
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

export default function BrowsePage({ filterChoices, initialLocationFilter }: any) {
  const cookies = new Cookies();
  const token = cookies.get("auth_token");
  const { locale, refreshUser } = useContext(UserContext);
  const { hubs } = useContext(HubContext);
  const router = useRouter();
  const isNarrowScreen = useMediaQuery<Theme>((theme) => theme.breakpoints.down("md"));
  const texts = useMemo(() => getTexts({ page: "hub", locale }), [locale]);
  const hashRedirectedRef = useRef(false);

  useEffect(() => {
    if (hashRedirectedRef.current) return;
    const hash = window.location.hash.replace("#", "");
    if (hash === "organizations" || hash === "members") {
      hashRedirectedRef.current = true;
      const localePrefix = router.locale && router.locale !== "en" ? `/${router.locale}` : "";
      const target = hash === "organizations" ? "/organizations" : "/members";
      window.location.replace(`${localePrefix}${target}${window.location.search}`);
    }
  }, [router]);

  useEffect(() => {
    if (refreshUser && token) refreshUser();
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    const tab = TYPES_BY_TAB_VALUE[newValue];
    const targetPath = getBrowsePathForType(tab);
    const params = new URLSearchParams(window.location.search);
    router.push(`${targetPath}${params.toString() ? `?${params}` : ""}`);
  };

  return (
    <WideLayout>
      <HubTabsNavigation
        TYPES_BY_TAB_VALUE={TYPES_BY_TAB_VALUE}
        tabValue={0}
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
        <BrowseProjectsContent
          key={router.asPath}
          filterChoices={filterChoices}
          initialLocationFilter={initialLocationFilter}
        />
      </FilterProvider>
      {isNarrowScreen && (
        <MobileBottomMenu
          tabValue={0}
          handleTabChange={handleTabChange}
          TYPES_BY_TAB_VALUE={TYPES_BY_TAB_VALUE}
          hubAmbassador={null}
        />
      )}
    </WideLayout>
  );
}
