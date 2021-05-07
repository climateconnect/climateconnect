import { Grid, makeStyles } from "@material-ui/core"
import React from "react"
import InfiniteScroll from "react-infinite-scroller"
import LoadingSpinner from "../general/LoadingSpinner"
import IdeaPreview from "./IdeaPreview"

const useStyles = makeStyles(theme => ({
  reset: {
    margin: 0,
    padding: 0,
    listStyleType: "none",
    width: "100%",
  },
}))

export default function IdeaPreviews({
  hasMore, 
  isFetchingMore, 
  loadMore, 
  parentHandlesGridItems,
  ideas
}) {
  const classes = useStyles()
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
        <GridItem isCreateCard/>
        {isFetchingMore && <LoadingSpinner isLoading key="idea-previews-spinner" />}
      </InfiniteScroll>
    </>
  )
}

function GridItem({ idea, isCreateCard }) {
  return (
    <Grid key={idea ? idea.url_slug : "createCard"} item xs={12} sm={6} md={3} lg={3} component="li">
      <IdeaPreview idea={idea} isCreateCard={isCreateCard} />
    </Grid>
  );
}
