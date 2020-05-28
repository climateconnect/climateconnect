import React from "react";
import OrganizationPreview from "./OrganizationPreview";
import { Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import InfiniteScroll from "react-infinite-scroller";

const useStyles = makeStyles({
  reset: {
    margin: 0,
    padding: 0,
    listStyleType: "none",
    width: "100%"
  }
});

export default function OrganizationPreviews({ organizations, loadFunc, hasMore }) {
  const classes = useStyles();
  const [gridItems, setGridItems] = React.useState(
    organizations.map((o, index) => <GridItem key={index} organization={o} />)
  );
  if (!loadFunc) hasMore = false;
  const loadMore = async page => {
    const newOrganizations = await loadFunc(page);
    const newGridItems = newOrganizations.map((o, index) => (
      <GridItem key={(index + 1) * page} organization={o} />
    ));
    setGridItems([...gridItems, ...newGridItems]);
  };

  // TODO: use `organization.id` instead of index when using real organizations
  return (
    <InfiniteScroll
      pageStart={0}
      loadMore={loadMore}
      hasMore={hasMore}
      loader={
        <div className="loader" key={0}>
          Loading ...
        </div>
      }
      element={Grid}
      container
      component="ul"
      className={`${classes.reset} ${classes.root}`}
      spacing={2}
    >
      {gridItems}
    </InfiniteScroll>
  );
}

function GridItem({ organization }) {
  return (
    <Grid item xs={12} sm={6} md={4} lg={3} component="li">
      <OrganizationPreview organization={organization} />
    </Grid>
  );
}