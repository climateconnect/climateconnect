import React, { useState } from "react";
import StepsTrackerVertical from "../general/StepsTrackerVertical";
import ProgressPost from "./ProgressPost";

export default function ProgressPosts({ posts, locale, texts, closeNewPost, token, project }) {
  const [currentPosts, setCurrentPosts] = useState(posts);
  const refreshCurrentPosts = (newPost) => {
    setCurrentPosts(currentPosts.unshift(newPost));
  }
  return (
    <>
      {posts.map((element, index) => (
        <StepsTrackerVertical
          key={index}
          index={index}
          lastIndex={posts.length - 1}
          content={
            <ProgressPost
              post={element}
              locale={locale}
              texts={texts}
              closeNewPost={closeNewPost}
              token={token}
              project={project}
              refreshCurrentPosts={refreshCurrentPosts}
            />
          }
        />
      ))}
    </>
  );
}
