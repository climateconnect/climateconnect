import { IconButton, makeStyles } from "@material-ui/core";
import React from "react";
import ShareIcon from "@material-ui/icons/Share";
import SocialMediaShareDialog from "../../dialogs/SocialMediaShareDialog";

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

export default function SocialMediaShareButton({ containerClassName, toggleShowSocials, showSocials, texts, project, locale, projectAdmin, createShareRecord, screenSize }) {
  const classes = useStyles();
  const handleClick = () => {
    toggleShowSocials(true);
  };

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
  };
  const BASE_URL = process.env.BASE_URL ? process.env.BASE_URL : "https://climateconnect.earth";
  const projectLink = BASE_URL + "/" + locale + "/projects/" + project.url_slug;
  const title = texts.climate_protection_project_by + projectAdmin.name + ": " + project.name;

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
          texts={texts}
          createShareRecord={createShareRecord}
          screenSize={screenSize}
          SHARE_OPTIONS={SHARE_OPTIONS}
          projectLink={projectLink}
          title={title}
        />
    </>
  );
}
