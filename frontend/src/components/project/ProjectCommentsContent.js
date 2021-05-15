import { Divider, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React, { useContext } from "react";
import { apiRequest } from "../../../public/lib/apiOperations.js";
import getTexts from "../../../public/texts/texts.js";
import CommentInput from "../communication/CommentInput.js";
import UserContext from "../context/UserContext.js";
import Posts from "./../communication/Posts.js";

const useStyles = makeStyles((theme) => {
  return {
    divider: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
  };
});

export default function CommentsContent({ user, project, token, setCurComments }) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale: locale });
  const comments = project.comments;
  const handleAddComment = (c) => {
    if (c.parent_comment_id) {
      const parent_comment = project.comments.find((pc) => pc.id === c.parent_comment_id);
      const newCurComments = [
        ...project.comments.filter((c) => c.id !== parent_comment.id),
        { ...parent_comment, replies: [...parent_comment.replies, c] },
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setCurComments(newCurComments);
    } else {
      setCurComments([
        c,
        ...project.comments.filter(
          (oc) =>
            !(oc.content === c.content && oc.author_user.id === c.author_user.id && oc.unconfirmed)
        ),
      ]);
    }
  };

  const handleRemoveComment = (c) => {
    setCurComments([...project.comments.filter((pc) => pc.id !== c.id)]);
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
      <CommentInput user={user} onSendComment={onSendComment} />
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
    </div>
  );
}
