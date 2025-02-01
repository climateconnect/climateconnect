import React, { useContext } from "react";
import { getLocalePrefix } from "../../../public/lib/apiOperations";
import getTexts from "../../../public/texts/texts";
import { Project } from "../../types";
import UserContext from "../context/UserContext";
import SocialMediaShareButton, { SocialMediaShareButtonProps } from "./SocialMediaShareButton";

type Props = {
  className: SocialMediaShareButtonProps["className"];
  project: Project;
  projectAdmin: any;
  hubUrl: string;
};

//This component simply exists so all the project-specific properties don't need to be passed through
//to `SocialMediaShareButton` from every component.
export function ProjectSocialMediaShareButton({ className, project, projectAdmin, hubUrl }: Props) {
  const { locale, CUSTOM_HUB_URLS } = useContext(UserContext);
  const texts = getTexts({
    locale: locale,
    page: "project",
    project: project,
    creator: projectAdmin,
  });

  const projectLinkPath = `${getLocalePrefix(locale)}/projects/${project.url_slug}`;
  const apiEndpointShareButton = `/api/projects/${project.url_slug}/set_shared_project/`;
  const projectAdminName = project.creator?.name ? project.creator?.name : projectAdmin.name;
  const messageTitleShareButton = `${texts.climate_protection_project_by}${projectAdminName}: ${project.name}`;
  const mailBodyShareButton = texts.share_project_email_body;
  const dialogTitleShareButton = texts.tell_others_about_this_project;
  const isCustomHub = CUSTOM_HUB_URLS.includes(hubUrl);

  return (
    <SocialMediaShareButton
      className={className}
      contentLinkPath={projectLinkPath}
      apiEndpoint={apiEndpointShareButton}
      messageTitle={messageTitleShareButton}
      mailBody={mailBodyShareButton}
      texts={texts}
      dialogTitle={dialogTitleShareButton}
      isCustomHub={isCustomHub}
    />
  );
}
