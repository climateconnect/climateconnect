import React, { Suspense, lazy, useContext, useEffect, useRef, useState } from "react";
import { Container, Theme, useMediaQuery } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import getFilters from "../../../public/data/possibleFilters";
import { getActiveFilterCount } from "../../../public/lib/filterOperations";
import { FilterContext } from "../context/FilterContext";
import FeedbackContext from "../context/FeedbackContext";
import UserContext from "../context/UserContext";
import { HubContext } from "../context/HubContext";
import LoadingSpinner from "../general/LoadingSpinner";
import NoItemsFound from "./NoItemsFound";
import FilterContent from "../filter/FilterContent";
import { useBrowseData } from "../../hooks/useBrowseData";
import { useBrowseUrlSync } from "../../hooks/useBrowseUrlSync";
import { useUpcomingEvents } from "../../hooks/useUpcomingEvents";

const FilterSection = lazy(() => import("../indexPage/FilterSection"));
const ProjectPreviews = lazy(() => import("../project/ProjectPreviews"));
const UpcomingEventsGroup = lazy(() => import("./UpcomingEventsGroup"));

const useStyles = makeStyles((theme) => ({
  contentContainer: {
    paddingTop: theme.spacing(4),
    position: "relative",
    [theme.breakpoints.down("md")]: {
      paddingTop: theme.spacing(2),
    },
  },
  tabContent: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    paddingLeft: theme.spacing(1),
  },
}));

type Props = {
  filterChoices: any;
  initialLocationFilter?: any;
  customSearchBarLabels?: any;
};

export default function BrowseProjectsContent({
  filterChoices,
  initialLocationFilter,
  customSearchBarLabels,
}: Props) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const { hubUrl } = useContext(HubContext);
  const { showFeedbackMessage } = useContext(FeedbackContext);
  const { handleUpdateFilterValues } = useContext(FilterContext);
  const {
    items,
    hasMore,
    isFiltering,
    isFetchingMoreData,
    filters,
    nonFilterParams,
    locationInputRef,
    locationOptionsOpen,
    setLocationOptionsOpen,
    handleApplyNewFilters,
    handleSearchSubmit,
    handleLoadMoreData,
    setNonFilterParams,
  } = useBrowseData("projects");

  const { initializeFromUrl } = useBrowseUrlSync(filterChoices, locale);

  const [filtersExpanded, setFiltersExpanded] = useState(true);
  const [filtersExpandedOnMobile, setFiltersExpandedOnMobile] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const childrenRenderedRef = useRef(false);

  const isSmallScreen = useMediaQuery<Theme>((theme) => theme.breakpoints.down("sm"));

  const {
    visibleEvents,
    featuredProjects,
    bandEventSlugs,
    shouldRenderUpcomingBand,
  } = useUpcomingEvents(filters, hubUrl);

  useEffect(() => {
    if (!initialized) {
      const result = initializeFromUrl("projects", initialLocationFilter, showFeedbackMessage);
      if (result) {
        setNonFilterParams(result.nonFilterParams);
        handleApplyNewFilters({
          newFilters: result.newFilters,
          closeFilters: false,
          filterChoices,
          hubUrl,
          initialLocationFilter,
        });
      }
      setInitialized(true);
    }
  }, [initialized]);

  const possibleFilters = getFilters({ key: "projects", filterChoices, locale });
  const activeFilterCount = getActiveFilterCount(filters, possibleFilters);

  const hasItems = items.length > 0;
  if (hasItems) childrenRenderedRef.current = true;
  const showChildren = hasItems || (isFiltering && childrenRenderedRef.current);
  const shouldShowNoItems = !isFiltering && !hasItems;

  const unexpandFilters = () => setFiltersExpanded(false);
  const unexpandFiltersOnMobile = () => setFiltersExpandedOnMobile(false);

  return (
    <Container maxWidth="lg" className={classes.contentContainer}>
      {isSmallScreen && (
        <Suspense fallback={null}>
          <FilterSection
            activeFilterCount={activeFilterCount}
            filtersExpanded={filtersExpandedOnMobile}
            onSubmit={(type, value) =>
              handleSearchSubmit({ searchValue: value, filterChoices, hubUrl })
            }
            setFiltersExpanded={isSmallScreen ? setFiltersExpandedOnMobile : setFiltersExpanded}
            type="projects"
            customSearchBarLabels={customSearchBarLabels}
          />
        </Suspense>
      )}
      {filtersExpanded && (
        <FilterContent
          className={classes.tabContent}
          type="projects"
          applyFilters={({ type: _type, newFilters, closeFilters, nonFilterParams: _nfp }) =>
            handleApplyNewFilters({
              newFilters,
              closeFilters,
              filterChoices,
              hubUrl,
              initialLocationFilter,
            })
          }
          handleUpdateFilters={handleUpdateFilterValues}
          errorMessage=""
          filtersExpanded={isSmallScreen ? filtersExpandedOnMobile : filtersExpanded}
          handleSetLocationOptionsOpen={setLocationOptionsOpen}
          locationInputRef={locationInputRef}
          locationOptionsOpen={locationOptionsOpen}
          possibleFilters={possibleFilters}
          unexpandFilters={isSmallScreen ? unexpandFiltersOnMobile : unexpandFilters}
          initialLocationFilter={initialLocationFilter}
          nonFilterParams={nonFilterParams}
          searchSubmit={(type, value) =>
            handleSearchSubmit({ searchValue: value, filterChoices, hubUrl })
          }
        />
      )}
      {shouldRenderUpcomingBand && (
        <Suspense fallback={null}>
          <UpcomingEventsGroup events={visibleEvents} hubUrl={hubUrl} />
        </Suspense>
      )}
      {isFiltering && !childrenRenderedRef.current && <LoadingSpinner isLoading />}
      <div style={{ opacity: isFiltering && showChildren ? 0.5 : 1, transition: "opacity 150ms" }}>
        {showChildren && (
          <Suspense fallback={null}>
            <ProjectPreviews
              hasMore={hasMore}
              loadFunc={() => handleLoadMoreData(hubUrl)}
              parentHandlesGridItems
              projects={items.filter((p: any) => !bandEventSlugs.has(p.url_slug))}
              featuredProjects={featuredProjects}
              hubUrl={hubUrl}
              isLoading={isFetchingMoreData}
              analyticsSurface="browse_card"
            />
          </Suspense>
        )}
      </div>
      {shouldShowNoItems && <NoItemsFound type="projects" hubName="" />}
    </Container>
  );
}
