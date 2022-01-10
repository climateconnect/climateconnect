import React from "react";
import EditProgressPost from "./EditProgressPost";
import StepsTrackerVertical from "../../general/StepsTrackerVertical";
import ProgressPost from "./ProgressPost";

export default function ProgressPosts({
  posts,
  locale,
  texts,
  closeNewPost,
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
                closeNewPost={closeNewPost}
                token={token}
                project={project}
                refreshCurrentPosts={refreshCurrentPosts}
                displayEditingInterface={displayEditingInterface}
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
