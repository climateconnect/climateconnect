import { IconButton, Theme, useMediaQuery } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import ShareIcon from "@mui/icons-material/Share";
import React, { useContext } from "react";
import { apiRequest } from "../../../public/lib/apiOperations";
import SocialMediaShareDialog from "./SocialMediaShareDialog";
import UserContext from "../context/UserContext";
import Cookies from "universal-cookie";
import theme from "../../themes/theme";

const useStyles = makeStyles<Theme, { switchColors?: boolean }>((theme) => ({
  button: (props) => ({
    color: props.switchColors
      ? theme.palette.background.default_contrastText
      : theme.palette.primary.contrastText,
    width: 35,
    height: 35,
    backgroundColor: props.switchColors ? "white" : theme.palette.primary.main,
    "&:hover": {
      backgroundColor: props.switchColors ? "white" : theme.palette.primary.main,
    },
  }),
}));

export type SocialMediaShareButtonProps = {
  className?: string;
  contentLinkPath?: any;
  apiEndpoint?: any;
  messageTitle?: any;
  mailBody?: any;
  texts?: any;
  dialogTitle?: any;
  switchColors?: any;
  hubUrl?: string;
};

export default function SocialMediaShareButton({
  className,
  contentLinkPath,
  apiEndpoint,
  messageTitle,
  mailBody,
  texts,
  dialogTitle,
  switchColors,
  hubUrl,
}: SocialMediaShareButtonProps) {
  const classes = useStyles({ switchColors: switchColors });
  const { locale } = useContext(UserContext);
  const cookies = new Cookies();
  const token = cookies.get("token");
  const isTinyScreen = useMediaQuery<Theme>(theme.breakpoints.down("sm"));
  const isSmallScreen = useMediaQuery<Theme>(theme.breakpoints.down("md"));
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

  const queryString = hubUrl ? `?hub=${hubUrl}` : "";
  const BASE_URL = process.env.BASE_URL ? process.env.BASE_URL : `https://climateconnect.earth`;
  const contentLink = BASE_URL + contentLinkPath + queryString;

  const handleClick = () => {
    //navigator.share (Web Share API) is only available with https
    if (navigator.share && isSmallScreen) {
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
      <div className={className}>
        <IconButton className={classes.button} onClick={handleClick} size="large">
          {/*adjusted viewBox to center the icon*/}
          <ShareIcon viewBox="2 0 24 24" />
        </IconButton>
      </div>
      <SocialMediaShareDialog
        open={showSocials}
        onClose={toggleShowSocials}
        createShareRecord={createShareRecord}
        tinyScreen={isTinyScreen}
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
