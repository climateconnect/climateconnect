// 3rd party or built-in imports
import useScrollTrigger from "@mui/material/useScrollTrigger";
import NextCookies from "next-cookies";
import React, { useContext, useRef, useState } from "react";
import Cookies from "universal-cookie";
import { applyNewFilters, getInitialFilters } from "../public/lib/filterOperations";
import {
  getOrganizationTagsOptions,
  getProjectTagsOptions,
  getSkillsOptions,
  getStatusOptions,
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

export async function getServerSideProps(ctx) {
  const { hideInfo } = NextCookies(ctx);
  const [
    project_categories,
    organization_types,
    skills,
    project_statuses,
    hubs,
    location_filtered_by,
  ] = await Promise.all([
    getProjectTagsOptions(null, ctx.locale),
    getOrganizationTagsOptions(ctx.locale),
    getSkillsOptions(ctx.locale),
    getStatusOptions(ctx.locale),
    getAllHubs(ctx.locale),
    getLocationFilteredBy(ctx.query),
  ]);
  return {
    props: nullifyUndefinedValues({
      filterChoices: {
        project_categories: project_categories,
        organization_types: organization_types,
        skills: skills,
        project_statuses: project_statuses,
      },
      hideInfo: hideInfo === "true",
      hubs: hubs,
      initialLocationFilter: location_filtered_by,
    }),
  };
}

export default function Browse({ filterChoices, hubs, initialLocationFilter }) {
  const cookies = new Cookies();
  const token = cookies.get("auth_token");
  const { locale } = useContext(UserContext);

  // Initialize filters. We use one set of filters for all tabs (projects, organizations, members)
  const [filters, setFilters] = useState(
    getInitialFilters({
      filterChoices: filterChoices,
      locale: locale,
      initialLocationFilter: initialLocationFilter,
    })
  );
  const [tabsWhereFiltersWereApplied, setTabsWhereFiltersWereApplied] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const handleSetErrorMessage = (newMessage) => {
    setErrorMessage(newMessage);
  };

  const handleAddFilters = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  const handleSetTabsWhereFiltersWereApplied = (tabs) => {
    setTabsWhereFiltersWereApplied(tabs);
  };

  const handleApplyNewFilters = async ({ type, newFilters, closeFilters }) => {
    return await applyNewFilters({
      type: type,
      filters: filters,
      newFilters: newFilters,
      closeFilters: closeFilters,
      filterChoices: filterChoices,
      locale: locale,
      token: token,
      handleAddFilters: handleAddFilters,
      handleSetErrorMessage: handleSetErrorMessage,
      tabsWhereFiltersWereApplied,
      handleSetTabsWhereFiltersWereApplied: handleSetTabsWhereFiltersWereApplied,
    });
  };

  const isScrollingUp = !useScrollTrigger({
    disableHysteresis: false,
    threshold: 0,
  });
  const atTopOfPage = TopOfPage({ initTopOfPage: true });
  const showOnScrollUp = isScrollingUp && !atTopOfPage;

  const handleUpdateFilterValues = (valuesToUpdate) => {
    setFilters({
      ...filters,
      ...valuesToUpdate,
    });
  };

  const hubsSubHeaderRef = useRef(null);
  return (
    <>
      <WideLayout
        // hideHeadline
        showOnScrollUp={showOnScrollUp}
        subHeader={<HubsSubHeader hubs={hubs} subHeaderRef={hubsSubHeaderRef} />}
      >
        <MainHeadingContainerMobile />
        <BrowseContent
          applyNewFilters={handleApplyNewFilters}
          filters={filters}
          handleUpdateFilterValues={handleUpdateFilterValues}
          errorMessage={errorMessage}
          filterChoices={filterChoices}
          handleSetErrorMessage={handleSetErrorMessage}
          hubsSubHeaderRef={hubsSubHeaderRef}
          initialLocationFilter={initialLocationFilter}
        />
      </WideLayout>
    </>
  );
}
