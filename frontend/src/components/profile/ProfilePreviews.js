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
  }
});

export default function ProfilePreviews({ profiles, loadFunc, hasMore, showAdditionalInfo }) {
  const classes = useStyles();
  const [gridItems, setGridItems] = React.useState(
    profiles.map((o, index) => (
      <GridItem key={index} profile={o} showAdditionalInfo={showAdditionalInfo} />
    ))
  );
  if (!loadFunc) hasMore = false;
  const loadMore = async page => {
    const newProfiles = await loadFunc(page);
    const newGridItems = newProfiles.map((o, index) => (
      <GridItem key={(index + 1) * page} profile={o} showAdditionalInfo={showAdditionalInfo} />
    ));
    setGridItems([...gridItems, ...newGridItems]);
  };

  // TODO: use `profile.id` instead of index when using real profiles
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

function GridItem({ profile, showAdditionalInfo }) {
  return (
    <Grid item xs={12} sm={6} md={4} lg={3} component="li">
      <ProfilePreview profile={profile} showAdditionalInfo={showAdditionalInfo} />
    </Grid>
  );
}
