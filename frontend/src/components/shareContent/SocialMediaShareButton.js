import { IconButton, makeStyles } from "@material-ui/core";
import ShareIcon from "@material-ui/icons/Share";
import React from "react";
import SocialMediaShareDialog from "./SocialMediaShareDialog";

const useStyles = makeStyles((theme) => ({
  button: {
    color: "white",
    width: 35,
    height: 35,
    backgroundColor: theme.palette.primary.main,
    "&:hover": {
      backgroundColor: theme.palette.primary.main,
    },
  },
}));

export default function SocialMediaShareButton({
  containerClassName,
  toggleShowSocials,
  showSocials,
  texts,
  project,
  locale,
  projectAdmin,
  createShareRecord,
  screenSize,
}) {
  const classes = useStyles();

  //Assignment of the numbers has to match with SharedProjects.SHARE_OPTIONS in the backend
  const SHARE_OPTIONS = {
    facebook: 0,
    fb_messenger: 1,
    twitter: 2,
    whatsapp: 3,
    linkedin: 4,
    reddit: 5,
    telegram: 6,
    e_mail: 7,
    link: 8,
    native_share_dialog_of_device: 9,
  };
  const BASE_URL = process.env.BASE_URL ? process.env.BASE_URL : "https://climateconnect.earth";
  const projectLink = BASE_URL + "/" + locale + "/projects/" + project.url_slug;
  const title =
    texts.climate_protection_project_by +
    (project?.creator.name ? project?.creator.name : projectAdmin.name) +
    ": " +
    project.name;

  const handleClick = () => {
    //navigator.share (Web Share API) is only available with https
    if (navigator.share) {
      navigator
        .share({
          title: title,
          url: projectLink,
        })
        .then(() => {
          createShareRecord(SHARE_OPTIONS.native_share_dialog_of_device);
        })
        .catch(console.error);
    } else {
      toggleShowSocials(true);
    }
  };

  return (
    <>
      <div className={containerClassName}>
        <IconButton className={classes.button} onClick={handleClick}>
          {/*adjusted viewBox to center the icon*/}
          <ShareIcon viewBox="2 0 24 24" />
        </IconButton>
      </div>
      <SocialMediaShareDialog
        open={showSocials}
        onClose={toggleShowSocials}
        project={project}
        createShareRecord={createShareRecord}
        screenSize={screenSize}
        SHARE_OPTIONS={SHARE_OPTIONS}
        projectLink={projectLink}
        projectAdmin={projectAdmin}
        title={title}
      />
    </>
  );
}
