import React from "react";
import Posts from "./../communication/Posts.js";
import CommentInput from "../communication/CommentInput.js";
import { Typography, Divider } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import tokenConfig from "../../../public/config/tokenConfig.js";
import axios from "axios";

const useStyles = makeStyles(theme => {
  return {
    divider: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1)
    }
  };
});

export default function CommentsContent({ user, project, token, setCurComments }) {
  const classes = useStyles();
  const comments = project.comments;
  const handleAddComment = c => {
    if (c.parent_comment_id) {
      const parent_comment = project.comments.find(pc => pc.id === c.parent_comment_id);
      const newCurComments = [
        ...project.comments.filter(c => c.id !== parent_comment.id),
        { ...parent_comment, replies: [...parent_comment.replies, c] }
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setCurComments(newCurComments);
    } else setCurComments([c, ...project.comments]);
  };

  const handleRemoveComment = c => {
    setCurComments([...project.comments.filter(pc => pc.id !== c.id)]);
  };

  const onSendComment = async (curComment, parent_comment, clearInput, setDisplayReplies) => {
    const comment = curComment;
    const payload = { content: comment, project: project.id };
    if (parent_comment) payload.parent_comment = parent_comment;
    try {
      const resp = await axios.post(
        process.env.API_URL + "/api/projects/" + project.url_slug + "/comment/",
        payload,
        tokenConfig(token)
      );
      handleAddComment(resp.data.comment);
      if (setDisplayReplies) setDisplayReplies(true);
      clearInput();
    } catch (err) {
      console.log(err);
      if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
      return null;
    }
  };

  const onDeleteComment = async post => {
    try {
      await axios.delete(
        process.env.API_URL + "/api/projects/" + project.url_slug + "/comment/" + post.id + "/",
        tokenConfig(token)
      );
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
      <Typography>{comments.length + " comments"}</Typography>
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
