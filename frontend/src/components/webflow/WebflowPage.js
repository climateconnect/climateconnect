import parseHtml from "html-react-parser";
import Head from "next/head";
import React, { useContext } from "react";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import WideLayout from "../layouts/WideLayout";

export default function WebflowPage({ bodyContent, headContent, pageKey, className, hideFooter }) {
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "navigation", locale: locale });
  return (
    <>
      <Head>{parseHtml(headContent)}</Head>
      <WideLayout
        rootClassName={className}
        title={texts[pageKey]}
        isStaticPage
        hideHeadline
        noSpaceBottom
        hideFooter={hideFooter}
      >
        <div dangerouslySetInnerHTML={{ __html: bodyContent }} />
      </WideLayout>
    </>
  );
}
