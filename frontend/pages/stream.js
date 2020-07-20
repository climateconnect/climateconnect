import React, { useEffect } from "react";

export default function Stream() {
  useEffect(() => {
    window.location = "https://www.youtube.com/watch?v=7wwXgFRqPtk";
  });
  return <div>You are being redirected to the Climate Connect YouTube livestream...</div>;
}
