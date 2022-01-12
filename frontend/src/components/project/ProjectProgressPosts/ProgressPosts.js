import React from "react";
import EditProgressPost from "./EditProgressPost";
import StepsTrackerVertical from "../../general/StepsTrackerVertical";
import ProgressPost from "./ProgressPost";

export default function ProgressPosts({
  posts,
  locale,
  texts,
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
              locale={locale}
              texts={texts}
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
  locale,
  texts,
  closeEditingInterface,
  token,
  project,
  refreshCurrentPosts,
  displayEditingInterface,
  userPermission,
  element,
}) {
  return element.currentlyEdited || element.currentlyUpdated ? (
    <EditProgressPost
      post={element}
      locale={locale}
      texts={texts}
      closeEditingInterface={closeEditingInterface}
      token={token}
      project={project}
      refreshCurrentPosts={refreshCurrentPosts}
    />
  ) : (
    <ProgressPost
      post={element}
      texts={texts}
      token={token}
      project={project}
      displayEditingInterface={displayEditingInterface}
      refreshCurrentPosts={refreshCurrentPosts}
      userPermission={userPermission}
    />
  );
}
