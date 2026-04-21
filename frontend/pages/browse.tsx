// 3rd party or built-in imports
import useScrollTrigger from "@mui/material/useScrollTrigger";
import NextCookies from "next-cookies";
import React, { useContext } from "react";
import Cookies from "universal-cookie";
import {
  getOrganizationTagsOptions,
  getProjectTypeOptions,
  getSectorOptions,
  getSkillsOptions,
} from "../public/lib/getOptions";
import { getAllHubs } from "../public/lib/hubOperations";
import { getLocationFilteredBy } from "../public/lib/locationOperations";
import { nullifyUndefinedValues } from "../public/lib/profileOperations";
import BrowseContent from "../src/components/browse/BrowseContent";
import UserContext from "../src/components/context/UserContext";
import TopOfPage from "../src/components/hooks/TopOfPage";
import WideLayout from "../src/components/layouts/WideLayout";
import BrowseContext from "../src/components/context/BrowseContext";
import { FilterProvider } from "../src/components/provider/FilterProvider";

export async function getServerSideProps(ctx) {
  const { hideInfo } = NextCookies(ctx);
  const [
    organization_types,
    hubs,
    location_filtered_by,
    projectTypes,
    sectorOptions,
    skills,
  ] = await Promise.all([
    getOrganizationTagsOptions(ctx.locale),
    getAllHubs(ctx.locale),
    getLocationFilteredBy(ctx.query),
    getProjectTypeOptions(ctx.locale),
    getSectorOptions(ctx.locale),
    getSkillsOptions(ctx.locale),
  ]);
  return {
    props: nullifyUndefinedValues({
      filterChoices: {
        organization_types: organization_types,
        sectors: sectorOptions,
        skills: skills,
      },
      hideInfo: hideInfo === "true",
      hubs: hubs,
      initialLocationFilter: location_filtered_by,
      projectTypes: projectTypes,
    }),
  };
}

export default function Browse({ filterChoices, hubs, initialLocationFilter, projectTypes }) {
  const cookies = new Cookies();
  const token = cookies.get("auth_token");
  const { locale, user } = useContext(UserContext);

  // Convert registered event slugs to a Set for O(1) lookup
  const registeredEventSlugs = user?.registered_event_slugs
    ? new Set(user.registered_event_slugs)
    : new Set<string>();

  const isScrollingUp = !useScrollTrigger({
    disableHysteresis: false,
    threshold: 0,
  });
  const atTopOfPage = TopOfPage({ initTopOfPage: true });
  const showOnScrollUp = isScrollingUp && !atTopOfPage;

  const contextValues = {
    projectTypes: projectTypes,
  };

  return (
    <>
      <WideLayout showOnScrollUp={showOnScrollUp} showDonationGoal={true}>
        <BrowseContext.Provider value={contextValues}>
          <FilterProvider
            filterChoices={filterChoices}
            initialLocationFilter={initialLocationFilter}
            locale={locale}
            token={token}
          >
            <BrowseContent
              filterChoices={filterChoices}
              allHubs={hubs}
              registeredEventSlugs={registeredEventSlugs}
            />
          </FilterProvider>
        </BrowseContext.Provider>
      </WideLayout>
    </>
  );
}
