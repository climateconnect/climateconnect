import { IconButton, makeStyles } from "@material-ui/core";
import ShareIcon from "@material-ui/icons/Share";
import React from "react";
import { apiRequest } from "../../../public/lib/apiOperations";
import SocialMediaShareDialog from "./SocialMediaShareDialog";

const useStyles = makeStyles((theme) => ({
  button: (props) => ({
    color: props.switchColors ? theme.palette.primary.main : "white",
    width: 35,
    height: 35,
    backgroundColor: props.switchColors ? "white" : theme.palette.primary.main,
    "&:hover": {
      backgroundColor: props.switchColors ? "white" : theme.palette.primary.main,
    },
  }),
}));

export default function SocialMediaShareButton({
  containerClassName,
  contentLinkPath,
  apiEndpoint,
  locale,
  token,
  messageTitle,
  tinyScreen,
  smallScreen,
  mailBody,
  texts,
  dialogTitle,
  switchColors,
}) {
  const classes = useStyles({ switchColors: switchColors });

  const [showSocials, setShowSocials] = React.useState(false);
  const toggleShowSocials = (value) => {
    setShowSocials(value);
  };

  const [linkShared, setLinkShared] = React.useState(false);
  const createShareRecord = (sharedVia) => {
    if (sharedVia === SHARE_OPTIONS.link && linkShared) return; //only create a share-record for the link once per session
    apiRequest({
      method: "post",
      url: apiEndpoint,
      payload: { shared_via: sharedVia },
      token: token,
      locale: locale,
    })
      .then(() => {
        if (sharedVia === SHARE_OPTIONS.link) {
          setLinkShared(true);
        }
      })
      .catch(function (error) {
        console.log(error);
        if (error && error.reponse) console.log(error.response);
      });
  };

  //Assignment of the numbers has to match with ContentShares.SHARE_OPTIONS in the backend
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
  const contentLink = BASE_URL + contentLinkPath;

  const handleClick = () => {
    //navigator.share (Web Share API) is only available with https
    if (navigator.share && smallScreen) {
      navigator
        .share({
          title: messageTitle,
          url: contentLink,
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
        createShareRecord={createShareRecord}
        tinyScreen={tinyScreen}
        SHARE_OPTIONS={SHARE_OPTIONS}
        contentLink={contentLink}
        messageTitle={messageTitle}
        mailBody={mailBody}
        texts={texts}
        dialogTitle={dialogTitle}
      />
    </>
  );
}
