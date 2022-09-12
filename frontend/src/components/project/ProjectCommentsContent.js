import { Divider, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React, { useContext } from "react";

// Relative imports
import { apiRequest } from "../../../public/lib/apiOperations.js";
import { getCommentsObjectAfterAddingComment } from "../../../public/lib/communicationOperations.js";
import getTexts from "../../../public/texts/texts.js";
import CommentInput from "../communication/CommentInput.js";
import UserContext from "../context/UserContext.js";
import Posts from "./../communication/Posts.js";
import ProjectSliderWithTitle from "./ProjectSliderWithTitle.js";

const useStyles = makeStyles((theme) => {
  return {
    divider: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
  };
});

export default function CommentsContent({
  user,
  project,
  token,
  setCurComments,
  screenSize,
  similarProjects,
}) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale: locale });
  const comments = project.comments;

  const handleRemoveComment = (c) => {
    setCurComments([...project.comments.filter((pc) => pc.id !== c.id)]);
  };

  const handleAddComment = (c) => {
    setCurComments(getCommentsObjectAfterAddingComment(c, project.comments));
  };

  const onSendComment = async (curComment, parent_comment, clearInput, setDisplayReplies) => {
    const comment = curComment;
    const payload = { content: comment, project: project.id };
    handleAddComment({
      parent_comment_id: parent_comment,
      id: null,
      author_user: user,
      content: comment,
      created_at: new Date(),
      replies: [],
      unconfirmed: true,
    });
    clearInput();
    if (parent_comment) payload.parent_comment = parent_comment;
    try {
      const resp = await apiRequest({
        url: "/api/projects/" + project.url_slug + "/comment/",
        payload: payload,
        method: "post",
        token: token,
        locale: locale,
        shouldThrowError: true,
      });
      handleAddComment(resp.data.comment);
      if (setDisplayReplies) setDisplayReplies(true);
    } catch (err) {
      console.log(err);
      if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
      return null;
    }
  };

  const onDeleteComment = async (post) => {
    try {
      await apiRequest({
        method: "delete",
        url: "/api/projects/" + project.url_slug + "/comment/" + post.id + "/",
        token: token,
        locale: locale,
      });
      handleRemoveComment(post);
    } catch (err) {
      console.log(err);
      if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
      return null;
    }
  };

  return (
    <div>
      <CommentInput user={user} onSendComment={onSendComment} hasComments={comments.length > 0} />
      <Typography>{comments.length + " " + texts.comments}</Typography>
      <Divider className={classes.divider} />
      {comments && comments.length > 0 && (
        <Posts
          posts={comments}
          type="openingpost"
          maxLines={4}
          user={user}
          onSendComment={onSendComment}
          onDeletePost={onDeleteComment}
        />
      )}

      {screenSize.belowSmall && (
        <ProjectSliderWithTitle
          title={texts.you_may_also_like_these_projects}
          similarProjects={similarProjects}
        >
          {" "}
        </ProjectSliderWithTitle>
      )}
    </div>
  );
}
