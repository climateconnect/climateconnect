import { Divider, makeStyles, Typography } from "@material-ui/core";
import React, { useContext } from "react";
import Cookies from "universal-cookie";
import { apiRequest } from "../../../public/lib/apiOperations";
import getTexts from "../../../public/texts/texts";
import CommentInput, { INFO_TEXT_SIZES } from "../communication/CommentInput";
import Posts from "../communication/Posts";
import UserContext from "../context/UserContext";

const useStyles = makeStyles((theme) => ({
  root: {
    background: "#E9E9E9",
    borderTop: `1px solid ${theme.palette.secondary.light}`,
    height: 400,
  },
  content: {
    padding: theme.spacing(1),
    marginLeft: theme.spacing(4),
    marginRight: theme.spacing(4),
  },
  commentCounter: {
    fontWeight: 600,
    marginBottom: theme.spacing(2),
  },
}));

export default function IdeaCommentsSection({ idea, handleAddComment, handleRemoveComment }) {
  const classes = useStyles();
  const { user, locale } = useContext(UserContext);
  const token = new Cookies().get("token");
  const texts = getTexts({ page: "idea", locale: locale });

  const onSendComment = async (comment, parentComment, clearInput, setDisplayReplies) => {
    const payload = {
      content: comment,
      idea: idea.url_slug,
      parent_comment_id: parentComment || null,
    };
    handleAddComment({
      parent_comment_id: parentComment,
      id: null,
      author_user: user,
      content: comment,
      created_at: new Date(),
      replies: [],
      unconfirmed: true,
    });
    clearInput();
    if (parentComment) payload.parent_comment = parentComment;
    try {
      const resp = await apiRequest({
        url: "/api/ideas/" + idea.url_slug + "/comment/",
        payload: payload,
        method: "post",
        token: token,
        locale: locale,
        shouldThrowError: true,
      });
      handleAddComment(resp.data);
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
        url: "/api/ideas/" + idea.url_slug + "/comments/" + post.id + "/",
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
    <div className={classes.root}>
      <div className={classes.content}>
        <Typography className={classes.commentCounter}>
          {texts.comments} • {idea.comments?.length || 0}
        </Typography>
        <CommentInput
          user={user}
          onSendComment={onSendComment}
          hasComments={idea.comments?.length > 0}
          infoTextSize={INFO_TEXT_SIZES.short}
        />
        <Divider className={classes.divider} />
        {idea.comments && idea.comments?.length > 0 && (
          <Posts
            posts={idea.comments}
            type="openingpost"
            maxLines={4}
            user={user}
            onSendComment={onSendComment}
            onDeletePost={onDeleteComment}
            infoTextSize={INFO_TEXT_SIZES.short}
          />
        )}
      </div>
    </div>
  );
}
