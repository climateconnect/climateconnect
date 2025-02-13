import makeStyles from "@mui/styles/makeStyles";
import React from "react";

import Post from "./Post";

const useStyles = makeStyles((theme) => ({
  post: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  indent: {
    marginLeft: theme.spacing(4),
  },
  noMargin: {
    margin: 0,
  },
  progressPosts: {
    marginLeft: theme.spacing(4),
    paddingBottom: theme.spacing(6),
    borderLeft: `2px solid ${theme.palette.primary.main}`,
  },
  progressPost: {
    paddingLeft: theme.spacing(10),
    position: "relative",
    paddingBottom: theme.spacing(10),
    "&::before": {
      content: '""',
      height: 20,
      width: 20,
      backgroundColor: theme.palette.primary.main,
      borderRadius: 10,
      fontSize: 100,
      position: "absolute",
      top: 0,
      left: -10,
    },
  },
  firstPost: {
    "&::before": {
      width: 40,
      height: 40,
      borderRadius: 20,
      left: -20,
      //10.1 margin to prevent visual glitch with line showing over dot
      top: -10.1,
      border: `10px solid #D7E2E4`,
      zIndex: -1,
    },
  },
}));

//@type: possible values are "openingpost", "reply", "progresspost", "preview"
export default function Posts({
  posts,
  type,
  maxLines,
  user,
  onSendComment,
  onDeletePost,
  infoTextSize,
  truncate,
  noLink,
  hubUrl,
}: any) {
  const classes = useStyles();
  const classNames = {
    reply: classes.indent,
    openingpost: classes.noMargin,
    progresspost: classes.progressPosts,
  };
  return (
    <div className={classNames[type]}>
      {posts &&
        posts.map((post, index) => (
          <Post
            key={index}
            post={post}
            className={`${classes.post} ${type === "progresspost" && classes.progressPost} ${
              index === 0 && type === "progresspost" && classes.firstPost
            }`}
            type={type}
            maxLines={maxLines}
            user={user}
            onSendComment={onSendComment}
            onDeletePost={onDeletePost}
            infoTextSize={infoTextSize}
            truncate={truncate}
            noLink={noLink}
            hubUrl={hubUrl}
          />
        ))}
    </div>
  );
}
