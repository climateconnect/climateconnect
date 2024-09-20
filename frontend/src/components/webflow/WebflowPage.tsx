import React, { useContext } from "react";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import WideLayout from "../layouts/WideLayout";
import { DevLinkProvider } from "../../../devlink/DevLinkProvider";


export default function WebflowPage({
 children,
 title,
 pageKey,
 description,
}: any) {
 const { locale } = useContext(UserContext);
 const texts = getTexts({ page: "navigation", locale: locale });
 return (
   <>
     <WideLayout
       title={title ? title : texts[pageKey]}
       description={description}
       isStaticPage
       //TODO(unused) hideHeadline
       noSpaceBottom
     >
       <DevLinkProvider>
         {children}
       </DevLinkProvider>
     </WideLayout>
   </>
 );
}
