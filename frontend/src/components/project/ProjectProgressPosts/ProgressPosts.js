import React from "react";
import EditProgressPost from "./EditProgressPost";
import StepsTrackerVertical from "../../general/StepsTrackerVertical";
import ProgressPost from "./ProgressPost";

export default function ProgressPosts({ posts, project, editingPostId, changeEditingPostId, cancelEditingPost }) {
  return (
    <>
      {posts.map((post, index) => (
        <StepsTrackerVertical
          key={index}
          index={index}
          lastIndex={posts.length - 1}
          content={
            post.id === editingPostId ? (
              <EditProgressPost post={post} project={project} cancelEditingPost={cancelEditingPost} />
            ) : (
              <ProgressPost
                post={post}
                project={project}
                changeEditingPostId={changeEditingPostId}
              />
            )
          }
        />
      ))}
    </>
  );
}
