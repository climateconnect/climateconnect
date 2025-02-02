import { Button, InputAdornment, TextField } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import LinkIcon from "@mui/icons-material/Link";
import React from "react";
import {
  EmailIcon,
  EmailShareButton,
  FacebookIcon,
  FacebookShareButton,
  LinkedinIcon,
  LinkedinShareButton,
  RedditIcon,
  RedditShareButton,
  TelegramIcon,
  TelegramShareButton,
  TwitterIcon,
  TwitterShareButton,
  WhatsappIcon,
  WhatsappShareButton,
} from "react-share";
import GenericDialog from "../dialogs/GenericDialog";

const useStyles = makeStyles((theme) => ({
  shareButtonsContainer: {
    paddingBottom: theme.spacing(2),
    display: "flex",
    justifyContent: "space-between",
    [theme.breakpoints.down("sm")]: {
      justifyContent: "flex-start",
      flexWrap: "wrap",
    },
  },
  copyButton: {
    color: theme.palette.background.default_contrastText,
  }
}));

export default function SocialMediaShareDialog({
  open,
  onClose,
  createShareRecord,
  tinyScreen,
  SHARE_OPTIONS,
  contentLink,
  messageTitle,
  mailBody,
  texts,
  dialogTitle,
}) {
  const classes = useStyles();

  const handleClose = () => {
    onClose(false);
  };

  const facebookHashtag = "#BelieveInTogether";
  const twitterHastags = ["BelieveInTogether"];

  const handleClick = (sharedVia) => {
    createShareRecord(sharedVia);
    navigator.clipboard.writeText(contentLink);
  };

  return (
    <GenericDialog onClose={handleClose} open={open} title={dialogTitle}>
      <div className={classes.shareButtonsContainer}>
        <EmailShareButton
          beforeOnClick={() => createShareRecord(SHARE_OPTIONS.e_mail)}
          url={contentLink}
          subject={messageTitle}
          body={mailBody}
        >
          <EmailIcon size={50} round={true} />
        </EmailShareButton>
        <FacebookShareButton
          beforeOnClick={() => createShareRecord(SHARE_OPTIONS.facebook)}
          url={contentLink}
          quote={messageTitle}
          hashtag={facebookHashtag}
        >
          <FacebookIcon size={50} round={true} />
        </FacebookShareButton>
        <TwitterShareButton
          beforeOnClick={() => createShareRecord(SHARE_OPTIONS.twitter)}
          url={contentLink}
          title={messageTitle}
          hashtags={twitterHastags}
        >
          <TwitterIcon size={50} round={true} />
        </TwitterShareButton>
        <WhatsappShareButton
          beforeOnClick={() => createShareRecord(SHARE_OPTIONS.whatsapp)}
          url={contentLink}
          title={messageTitle}
        >
          <WhatsappIcon size={50} round={true} />
        </WhatsappShareButton>
        {false && (
          <LinkedinShareButton
            beforeOnClick={() => createShareRecord(SHARE_OPTIONS.linkedin)}
            url={contentLink}
          >
            <LinkedinIcon size={50} round={true} />
          </LinkedinShareButton>
        )}
        <RedditShareButton
          beforeOnClick={() => createShareRecord(SHARE_OPTIONS.reddit)}
          url={contentLink}
          title={messageTitle}
        >
          <RedditIcon size={50} round={true} />
        </RedditShareButton>
        <TelegramShareButton
          beforeOnClick={() => createShareRecord(SHARE_OPTIONS.telegram)}
          url={contentLink}
          title={messageTitle}
        >
          <TelegramIcon size={50} round={true} />
        </TelegramShareButton>
      </div>
      <TextField
        fullWidth
        label={texts.link}
        defaultValue={contentLink}
        InputProps={{
          readOnly: true,
          startAdornment: (
            <InputAdornment position="start">
              <LinkIcon />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <Button className={classes.copyButton} onClick={() => handleClick(SHARE_OPTIONS.link)}>
                {tinyScreen ? texts.copy : texts.copy_link}
              </Button>
            </InputAdornment>
          ),
        }}
        variant="outlined"
      />
    </GenericDialog>
  );
}
