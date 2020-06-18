import React from "react";
import { Typography, Button } from "@material-ui/core";
import ThumbUpOutlinedIcon from "@material-ui/icons/ThumbUpOutlined";
import { makeStyles } from "@material-ui/core/styles";
import Posts from "./Posts";
import MiniProfilePreview from "./../profile/MiniProfilePreview";
import DateDisplay from "./../general/DateDisplay";

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
  },
  nameOfPoster: {
    fontWeight: 600,
    marginBottom: theme.spacing(2)
  },
  thumbUpIcon: {
    borderRadius: 10,
    borderColor: theme.palette.primary.main
  },
  interactionBarButton: {
    marginTop: theme.spacing(2)
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
        <DateDisplay date={new Date(post.created_at)} />
      </Typography>
      {type === "progresspost" ? (
        <Typography component="h3" variant="h6" color="primary" className={classes.nameOfPoster}>
          {post.author_user.first_name + " " + post.author_user.last_name}
        </Typography>
      ) : (
        <MiniProfilePreview
          profile={post.author_user}
          avatarClassName={type === "reply" ? classes.smallAvatar : classes.autoAvatar}
        />
      )}
      <Typography>{post.content}</Typography>
      <div className={classes.interactionBar}>
        <Button
          variant="outlined"
          size={type === "reply" ? "small" : "medium"}
          startIcon={<ThumbUpOutlinedIcon />}
          className={`${classes.thumbUpIcon} ${classes.interactionBarButton}`}
        >
          {post.likes}
        </Button>
        {(type === "openingpost" || type === "progresspost") && (
          <>
            {post.replies && post.replies.length > 0 && (
              <Button
                className={`${classes.viewRepliesButton} ${classes.interactionBarButton}`}
                onClick={handleViewRepliesClick}
              >
                {displayReplies ? "Hide " : "View "} {displayReplies ? "" : post.replies.length}{" "}
                replies
              </Button>
            )}
          </>
        )}
      </div>
      <div>
        {displayReplies && (type === "openingpost" || type === "progresspost") && (
          <Posts posts={post.replies} type="reply" />
        )}
      </div>
    </div>
  );
}
