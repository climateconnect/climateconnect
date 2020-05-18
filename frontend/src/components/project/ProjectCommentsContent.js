import React from "react";
import Posts from "./../communication/Posts.js";

export default function CommentsContent({ comments }) {
  return (
    <div>
      <Posts posts={comments} type="openingpost" />
    </div>
  );
}
