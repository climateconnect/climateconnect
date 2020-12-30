import React from "react";
import { Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import InfiniteScroll from "react-infinite-scroller";

import LoadingSpinner from "../general/LoadingSpinner";

import ProfilePreview from "./ProfilePreview";

const useStyles = makeStyles({
  reset: {
    margin: 0,
    padding: 0,
    listStyleType: "none",
    width: "100%",
  },
});

export default function ProfilePreviews({
  hasMore,
  loadFunc,
  parentHandlesGridItems,
  profiles,
  showAdditionalInfo,
}) {
  const classes = useStyles();

  const toProfilePreviews = (profiles) =>
    profiles.map((p) => (
      <GridItem key={p.url_slug} profile={p} showAdditionalInfo={showAdditionalInfo} />
    ));

  const [gridItems, setGridItems] = React.useState(toProfilePreviews(profiles));

  if (!loadFunc) {
    hasMore = false;
  }

  const loadMore = async (page) => {
    if (hasMore) {
      const newProfiles = await loadFunc(page);
      if (!parentHandlesGridItems) {
        setGridItems([...gridItems, ...toProfilePreviews(newProfiles)]);
      }
    }
  };

  // TODO: use `profile.id` instead of index when using real profiles
  return (
    <>
      <InfiniteScroll
        className={`${classes.reset} ${classes.root}`}
        component="ul"
        container
        element={Grid}
        hasMore={hasMore}
        loader={<LoadingSpinner isLoading key="profile-previews-spinner" />}
        loadMore={loadMore}
        pageStart={0}
        spacing={2}
      >
        {parentHandlesGridItems
          ? profiles && profiles.length > 0
            ? toProfilePreviews(profiles)
            : "No members found."
          : gridItems}
      </InfiniteScroll>
    </>
  );
}

function GridItem({ profile, showAdditionalInfo }) {
  return (
    <Grid item xs={12} sm={6} md={4} lg={3} component="li">
      <ProfilePreview profile={profile} showAdditionalInfo={showAdditionalInfo} />
    </Grid>
  );
}
