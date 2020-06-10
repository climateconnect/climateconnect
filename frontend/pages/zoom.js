import React, { useEffect } from "react";

export default function Zoom() {
  useEffect(() => {
    window.location = "https://fau.zoom.us/j/95027152733";
  });
  return <div>You are being redirected to the Climate Connect zoom...</div>;
}
