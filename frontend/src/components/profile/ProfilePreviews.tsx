import Grid from "@mui/material/Unstable_Grid2";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import LoadingSpinner from "../general/LoadingSpinner";
import ProfilePreview from "./ProfilePreview";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";

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
  hubUrl,
  isLoading = false,
}: any) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "profile", locale: locale });
  const toProfilePreviews = (profiles) =>
    profiles.map((p) => (
      <GridItem
        key={p.url_slug}
        profile={p}
        showAdditionalInfo={showAdditionalInfo}
        hubUrl={hubUrl}
      />
    ));

  const [gridItems, setGridItems] = React.useState(toProfilePreviews(profiles));

  const loadMore = async () => {
    if (loadFunc) {
      const newProfiles = await loadFunc();
      if (!parentHandlesGridItems) {
        setGridItems([...gridItems, ...toProfilePreviews(newProfiles)]);
      }
    }
  };

  const { lastElementRef } = useInfiniteScroll({
    hasMore: hasMore || false,
    isLoading: isLoading,
    onLoadMore: loadMore,
  });

  const displayedProfiles = parentHandlesGridItems ? profiles : gridItems;

  if (!displayedProfiles || displayedProfiles.length === 0) {
    return <div>{texts.no_members_found}</div>;
  }

  return (
    <>
      <Grid
        className={classes.reset}
        component="ul"
        container
        spacing={1}
      >
        {displayedProfiles.map((profile, index) => {
          const isLastElement = index === displayedProfiles.length - 1;
          return (
            <Grid
              key={profile.props?.profile?.url_slug || profile.url_slug}
              xs={12}
              sm={6}
              md={4}
              lg={3}
              component="li"
              ref={isLastElement ? lastElementRef : null}
            >
              {profile.props ? (
                profile
              ) : (
                <ProfilePreview 
                  profile={profile} 
                  showAdditionalInfo={showAdditionalInfo} 
                  hubUrl={hubUrl} 
                />
              )}
            </Grid>
          );
        })}
      </Grid>
      {isLoading && <LoadingSpinner isLoading />}
    </>
  );
}

function GridItem({ profile, showAdditionalInfo, hubUrl }) {
  return <ProfilePreview profile={profile} showAdditionalInfo={showAdditionalInfo} hubUrl={hubUrl} />;
}
