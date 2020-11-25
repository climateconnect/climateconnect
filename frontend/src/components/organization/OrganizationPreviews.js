import React from "react";
import OrganizationPreview from "./OrganizationPreview";
import { Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import InfiniteScroll from "react-infinite-scroller";
import CircularProgress from "@material-ui/core/CircularProgress";

const useStyles = makeStyles({
  reset: {
    margin: 0,
    padding: 0,
    listStyleType: "none",
    width: "100%"
  },
  spinner: {
    marginTop: '48px'
  }
});

export default function OrganizationPreviews({
  organizations,
  loadFunc,
  hasMore,
  showOrganizationType,
  parentHandlesGridItems
}) {
  const toOrganizationPreviews = (organizations) => organizations.map(o => (
      <GridItem
          key={o.url_slug}
          organization={o}
          showOrganizationType={showOrganizationType}
      />
  ));
  const [isLoading, setIsLoading] = React.useState(false);
  const classes = useStyles();
  const [gridItems, setGridItems] = React.useState(toOrganizationPreviews(organizations));

  if (!loadFunc) hasMore = false;
  const loadMore = async page => {
    if (!isLoading) {
      setIsLoading(true);
      const newOrganizations = await loadFunc(page);
      if (!parentHandlesGridItems) {
        setGridItems([...gridItems, ...toOrganizationPreviews(newOrganizations)]);
      }
      setIsLoading(false);
    }
  };

  const loadingSpinner = () => {
    return (
        isLoading ? (
            <Grid container justify="center">
              <CircularProgress className={classes.spinner} />
            </Grid>
        ) : null
    )
  };

  // TODO: use `organization.id` instead of index when using real organizations
  return (
    <InfiniteScroll
      pageStart={0}
      loadMore={loadMore}
      hasMore={hasMore && !isLoading}
      element={Grid}
      container
      component="ul"
      className={`${classes.reset} ${classes.root}`}
      spacing={2}
    >
      {parentHandlesGridItems
        ? organizations && organizations.length > 0
          ? toOrganizationPreviews(organizations)
          : "No Results"
        : gridItems}
      {loadingSpinner()}
    </InfiniteScroll>
  );
}

function GridItem({ organization, showOrganizationType }) {
  return (
    <Grid key={organization.url_slug} item xs={12} sm={6} md={4} lg={3} component="li">
      <OrganizationPreview
        organization={organization}
        showOrganizationType={showOrganizationType}
      />
    </Grid>
  );
}
