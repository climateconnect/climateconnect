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
      {posts.map((element, index) => (
        <StepsTrackerVertical
          key={index}
          index={index}
          lastIndex={posts.length - 1}
          content={
            <StepContent
              element={element}
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
  element,
}) {
  const classes = useStyles();
  return (
    <Card className={classes.card} raised="true">
      {element.currentlyEdited || element.currentlyUpdated ? (
        <EditProgressPost
          post={element}
          closeEditingInterface={closeEditingInterface}
          token={token}
          project={project}
          refreshCurrentPosts={refreshCurrentPosts}
        />
      ) : (
        <ProgressPost
          post={element}
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
