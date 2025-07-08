import React, { useContext } from "react";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import WideLayout from "../layouts/WideLayout";
import { DevLinkProvider } from "../../../devlink/DevLinkProvider";

export default function DevlinkPage({
  children,
  pageKey,
  className,
  title,
  description,
  hideFooter,
  noHeader,
  transparentHeader,
  isHubPage,
  isLocationHub,
  hubUrl,
  fixedHeader,
  isLandingPage,
  showDonationGoal
}: any) {
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "navigation", locale: locale });

  return (
    <>
      <WideLayout
        rootClassName={className}
        title={title ? title : texts[pageKey]}
        description={description}
        hideFooter={hideFooter}
        noHeader={noHeader}
        transparentHeader={transparentHeader}
        isHubPage={isHubPage}
        isLocationHub={isLocationHub}
        hubUrl={hubUrl}
        fixedHeader={fixedHeader}
        isLandingPage={isLandingPage}
        noSpaceBottom
        showDonationGoal={showDonationGoal}
      >
        <DevLinkProvider>{children}</DevLinkProvider>
      </WideLayout>
    </>
  );
}
