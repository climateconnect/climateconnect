import Grid from "@mui/material/Unstable_Grid2";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import InfiniteScrollGrid from "../general/InfiniteScrollGrid";
import LoadingSpinner from "../general/LoadingSpinner";
import OrganizationPreview from "./OrganizationPreview";

const useStyles = makeStyles({
  reset: {
    margin: 0,
    padding: 0,
    listStyleType: "none",
    width: "100%",
  },
});

export default function OrganizationPreviews({
  hasMore,
  loadFunc,
  organizations,
  parentHandlesGridItems,
  hubUrl,
}) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "organization", locale: locale });
  const toOrganizationPreviews = (organizations) =>
    organizations.map((o) => <GridItem key={o.url_slug} organization={o} hubUrl={hubUrl} />);

  const [gridItems, setGridItems] = React.useState(toOrganizationPreviews(organizations));
  const [isFetchingMore, setIsFetchingMore] = React.useState(false);

  if (!loadFunc) {
    hasMore = false;
  }

  const loadMore = async (page) => {
    // Sometimes InfiniteScroll calls loadMore twice really fast. Therefore
    // to improve performance, we aim to guard against subsequent
    // fetches to the API by maintaining a local state flag.
    if (!isFetchingMore) {
      setIsFetchingMore(true);
      const newOrganizations = await loadFunc(page);
      if (!parentHandlesGridItems) {
        setGridItems([...gridItems, ...toOrganizationPreviews(newOrganizations)]);
      }
      setIsFetchingMore(false);
    }
  };

  // TODO: use `organization.id` instead of index when using real organizations
  return (
    <>
      <InfiniteScrollGrid
        className={`${classes.reset}`}
        component="ul"
        container
        element={Grid}
        // We block subsequent invocations from InfinteScroll until we update local state
        hasMore={hasMore && !isFetchingMore}
        loadMore={loadMore}
        pageStart={0}
        spacing={2}
      >
        {parentHandlesGridItems
          ? organizations && organizations.length > 0
            ? toOrganizationPreviews(organizations)
            : texts.no_organization_found
          : gridItems}
        {isFetchingMore && <LoadingSpinner isLoading key="organization-previews-spinner" />}
      </InfiniteScrollGrid>
    </>
  );
}

function GridItem({ organization, hubUrl }) {
  return (
    <Grid key={organization.url_slug} xs={12} sm={6} md={4} lg={3} component="li">
      <OrganizationPreview organization={organization} hubUrl={hubUrl} />
    </Grid>
  );
}
