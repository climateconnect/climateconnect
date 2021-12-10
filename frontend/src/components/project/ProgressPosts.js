import React from "react";
import StepsTrackerVertical from "../general/StepsTrackerVertical";
import ProgressPost from "./ProgressPost";

export default function ProgressPosts({
  posts,
  locale,
  texts,
}) {
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
            />
          }
        />
      ))}
    </>
  );
}