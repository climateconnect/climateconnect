import React from "react";
import ProfilePreview from "./ProfilePreview";
import { Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import InfiniteScroll from "react-infinite-scroller";
import CircularProgress from "@material-ui/core/CircularProgress";

const useStyles = makeStyles({
  reset: {
    margin: 0,
    padding: 0,
    listStyleType: "none",
    width: "100%",
  },
  spinner: {
    marginTop: "48px",
  },
});

export default function ProfilePreviews({
  profiles,
  loadFunc,
  hasMore,
  showAdditionalInfo,
  parentHandlesGridItems,
}) {
  const classes = useStyles();
  const toProfilePreviews = (profiles) =>
    profiles.map((p) => (
      <GridItem key={p.url_slug} profile={p} showAdditionalInfo={showAdditionalInfo} />
    ));
  const [isLoading, setIsLoading] = React.useState(false);
  const [gridItems, setGridItems] = React.useState(toProfilePreviews(profiles));

  if (!loadFunc) hasMore = false;
  const loadMore = async (page) => {
    if (!isLoading) {
      setIsLoading(true);
      const newProfiles = await loadFunc(page);
      if (!parentHandlesGridItems) {
        setGridItems([...gridItems, ...toProfilePreviews(newProfiles)]);
      }
      setIsLoading(false);
    }
  };

  const loadingSpinner = () => {
    return isLoading ? (
      <Grid container justify="center">
        <CircularProgress className={classes.spinner} />
      </Grid>
    ) : null;
  };

  // TODO: use `profile.id` instead of index when using real profiles
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
        ? profiles && profiles.length > 0
          ? toProfilePreviews(profiles)
          : "No Results"
        : gridItems}
      {loadingSpinner()}
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
