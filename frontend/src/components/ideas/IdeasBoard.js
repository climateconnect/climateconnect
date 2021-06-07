import { makeStyles, useMediaQuery } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { getCommentsObjectAfterAddingComments } from "../../../public/lib/communicationOperations";
import ElementSpaceToTop from "../hooks/ElementSpaceToTop";
import IdeaPreviews from "./IdeaPreviews";
import IdeaRoot from "./IdeaRoot";

const useStyles = makeStyles({
  root: (props) => ({
    display: props.ideaOpen ? "flex" : "default",
    flex: "1 1 0px",
  }),
  idea: {
    flex: "1 1 0px",
    position: "relative"
  },
  ideaPreviews: {
    flex: "1 1 0px",
  },
});
export default function IdeasBoard({
  hasMore,
  loadFunc,
  ideas,
  allHubs,
  userOrganizations,
  onUpdateIdeaRating,
}) {
  const [idea, setIdea] = useState(null);
  const [ideaContainerEl, setIdeaContainerEl] = useState(null)
  const containerOffsetTop = ElementSpaceToTop({el: ideaContainerEl})
  const classes = useStyles({ ideaOpen: idea !== null });
  const isNarrowScreen = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  useEffect(
    function () {
      if (idea && ideas.filter((i) => i.url_slug === idea.url_slug).length === 1) {
        setIdea(ideas.filter((i) => i.url_slug === idea.url_slug)[0]);
      }
    },
    [ideas]
  );

  const onClickIdea = async (idea) => {
    setIdea({...idea});
  };

  const onClose = () => {
    setIdea(null);
  };

  const handleUpdateRating = (newRating) => {
    onUpdateIdeaRating(idea, newRating);
  };

  const handleAddComments = (comments) => {
    setIdea({
      ...idea,
      comments: getCommentsObjectAfterAddingComments(comments, idea.comments || []) || [],
    });
  };

  const handleRemoveComment = (c) => {
    setIdea({
      ...idea,
      comments: [...idea.comments.filter((pc) => pc.id !== c.id)]
    })
  }

  return (
    <div className={classes.root}>
      <IdeaPreviews
        hasMore={hasMore}
        loadFunc={loadFunc}
        parentHandlesGridItems
        ideas={ideas}
        allHubs={allHubs}
        userOrganizations={userOrganizations}
        onClickIdea={onClickIdea}
        hasIdeaOpen={!!idea}
        className={classes.ideaPreviews}
      />
      {idea && !isNarrowScreen && (
        <div className={classes.idea} ref={(node) => {
          if (node) {
            setIdeaContainerEl(node);
          }
        }}>
          <IdeaRoot
            idea={idea}
            onIdeaClose={onClose}
            onRatingChange={handleUpdateRating}
            handleAddComments={handleAddComments}
            handleRemoveComment={handleRemoveComment}
            containerOffsetTop={containerOffsetTop.screen}
          />
        </div>
      )}
      {idea && isNarrowScreen && (
        /* display mobile idea */
        <IdeaRoot
          idea={idea}
          onIdeaClose={onClose}
          onRatingChange={handleUpdateRating}
          handleAddComments={handleAddComments}
          handleRemoveComment={handleRemoveComment}
        />
      )}
    </div>
  );
}
