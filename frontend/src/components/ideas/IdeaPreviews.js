import { Grid, makeStyles } from "@material-ui/core";
import React from "react";
import InfiniteScroll from "react-infinite-scroller";
import LoadingSpinner from "../general/LoadingSpinner";
import IdeaPreview from "./IdeaPreview";

const useStyles = makeStyles({
  reset: {
    margin: 0,
    padding: 0,
    listStyleType: "none",
    width: "100%",
  },
});

const toIdeaPreviews = (ideas, onClickIdea, hasIdeaOpen) => {
  return ideas.map((idea, index) => (
    <GridItem
      index={index}
      onClickIdea={onClickIdea}
      key={idea.url_slug}
      idea={idea}
      hasIdeaOpen={hasIdeaOpen}
    />
  ));
};

export default function IdeaPreviews({
  hasMore,
  loadFunc,
  parentHandlesGridItems,
  ideas,
  allHubs,
  userOrganizations,
  onClickIdea,
  hasIdeaOpen,
  className,
  hubLocation,
}) {
  const classes = useStyles();
  const [gridItems, setGridItems] = React.useState(toIdeaPreviews(ideas, onClickIdea, hasIdeaOpen));

  const [isFetchingMore, setIsFetchingMore] = React.useState(false);

  if (!loadFunc) {
    hasMore = false;
  }

  const loadMore = async () => {
    // Sometimes InfiniteScroll calls loadMore twice really fast. Therefore
    // to improve performance, we aim to guard against subsequent
    // fetches to the API by maintaining a local state flag.
    if (!isFetchingMore) {
      setIsFetchingMore(true);
      const newIdeas = await loadFunc();
      if (!parentHandlesGridItems) {
        setGridItems([...gridItems, ...toIdeaPreviews(newIdeas)]);
      }
      setIsFetchingMore(false);
    }
  };

  return (
    <>
      <InfiniteScroll
        className={`${classes.reset} ${className}`}
        component="ul"
        container
        // TODO: fix this: InfiniteScroll is throwing a React error:
        // Failed prop type: Invalid prop `element` supplied to `InfiniteScroll`, expected a ReactNode.
        element={Grid}
        // We block subsequent invocations from InfinteScroll until we update local state
        hasMore={hasMore && !isFetchingMore}
        loadMore={loadMore}
        pageStart={1}
        spacing={2}
      >
        <GridItem
          isCreateCard
          allHubs={allHubs}
          userOrganizations={userOrganizations}
          hasIdeaOpen={hasIdeaOpen}
          hubLocation={hubLocation}
        />
        {parentHandlesGridItems ? toIdeaPreviews(ideas, onClickIdea, hasIdeaOpen) : gridItems}
        {isFetchingMore && <LoadingSpinner isLoading key="idea-previews-spinner" />}
      </InfiniteScroll>
    </>
  );
}

function GridItem({
  idea,
  isCreateCard,
  allHubs,
  userOrganizations,
  onClickIdea,
  hasIdeaOpen,
  index,
  hubLocation,
}) {
  return (
    <Grid
      key={idea ? idea.url_slug : "createCard"}
      item
      xs={6}
      sm={4}
      md={hasIdeaOpen ? 6 : 3}
      lg={hasIdeaOpen ? 4 : 2}
      component="li"
    >
      <IdeaPreview
        allHubs={allHubs}
        idea={idea}
        isCreateCard={isCreateCard}
        userOrganizations={userOrganizations}
        onClickIdea={onClickIdea}
        index={index}
        hubLocation={hubLocation}
      />
    </Grid>
  );
}
