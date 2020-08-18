import React from "react";
import ProfilePreview from "./ProfilePreview";
import { Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import InfiniteScroll from "react-infinite-scroller";

const useStyles = makeStyles({
  reset: {
    margin: 0,
    padding: 0,
    listStyleType: "none",
    width: "100%"
  },
  loader: {
    clear: "both"
  }
});

export default function ProfilePreviews({
  profiles,
  loadFunc,
  hasMore,
  showAdditionalInfo,
  parentHandlesGridItems
}) {
  const classes = useStyles();
  const [isLoading, setIsLoading] = React.useState(false);
  const [gridItems, setGridItems] = React.useState(
    profiles.map(p => (
      <GridItem key={p.url_slug} profile={p} showAdditionalInfo={showAdditionalInfo} />
    ))
  );
  if (!loadFunc) hasMore = false;
  const loadMore = async page => {
    if (!isLoading) {
      setIsLoading(true);
      const newProfiles = await loadFunc(page);
      if (!parentHandlesGridItems) {
        console.log("parent doesn't handle grid items");
        const newGridItems = newProfiles.map(p => (
          <GridItem key={p.url_slug} profile={p} showAdditionalInfo={showAdditionalInfo} />
        ));
        setGridItems([...gridItems, ...newGridItems]);
      }
      setIsLoading(false);
    }
  };

  // TODO: use `profile.id` instead of index when using real profiles
  return (
    <InfiniteScroll
      pageStart={0}
      loadMore={loadMore}
      hasMore={hasMore && !isLoading}
      loader={
        <div className={classes.loader} key={1000}>
          Loading ...
        </div>
      }
      element={Grid}
      container
      component="ul"
      className={`${classes.reset} ${classes.root}`}
      spacing={2}
    >
      {parentHandlesGridItems
        ? profiles && profiles.length > 0
          ? profiles.map(p => (
              <GridItem key={p.url_slug} profile={p} showAdditionalInfo={showAdditionalInfo} />
            ))
          : "No Results"
        : gridItems}
    </InfiniteScroll>
  );
}

function GridItem({ profile, showAdditionalInfo }) {
  return (
    <Grid item xs={12} sm={6} md={4} lg={3} component="li">
      <ProfilePreview profile={profile} showAdditionalInfo={showAdditionalInfo} />
    </Grid>
  );
}
