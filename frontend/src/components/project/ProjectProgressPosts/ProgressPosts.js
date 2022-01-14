import React from "react";
import EditProgressPost from "./EditProgressPost";
import StepsTrackerVertical from "../../general/StepsTrackerVertical";
import ProgressPost from "./ProgressPost";

import { Card, makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  card: {
    background: "#F2F2F2",
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingTop: theme.spacing(1),
  },
}));

export default function ProgressPosts({
  posts,
  closeEditingInterface,
  token,
  project,
  refreshCurrentPosts,
  displayEditingInterface,
  userPermission,
}) {
  return (
    <>
      {posts.map((post, index) => (
        <StepsTrackerVertical
          key={index}
          index={index}
          lastIndex={posts.length - 1}
          content={
            <StepContent
              post={post}
              closeEditingInterface={closeEditingInterface}
              token={token}
              project={project}
              refreshCurrentPosts={refreshCurrentPosts}
              displayEditingInterface={displayEditingInterface}
              userPermission={userPermission}
            />
          }
        />
      ))}
    </>
  );
}

function StepContent({
  closeEditingInterface,
  token,
  project,
  refreshCurrentPosts,
  displayEditingInterface,
  userPermission,
  post,
}) {
  const classes = useStyles();
  return (
    <Card className={classes.card} raised="true">
      {post.currentlyCreating || post.currentlyUpdating ? (
        <EditProgressPost
          post={post}
          closeEditingInterface={closeEditingInterface}
          token={token}
          project={project}
          refreshCurrentPosts={refreshCurrentPosts}
        />
      ) : (
        <ProgressPost
          post={post}
          token={token}
          project={project}
          displayEditingInterface={displayEditingInterface}
          refreshCurrentPosts={refreshCurrentPosts}
          userPermission={userPermission}
        />
      )}
    </Card>
  );
}
