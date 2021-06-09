import { makeStyles, useMediaQuery } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { getCommentsObjectAfterAddingComments } from "../../../public/lib/communicationOperations";
import ElementSpaceToTop from "../hooks/ElementSpaceToTop";
import IdeaPreviews from "./IdeaPreviews";
import IdeaRoot from "./IdeaRoot";
import MobileIdeaPage from "./MobileIdeaPage";

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
    flex: "1 1 0px"
  },
});
export default function IdeasBoard({
  hasMore,
  loadFunc,
  ideas,
  allHubs,
  userOrganizations,
  onUpdateIdeaRating,
  initialIdeaUrlSlug,
  hubLocation,
}) {
  const getInitialIdea = (initialIdeaUrlSlug) => {   
    //Short circuit if there is no idea open 
    if(!initialIdeaUrlSlug)
      return null
    const initialIdeaObject = ideas.filter((i) => i.url_slug === initialIdeaUrlSlug)
    if(initialIdeaObject.length !== 0) {
      return initialIdeaObject[0]
    }
  }
  const [idea, setIdea] = useState(getInitialIdea(initialIdeaUrlSlug));
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
    setIdea({...idea, index: ideas.indexOf(idea)});
    window.history.pushState({}, "", `${window.location.origin}${window.location.pathname}?idea=${idea.url_slug}${window.location.hash}`)
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
        hubLocation={hubLocation}
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
            containerOffsetTop={containerOffsetTop}
            userOrganizations={userOrganizations}
            allHubs={allHubs}
          />
        </div>
      )}
      {idea && isNarrowScreen && (
        /* display mobile idea */
        <MobileIdeaPage
          idea={idea}
          onIdeaClose={onClose}
          onRatingChange={handleUpdateRating}
          handleAddComments={handleAddComments}
          handleRemoveComment={handleRemoveComment}
          userOrganizations={userOrganizations}
          allHubs={allHubs}
        />
      )}
    </div>
  );
}
