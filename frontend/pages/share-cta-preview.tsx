//TEMPORARY preview page for visual verification of the share CTA PoC - DELETE AFTER USE
import React from "react";
import ProjectSubmittedPage from "../src/components/shareProject/ProjectSubmittedPage";

export default function ShareCtaPreview() {
  return (
    <ProjectSubmittedPage
      user={null}
      isDraft={false}
      url_slug="community-garden-festival-1ab2c"
      hasError={false}
      hubName={undefined}
      projectTypeId="event"
      projectName="Community Garden Festival"
    />
  );
}
