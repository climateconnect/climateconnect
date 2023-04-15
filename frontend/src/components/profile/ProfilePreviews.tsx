import Grid from "@mui/material/Unstable_Grid2";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import InfiniteScroll from "react-infinite-scroller";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import InfiniteScrollGrid from "../general/InfiniteScrollGrid";
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
}: any) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "profile", locale: locale });
  const toProfilePreviews = (profiles) =>
    profiles.map((p) => (
      <GridItem key={p.url_slug} profile={p} showAdditionalInfo={showAdditionalInfo} />
    ));

  const [gridItems, setGridItems] = React.useState(toProfilePreviews(profiles));
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
      const newProfiles = await loadFunc(page);
      if (!parentHandlesGridItems) {
        setGridItems([...gridItems, ...toProfilePreviews(newProfiles)]);
      }
      setIsFetchingMore(false);
    }
  };

  // TODO: use `profile.id` instead of index when using real profiles
  return (
    <>
      <InfiniteScrollGrid
        className={`${classes.reset} ${/*TODO(undefined) classes.root*/ ""}`}
        component="ul"
        container
        element={Grid}
        // We block subsequent invocations from InfinteScroll until we update local state
        hasMore={hasMore && !isFetchingMore}
        loadMore={loadMore}
        pageStart={0}
        // spacing={2}
      >
        {parentHandlesGridItems
          ? profiles && profiles.length > 0
            ? toProfilePreviews(profiles)
            : texts.no_members_found
          : gridItems}
        {isFetchingMore && <LoadingSpinner isLoading key="profile-previews-spinner" />}
      </InfiniteScrollGrid>
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
