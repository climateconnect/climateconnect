import React, { useState } from "react";
import EditProgressPost from "./EditProgressPost";
import StepsTrackerVertical from "../../general/StepsTrackerVertical";
import ProgressPost from "./ProgressPost";

export default function ProgressPosts({ project }) {
  const posts = project.timeline_posts;
  const [editingPostId, setEditingPostId] = useState(1);
  const changeEditingPostId = (id) => {
    if (editingPostId === null) {
      setEditingPostId(id);
    } else {
      // Add alert that changed content on the currently edited post will be lost
    }
  };
  return (
    <>
      {posts.map((post, index) => (
        <StepsTrackerVertical
          key={index}
          index={index}
          lastIndex={posts.length - 1}
          content={
            post.id === editingPostId ? (
              <EditProgressPost post={post} project={project} />
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
