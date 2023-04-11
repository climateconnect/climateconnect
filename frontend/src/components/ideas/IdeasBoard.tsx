import { Theme, useMediaQuery } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext, useEffect, useState } from "react";
import { getCommentsObjectAfterAddingComments } from "../../../public/lib/communicationOperations";
import { getInfoMetadataByType } from "../../../public/lib/parsingOperations";
import { getFilterUrl } from "../../../public/lib/urlOperations";
import UserContext from "../context/UserContext";
import ElementSpaceToTop from "../hooks/ElementSpaceToTop";
import IdeaPreviews from "./IdeaPreviews";
import IdeaRoot from "./IdeaRoot";
import MobileIdeaPage from "./MobileIdeaPage";

const useStyles = makeStyles<Theme, { ideaOpen?: boolean }>({
  root: (props) => ({
    display: props.ideaOpen ? "flex" : "default",
    flex: "1 1 0px",
  }),
  idea: {
    flex: "1 1 0px",
    position: "relative",
  },
  ideaPreviews: (props) => ({
    flex: "1 1 0px",
    minHeight: props.ideaOpen ? 1500 : "default",
  }),
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
  hubData,
  filters,
  filterChoices,
  resetTabsWhereFiltersWereApplied,
}) {
  const { locale } = useContext(UserContext);
  const getInitialIdea = (initialIdeaUrlSlug) => {
    //Short circuit if there is no idea open
    if (!initialIdeaUrlSlug) return null;
    const initialIdeaObject = ideas.filter((i) => i.url_slug === initialIdeaUrlSlug);
    if (initialIdeaObject.length !== 0) {
      return initialIdeaObject[0];
    }
  };
  const [idea, setIdea] = useState(getInitialIdea(initialIdeaUrlSlug));
  const [ideaContainerEl, setIdeaContainerEl] = useState<HTMLDivElement | null>(null);
  const containerOffsetTop = ElementSpaceToTop({ el: ideaContainerEl });
  const classes = useStyles({ ideaOpen: idea !== null });
  const isNarrowScreen = useMediaQuery<Theme>((theme) => theme.breakpoints.down("md"));
  useEffect(
    function () {
      if (idea && ideas.filter((i) => i.url_slug === idea.url_slug).length === 1) {
        setIdea(ideas.filter((i) => i.url_slug === idea.url_slug)[0]);
      }
    },
    [ideas]
  );

  const onClickIdea = async (idea) => {
    setIdea({ ...idea, index: ideas.indexOf(idea) });
    const newUrl = getFilterUrl({
      activeFilters: filters,
      infoMetadata: getInfoMetadataByType("ideas"),
      filterChoices: filterChoices,
      locale: locale,
      idea: idea,
    });
    window.history.pushState({}, "", newUrl);
  };

  const onClose = () => {
    setIdea(null);
    window.history.pushState(
      {},
      "",
      `${window.location.origin}${window.location.pathname}${window.location.hash}`
    );
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

  const handleRemoveComment = (comment) => {
    // remove a top comment
    if (comment.parent_comment_id === null) {
      setIdea({
        ...idea,
        comments: [...idea.comments.filter((pc) => pc.id !== comment.id)],
      });
      // remove a reply comment
    } else {
      const tempIdeaComments = idea.comments;
      const parentCommentIndex = tempIdeaComments.findIndex(
        (c) => c.id === comment.parent_comment_id
      );

      const filterOutReplies = [
        ...tempIdeaComments[parentCommentIndex].replies.filter((pc) => pc.id !== comment.id),
      ];
      tempIdeaComments[parentCommentIndex].replies = filterOutReplies;

      setIdea({
        ...idea,
        comments: tempIdeaComments,
      });
    }
  };

  const handleSetComments = (newComments) => {
    setIdea({
      ...idea,
      comments: newComments,
    });
  };

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
        hubData={hubData}
        resetTabsWhereFiltersWereApplied={resetTabsWhereFiltersWereApplied}
      />
      {idea && !isNarrowScreen && (
        <div
          className={classes.idea}
          ref={(node) => {
            if (node) {
              setIdeaContainerEl(node);
            }
          }}
        >
          <IdeaRoot
            idea={idea}
            onIdeaClose={onClose}
            onRatingChange={handleUpdateRating}
            handleAddComments={handleAddComments}
            handleRemoveComment={handleRemoveComment}
            handleSetComments={handleSetComments}
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
          handleSetComments={handleSetComments}
          handleRemoveComment={handleRemoveComment}
          userOrganizations={userOrganizations}
          allHubs={allHubs}
        />
      )}
    </div>
  );
}
