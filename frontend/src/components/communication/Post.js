import React from "react";
import { Typography, Button, Avatar, Link } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Posts from "./Posts";
import DateDisplay from "./../general/DateDisplay";
import { getImageUrl } from "../../../public/lib/imageOperations";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import CommentInput from "./CommentInput";
import ConfirmDialog from "../dialogs/ConfirmDialog";
import MessageContent from "./MessageContent";

const useStyles = makeStyles(theme => ({
  postDate: {
    color: theme.palette.grey[700]
  },
  commentFlexBox: {
    display: "flex"
  },
  messageWithMetaData: {
    display: "flex",
    flexDirection: "column",
    flexWrap: "wrap",
    flex: 1
  },
  avatar: {
    marginRight: theme.spacing(2)
  },
  username: {
    fontWeight: "bold",
    marginRight: theme.spacing(0.5)
  },
  metadata: {
    display: "flex"
  },
  message: {
    lineHeight: 1.2
  },
  content: {
    wordBreak: "break-word",
    fontSize: 14,
    whiteSpace: "pre-wrap"
  },
  toggleExpanded: {
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
    color: theme.palette.grey[700]
  },
  replyButton: {
    color: theme.palette.grey[700]
  },
  toggleReplies: {
    display: "flex",
    alignItems: "center",
    cursor: "pointer"
  }
}));

export default function Post({
  post,
  type,
  className,
  maxLines,
  user,
  onSendComment,
  onDeletePost
}) {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const [displayReplies, setDisplayReplies] = React.useState(false);
  const [replyInterfaceExpanded, setInterfaceExpanded] = React.useState(false);
  console.log(post);
  const expandReplyInterface = () => setInterfaceExpanded(true);

  const unexpandReplyInterface = () => setInterfaceExpanded(false);

  const handleViewRepliesClick = () => {
    setDisplayReplies(!displayReplies);
  };

  const handleSendComment = (curComment, parent_comment, clearInput) => {
    onSendComment(curComment, parent_comment, clearInput, setDisplayReplies);
  };

  const toggleDeleteDialogOpen = () => setOpen(!open);

  const onConfirmDialogClose = confirmed => {
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
                    Reply
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
                      Show replies
                    </>
                  ) : (
                    <>
                      <ExpandLessIcon />
                      Hide replies
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
        title="Delete comment"
        text="Do you really want to delete this comment?"
        confirmText="Yes"
        cancelText="No"
      />
    </div>
  );
}
