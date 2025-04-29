import { Divider, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import Cookies from "universal-cookie";
import { apiRequest } from "../../../public/lib/apiOperations";
import getTexts from "../../../public/texts/texts";
import CommentInput, { INFO_TEXT_SIZES } from "../communication/CommentInput";
import Posts from "../communication/Posts";
import UserContext from "../context/UserContext";
import LoadingSpinner from "../general/LoadingSpinner";

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
  loadingSpinner: {
    width: 40,
    height: 40,
  },
  loadingSpinnerContainer: {
    height: 125,
    width: "100%",
    display: "flex",
    justifyContent: "center",
    padding: theme.spacing(1),
  },
  defaultProjectCommentInput: {
    marginTop: theme.spacing(0),
  },
}));

export default function IdeaCommentsSection({
  idea,
  loading,
  handleAddComment,
  handleRemoveComment,
}) {
  const classes = useStyles();
  const { user, locale } = useContext(UserContext);
  const token = new Cookies().get("auth_token");
  const texts = getTexts({ page: "idea", locale: locale });

  const onSendComment = async (comment, parentComment, clearInput, setDisplayReplies) => {
    const payload: any = {
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
      });
      handleAddComment(resp.data);
      if (setDisplayReplies) setDisplayReplies(true);
    } catch (err: any) {
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
    } catch (err: any) {
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
          infoTextSize={INFO_TEXT_SIZES.SHORT}
          useIconButton
          // hubUrl={hubUrl} is missing, but this component and its parents are not used anymore
          /*TODO(unused) className={classes.defaultProjectCommentInput} */
        />
        <Divider /*TODO(unused) className={classes.divider} */ />
        {loading && (
          <div className={classes.loadingSpinnerContainer}>
            <LoadingSpinner isLoading message={texts.loading_ideas} />
          </div>
        )}
        {idea.comments && idea.comments?.length > 0 && (
          <Posts
            posts={idea.comments}
            type="openingpost"
            maxLines={4}
            user={user}
            onSendComment={onSendComment}
            onDeletePost={onDeleteComment}
            infoTextSize={INFO_TEXT_SIZES.SHORT}
          />
        )}
      </div>
    </div>
  );
}
