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
}) {
  return (
    <>
      {posts.map((element, index) => (
        <StepsTrackerVertical
          key={index}
          index={index}
          lastIndex={posts.length - 1}
          content={
            element.currentlyEdited || element.currentlyUpdated ? (
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
                displayEditingInterface={displayEditingInterface}
              />
            )
          }
        />
      ))}
    </>
  );
}
