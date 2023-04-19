import React, { useContext } from "react";
import getTexts from "../public/texts/texts";
import ClimateMatchResultsRoot from "../src/components/climateMatchResults/ClimateMatchResultsRoot";
import UserContext from "../src/components/context/UserContext";
import WideLayout from "../src/components/layouts/WideLayout";

export default function ClimateMatchResults() {
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "climatematch", locale: locale });
  return (
    <WideLayout title={texts.your_climate_match_results}>
      <ClimateMatchResultsRoot />
    </WideLayout>
  );
}
