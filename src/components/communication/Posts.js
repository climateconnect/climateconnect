import React from "react";
import Post from "./Post";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  post: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  },
  indent: {
    marginLeft: theme.spacing(4)
  },
  noMargin: {
    margin: 0
  }
}));

//@type: possible values are "openingpost" and "reply"
export default function Posts({ posts, type }) {
  const classes = useStyles();
  return (
    <div className={type === "reply" ? classes.indent : classes.noMargin}>
      {posts.map((post, index) => (
        <Post key={index} post={post} className={classes.post} type={type} />
      ))}
    </div>
  );
}
