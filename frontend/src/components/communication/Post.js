import { Avatar, Button, CircularProgress, Link, Tooltip, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import React, { useContext } from "react";
import { getImageUrl } from "../../../public/lib/imageOperations";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import ConfirmDialog from "../dialogs/ConfirmDialog";
import DateDisplay from "./../general/DateDisplay";
import CommentInput from "./CommentInput";
import MessageContent from "./MessageContent";
import Posts from "./Posts";

const useStyles = makeStyles((theme) => ({
  postDate: {
    color: theme.palette.grey[700],
  },
  commentFlexBox: {
    display: "flex",
  },
  messageWithMetaData: {
    display: "flex",
    flexDirection: "column",
    flexWrap: "wrap",
    flex: 1,
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
}));

export default function Post({
  post,
  type,
  className,
  maxLines,
  user,
  onSendComment,
  onDeletePost,
}) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "communication", locale: locale });
  const [open, setOpen] = React.useState(false);
  const [displayReplies, setDisplayReplies] = React.useState(false);
  const [replyInterfaceExpanded, setInterfaceExpanded] = React.useState(false);
  const expandReplyInterface = () => setInterfaceExpanded(true);

  const unexpandReplyInterface = () => setInterfaceExpanded(false);

  const handleViewRepliesClick = () => {
    setDisplayReplies(!displayReplies);
  };

  const handleSendComment = (curComment, parent_comment, clearInput) => {
    onSendComment(curComment, parent_comment, clearInput, setDisplayReplies);
  };

  const toggleDeleteDialogOpen = () => setOpen(!open);

  const onConfirmDialogClose = (confirmed) => {
    setOpen(false);
    if (confirmed) onDeletePost(post);
  };
  return (
    <div className={className}>
      {type === "progresspost" ? (
        <Typography component="h3" variant="h6" color="primary" className={classes.nameOfPoster}>
          {post.author_user.first_name + " " + post.author_user.last_name}
        </Typography>
      ) : (
        <div className={classes.commentFlexBox}>
          <Link href={"/profiles/" + post.author_user.url_slug} target="_blank">
            <Avatar src={getImageUrl(post.author_user.image)} className={classes.avatar} />
          </Link>
          <span className={classes.messageWithMetaData}>
            <div className={classes.metadata}>
              <Link color="inherit" href={"/profiles/" + post.author_user.url_slug} target="_blank">
                <Typography variant="body2" className={classes.username}>
                  {post.author_user.first_name + " " + post.author_user.last_name}
                </Typography>
              </Link>
              <Typography variant="body2" className={classes.postDate}>
                {post.unconfirmed && (
                  <Tooltip title={texts.sending_message + "..."}>
                    <CircularProgress size={10} color="inherit" className={classes.loader} />
                  </Tooltip>
                )}
                <DateDisplay date={new Date(post.created_at)} />
              </Typography>
            </div>
            <MessageContent content={post.content} maxLines={maxLines} />
            <div>
              {type != "reply" &&
                (replyInterfaceExpanded ? (
                  <CommentInput
                    user={user}
                    onSendComment={handleSendComment}
                    parent_comment={post.id}
                    onCancel={unexpandReplyInterface}
                  />
                ) : (
                  <Button onClick={expandReplyInterface} className={classes.replyButton}>
                    {texts.reply}
                  </Button>
                ))}
              {user && user.id === post.author_user.id && (
                <Button onClick={toggleDeleteDialogOpen}>Delete</Button>
              )}
            </div>
            <div>
              {type != "reply" && !!post.replies && post.replies.length > 0 && (
                <Link className={classes.toggleReplies} onClick={handleViewRepliesClick}>
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
            </div>
          </span>
        </div>
      )}
      <div>
        {post.replies &&
          post.replies.length > 0 &&
          displayReplies &&
          (type === "openingpost" || type === "progresspost") && (
            <Posts
              posts={post.replies}
              type="reply"
              user={user}
              maxLines={maxLines}
              onDeletePost={onDeletePost}
            />
          )}
      </div>
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
