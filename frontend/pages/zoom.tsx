import React, { useContext, useEffect } from "react";
import getTexts from "../public/texts/texts";
import UserContext from "../src/components/context/UserContext";

export default function Zoom() {
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "general", locale: locale });
  useEffect(() => {
    window.location.href = "https://zoom.us/j/96281669535";
  });
  return <div>{texts.you_are_being_redirected_to_the_climate_connect_zoom}...</div>;
}
