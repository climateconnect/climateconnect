// 3rd party or built-in imports
import useScrollTrigger from "@mui/material/useScrollTrigger";
import NextCookies from "next-cookies";
import React, { useContext } from "react";
import Cookies from "universal-cookie";
import {
  getOrganizationTagsOptions,
  getProjectTagsOptions,
  getProjectTypeOptions,
  getSkillsOptions,
} from "../public/lib/getOptions";
import { getAllHubs } from "../public/lib/hubOperations";
import { getLocationFilteredBy } from "../public/lib/locationOperations";
import { nullifyUndefinedValues } from "../public/lib/profileOperations";
import BrowseContent from "../src/components/browse/BrowseContent";
import UserContext from "../src/components/context/UserContext";
import TopOfPage from "../src/components/hooks/TopOfPage";
import HubsSubHeader from "../src/components/indexPage/hubsSubHeader/HubsSubHeader";
import MainHeadingContainerMobile from "../src/components/indexPage/MainHeadingContainerMobile";
import WideLayout from "../src/components/layouts/WideLayout";
import BrowseContext from "../src/components/context/BrowseContext";
import { FilterProvider } from "../src/components/hooks/FilterContext";

export async function getServerSideProps(ctx) {
  const { hideInfo } = NextCookies(ctx);
  const [
    project_categories,
    organization_types,
    skills,
    hubs,
    location_filtered_by,
    projectTypes,
  ] = await Promise.all([
    getProjectTagsOptions(null, ctx.locale),
    getOrganizationTagsOptions(ctx.locale),
    getSkillsOptions(ctx.locale),
    getAllHubs(ctx.locale),
    getLocationFilteredBy(ctx.query),
    getProjectTypeOptions(ctx.locale),
  ]);
  return {
    props: nullifyUndefinedValues({
      filterChoices: {
        project_categories: project_categories,
        organization_types: organization_types,
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
  const { locale } = useContext(UserContext);

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
      <WideLayout
        // hideHeadline
        showOnScrollUp={showOnScrollUp}
        subHeader={<HubsSubHeader hubs={hubs} />}
      >
        <BrowseContext.Provider value={contextValues}>
          <MainHeadingContainerMobile />
          <FilterProvider
            filterChoices={filterChoices}
            initialLocationFilter={initialLocationFilter}
            locale={locale}
            token={token}
          >
            <BrowseContent filterChoices={filterChoices} />
          </FilterProvider>
        </BrowseContext.Provider>
      </WideLayout>
    </>
  );
}
