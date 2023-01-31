import React, { useContext, useEffect } from "react";
import getTexts from "../public/texts/texts";
import UserContext from "../src/components/context/UserContext";

export default function Stream() {
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "general", locale: locale });
  useEffect(() => {
    window.location.href = "https://youtu.be/lUbxcp-OWmo";
  });
  return <div>{texts.you_are_being_redirected_to_the_climate_connect_youtube_livestream}...</div>;
}
