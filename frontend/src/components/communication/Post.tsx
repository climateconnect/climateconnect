import { Avatar, Button, CircularProgress, Link, Theme, Tooltip, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import React, { useContext, useState } from "react";
import Truncate from "react-truncate";
import { getLocalePrefix } from "../../../public/lib/apiOperations";
import { getImageUrl } from "../../../public/lib/imageOperations";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import ConfirmDialog from "../dialogs/ConfirmDialog";
import ProfileBadge from "../profile/ProfileBadge";
import DateDisplay from "./../general/DateDisplay";
import CommentInput from "./CommentInput";
import MessageContent from "./MessageContent";
import Posts from "./Posts";

const useStyles = makeStyles<Theme, { preview?: boolean }>((theme) => ({
  postDate: {
    color: theme.palette.grey[700],
  },
  commentFlexBox: (props) => ({
    display: "flex",
    alignItems: props.preview ? "center" : "stretch",
  }),
  messageWithMetaData: {
    minWidth: 0,
    overflowWrap: "break-word",
  },
  avatar: {
    marginRight: theme.spacing(2),
  },
  username: {
    fontWeight: "bold",
    marginRight: theme.spacing(0.5),
  },
  metadata: {
    display: "flex",
    alignItems: "center",
  },
  message: {
    lineHeight: 1.2,
  },
  content: {
    wordBreak: "break-word",
    fontSize: 14,
    whiteSpace: "pre-wrap",
  },
  toggleExpanded: {
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
    color: theme.palette.grey[700],
  },
  replyButton: {
    color: theme.palette.grey[700],
  },
  toggleReplies: {
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
  },
  inlineBadge: {
    marginRight: theme.spacing(0.5),
  },
  commentBox: {
    display: "flex",
  },
  deleteButton: {
    color: theme.palette.background.default_contrastText,
  },
}));

export default function Post({
  post,
  type,
  className,
  maxLines,
  user,
  onSendComment,
  onDeletePost,
  infoTextSize,
  truncate,
  noLink,
}) {
  const classes = useStyles({ preview: type === "preview" });

  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "communication", locale: locale });
  const [open, setOpen] = useState(false);
  const [displayReplies, setDisplayReplies] = useState(true);
  const [replyInterfaceExpanded, setInterfaceExpanded] = useState(false);
  const expandReplyInterface = () => setInterfaceExpanded(true);
  const unexpandReplyInterface = () => setInterfaceExpanded(false);

  const handleViewRepliesClick = () => {
    setDisplayReplies(!displayReplies);
  };

  const handleSendComment = (curComment, parent_comment, clearInput) => {
    onSendComment(curComment, parent_comment, clearInput, setDisplayReplies);
  };

  const [isTextExpanded, setIsTextExpanded] = useState(false);
  const [isTextTruncated, setisTextTruncated] = useState(false);

  const handleExpandText = () => {
    setIsTextExpanded(!isTextExpanded);
  };

  const handleTruncate = (truncated) => {
    if (isTextTruncated === true) {
      // keeps the button for comments that had originally been truncated.
      //Pressing show more will cause
      return; // a rerender and unmarks them as untruncated
    }
    setisTextTruncated(truncated);
  };

  const toggleDeleteDialogOpen = () => setOpen(!open);

  const onConfirmDialogClose = (confirmed) => {
    setOpen(false);
    if (confirmed) onDeletePost(post);
  };

  const handleClick = (element) => noLink && element.preventDefault();
  const avatarProps = {
    src: post.author_user.image
      ? getImageUrl(post.author_user.image)
      : getImageUrl(post.author_user.thumbnail_image),
    className: classes.avatar,
  };

  return (
    <div className={className}>
      {type === "progresspost" ? (
        <Typography
          component="h3"
          variant="h6"
          color="primary" /*TODO(undefined) className={classes.nameOfPoster} */
        >
          {post.author_user.first_name + " " + post.author_user.last_name}
        </Typography>
      ) : (
        <div className={classes.commentFlexBox}>
          <Link
            href={getLocalePrefix(locale) + "/profiles/" + post.author_user.url_slug}
            target="_blank"
            onClick={handleClick}
            underline="hover"
          >
            <Avatar {...avatarProps} />
          </Link>
          <span className={classes.messageWithMetaData}>
            <div className={classes.metadata}>
              <Link
                color="inherit"
                href={getLocalePrefix(locale) + "/profiles/" + post.author_user.url_slug}
                target="_blank"
                onClick={handleClick}
                underline="hover"
              >
                <Typography variant="body2" className={classes.username}>
                  {post.author_user.first_name + " " + post.author_user.last_name}
                </Typography>
              </Link>
              {post.author_user.badges?.length > 0 && (
                <ProfileBadge
                  contentOnly
                  badge={post.author_user.badges[0]}
                  size="medium"
                  className={classes.inlineBadge}
                />
              )}
              <Typography variant="body2" className={classes.postDate}>
                {post.unconfirmed && (
                  <Tooltip title={texts.sending_message + "..."}>
                    <CircularProgress
                      size={10}
                      color="inherit" /*TODO(undefined) className={classes.loader} */
                    />
                  </Tooltip>
                )}
                <DateDisplay date={new Date(post.created_at)} />
              </Typography>
            </div>
            {type === "preview" ? (
              <Typography>
                <Truncate lines={truncate} ellipsis={"..."}>
                  <MessageContent content={post.content} /*TODO(unused) maxLines={maxLines} */ />
                </Truncate>
              </Typography>
            ) : (
              <div>
                <Typography>
                  <Truncate
                    lines={!isTextExpanded && 3}
                    ellipsis={"..."}
                    onTruncate={handleTruncate}
                  >
                    <MessageContent content={post.content} /*TODO(unused) maxLines={maxLines} */ />
                  </Truncate>
                </Typography>

                {isTextTruncated && (
                  <Link
                    className={classes.toggleReplies}
                    onClick={handleExpandText}
                    underline="hover"
                  >
                    {!isTextExpanded ? texts.read_more : texts.read_less}
                  </Link>
                )}
              </div>
            )}
            <>
              {type !== "reply" &&
                type !== "preview" &&
                (replyInterfaceExpanded ? (
                  <CommentInput
                    user={user}
                    onSendComment={handleSendComment}
                    parent_comment={post.id}
                    onCancel={unexpandReplyInterface}
                    infoTextSize={infoTextSize}
                  />
                ) : (
                  <Button onClick={expandReplyInterface} className={classes.replyButton}>
                    {texts.reply}
                  </Button>
                ))}
              {user && user.id === post.author_user.id && type !== "preview" && (
                <Button onClick={toggleDeleteDialogOpen} className={classes.deleteButton}>
                  {texts.delete}
                </Button>
              )}
            </>
            <>
              {type !== "reply" && !!post.replies && post.replies.length > 0 && type !== "preview" && (
                <Link
                  className={classes.toggleReplies}
                  onClick={handleViewRepliesClick}
                  underline="hover"
                >
                  {!displayReplies ? (
                    <>
                      <ExpandMoreIcon />
                      {texts.show_replies}
                    </>
                  ) : (
                    <>
                      <ExpandLessIcon />
                      {texts.hide_replies}
                    </>
                  )}
                </Link>
              )}
            </>
          </span>
        </div>
      )}
      <>
        {post.replies &&
          post.replies.length > 0 &&
          displayReplies &&
          (type === "openingpost" || type === "progresspost") &&
          type !== "preview" && (
            <Posts
              posts={post.replies}
              type="reply"
              user={user}
              maxLines={maxLines}
              onDeletePost={onDeletePost}
              infoTextSize={infoTextSize}
            />
          )}
      </>
      <ConfirmDialog
        open={open}
        onClose={onConfirmDialogClose}
        title={texts.delete_comment}
        text={texts.do_you_really_want_to_delete_this_comment}
        confirmText={texts.yes}
        cancelText={texts.no}
      />
    </div>
  );
}
