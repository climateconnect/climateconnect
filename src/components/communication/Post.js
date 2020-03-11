import React from "react";
import { Typography, Button } from "@material-ui/core";
import ThumbUpIcon from "@material-ui/icons/ThumbUp";
import { makeStyles } from "@material-ui/core/styles";
import Posts from "./Posts";
import MiniProfilePreview from "./../profile/MiniProfilePreview";

const useStyles = makeStyles(theme => ({
  postDate: {
    color: theme.palette.grey[700]
  },
  icon: {
    verticalAlign: "bottom",
    marginTop: 2,
    paddingRight: theme.spacing(0.5)
  },
  viewRepliesButton: {
    display: "block"
  },
  smallAvatar: {
    width: theme.spacing(3),
    height: theme.spacing(3)
  },
  autoAvatar: {
    width: theme.spacing(5),
    height: theme.spacing(5)
  }
}));

export default function Post({ post, type, className }) {
  const classes = useStyles();
  const [displayReplies, setDisplayReplies] = React.useState(false);

  const handleViewRepliesClick = () => {
    setDisplayReplies(!displayReplies);
  };
  return (
    <div className={className}>
      <Typography variant="body2" className={classes.postDate}>
        {new Intl.DateTimeFormat("en-US").format(new Date(post.date))}
      </Typography>
      <MiniProfilePreview
        profile={post.creator}
        avatarClassName={type === "reply" ? classes.smallAvatar : classes.autoAvatar}
      />
      <Typography>{post.content}</Typography>
      <div className={classes.interactionBar}>
        <Button
          variant="outlined"
          size={type === "reply" ? "small" : "normal"}
          startIcon={<ThumbUpIcon />}
        >
          {post.likes}
        </Button>
        {type === "openingpost" && (
          <>
            {post.replies && post.replies.length > 0 && (
              <Button className={classes.viewRepliesButton} onClick={handleViewRepliesClick}>
                {displayReplies ? "Hide " : "View "} {displayReplies ? "" : post.replies.length}{" "}
                replies
              </Button>
            )}
          </>
        )}
      </div>
      <div>
        {displayReplies && type === "openingpost" && <Posts posts={post.replies} type="reply" />}
      </div>
    </div>
  );
}
