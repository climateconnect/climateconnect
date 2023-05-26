import React, { useContext } from "react";
import getTexts from "../public/texts/texts";
import ClimateMatchRoot from "../src/components/climateMatch/ClimateMatchRoot";
import UserContext from "../src/components/context/UserContext";
import WideLayout from "../src/components/layouts/WideLayout";

export default function ClimateMatch() {
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "climatematch", locale: locale });
  return (
    <WideLayout title={texts.climate_match_title} /*TODO(unused) noMarginBottom */>
      <ClimateMatchRoot />
    </WideLayout>
  );
}
