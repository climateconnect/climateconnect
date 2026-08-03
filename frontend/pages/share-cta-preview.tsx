//TEMPORARY preview page for visual verification of the share CTA PoC - DELETE AFTER USE
import React from "react";
import ProjectSubmittedPage from "../src/components/shareProject/ProjectSubmittedPage";

export default function ShareCtaPreview() {
  return (
    <ProjectSubmittedPage
      user={null}
      isDraft={false}
      url_slug="a-new-event-is-born"
      hasError={false}
      hubName={undefined}
      projectTypeId="event"
      projectName="A new event is born"
    />
  );
}
