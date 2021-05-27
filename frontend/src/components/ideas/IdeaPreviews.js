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

const toIdeaPreviews = (ideas, onClickIdea) => {
  return ideas.map((idea) => <GridItem onClickIdea={onClickIdea} key={idea.url_slug} idea={idea} />)
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
}) {
  const classes = useStyles();
  const [gridItems, setGridItems] = React.useState(toIdeaPreviews(ideas, onClickIdea));
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
        {parentHandlesGridItems ? toIdeaPreviews(ideas, onClickIdea) : gridItems}
        {isFetchingMore && <LoadingSpinner isLoading key="idea-previews-spinner" />}
      </InfiniteScroll>
    </>
  );
}

function GridItem({ idea, isCreateCard, allHubs, userOrganizations, onClickIdea }) {
  return (
    <Grid
      key={idea ? idea.url_slug : "createCard"}
      item
      xs={12}
      sm={6}
      md={3}
      lg={3}
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
