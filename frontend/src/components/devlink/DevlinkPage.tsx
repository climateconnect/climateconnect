import parseHtml from "html-react-parser";
import Head from "next/head";
import React, { useContext } from "react";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import WideLayout from "../layouts/WideLayout";
import { DevLinkProvider } from "../../../devlink/DevLinkProvider";

export default function DevlinkPage({
  // bodyContent,
  // headContent,
  children,
  pageKey,
  className,
  hideFooter,
  noHeader,
  title,
  description,
  transparentHeader,
  // isLandingPage,
  // hubUrl,
  isHubPage,
  isLocationHub,
  showSuffix,
}: any) {
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "navigation", locale: locale });
  return (
    <>
      {/* <Head>{parseHtml(headContent)}</Head> */}
      <WideLayout
        rootClassName={className}
        title={title ? title : texts[pageKey]}
        description={description}
        noSpaceBottom
        hideFooter={hideFooter}
        noHeader={noHeader}
        transparentHeader={transparentHeader}
        // isHubPage={isHubPage}
        isLocationHub={isLocationHub}
        // isLandingPage={isLandingPage}
        // hubUrl={hubUrl}
        showSuffix={showSuffix}
      >
        <DevLinkProvider>{children}</DevLinkProvider>
      </WideLayout>
    </>
  );
}
