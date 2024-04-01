import parseHtml from "html-react-parser";
import Head from "next/head";
import React, { useContext, useEffect } from "react";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import WideLayout from "../layouts/WideLayout";

export default function WebflowPage({
  bodyContent,
  headContent,
  pageKey,
  className,
  hideFooter,
  noHeader,
  scriptUrls,
}: any) {
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "navigation", locale: locale });

  console.log(scriptUrls);

  useEffect(() => {
    scriptUrls.forEach((url: string) => {
      const script = document.createElement("script");
      script.src = url;
      script.async = true;
      document.body.appendChild(script);
      return () => {
        document.body.removeChild(script);
      };
    });
  }, []);

  return (
    <>
      <Head>{parseHtml(headContent)}</Head>
      <WideLayout
        rootClassName={className}
        title={texts[pageKey]}
        isStaticPage
        //TODO(unused) hideHeadline
        noSpaceBottom
        hideFooter={hideFooter}
        noHeader={noHeader}
      >
        <div dangerouslySetInnerHTML={{ __html: bodyContent }} />
      </WideLayout>
    </>
  );
}
