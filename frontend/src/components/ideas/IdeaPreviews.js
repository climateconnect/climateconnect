import { Grid, makeStyles } from "@material-ui/core";
import React, { useContext } from "react";
import InfiniteScroll from "react-infinite-scroller";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import LoadingSpinner from "../general/LoadingSpinner";
import IdeaPreview from "./IdeaPreview";

const useStyles = makeStyles((theme) => ({
  reset: {
    margin: 0,
    padding: 0,
    listStyleType: "none",
    width: "100%",
  },
}));

const toIdeaPreviews = (ideas, onClickIdea, isNarrowScreen) => {
  return ideas.map(
    (idea) => <GridItem onClickIdea={onClickIdea} key={idea.url_slug} 
    idea={idea} isNarrowScreen={isNarrowScreen} />
  )
};

export default function IdeaPreviews({
  hasMore,
  isFetchingMore,
  loadMore,
  parentHandlesGridItems,
  ideas,
  allHubs,
  userOrganizations,
  onClickIdea,
  isNarrowScreen
}) {
  const classes = useStyles();
  const [gridItems, setGridItems] = React.useState(toIdeaPreviews(ideas, onClickIdea, isNarrowScreen));
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "idea", locale: locale });
  return (
    <>
      <InfiniteScroll
        className={classes.reset}
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
        <GridItem isCreateCard allHubs={allHubs} userOrganizations={userOrganizations} />
        {parentHandlesGridItems ? toIdeaPreviews(ideas, onClickIdea, isNarrowScreen) : gridItems}
        {isFetchingMore && <LoadingSpinner isLoading key="idea-previews-spinner" />}
      </InfiniteScroll>
    </>
  );
}

function GridItem({ idea, isCreateCard, allHubs, userOrganizations, onClickIdea, isNarrowScreen }) {
  return (
    <Grid
      key={idea ? idea.url_slug : "createCard"}
      item
      xs={12}
      sm={6}
      md={!isNarrowScreen ? 6: 3}
      lg={!isNarrowScreen ? 6: 3}
      component="li"
    >
      <IdeaPreview
        allHubs={allHubs}
        idea={idea}
        isCreateCard={isCreateCard}
        userOrganizations={userOrganizations}
        onClickIdea={onClickIdea}
      />
    </Grid>
  );
}
