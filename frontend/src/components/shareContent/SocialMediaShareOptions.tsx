import { Button, InputAdornment, TextField } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import LinkIcon from "@mui/icons-material/Link";
import React from "react";
import {
  EmailIcon,
  EmailShareButton,
  FacebookIcon,
  FacebookShareButton,
  RedditIcon,
  RedditShareButton,
  TelegramIcon,
  TelegramShareButton,
  TwitterIcon,
  TwitterShareButton,
  WhatsappIcon,
  WhatsappShareButton,
} from "react-share";

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
  },
}));

//The actual share buttons and copy-link field, used both in the
//SocialMediaShareDialog (modal) and inline (e.g. on the project submitted page)
export default function SocialMediaShareOptions({
  createShareRecord,
  tinyScreen,
  SHARE_OPTIONS,
  contentLink,
  messageTitle,
  mailBody,
  texts,
}) {
  const classes = useStyles();

  const facebookHashtag = "#BelieveInTogether";
  const twitterHastags = ["BelieveInTogether"];

  const handleClick = (sharedVia) => {
    createShareRecord(sharedVia);
    navigator.clipboard.writeText(contentLink);
  };

  return (
    <>
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
              <Button
                className={classes.copyButton}
                onClick={() => handleClick(SHARE_OPTIONS.link)}
              >
                {tinyScreen ? texts.copy : texts.copy_link}
              </Button>
            </InputAdornment>
          ),
        }}
        variant="outlined"
      />
    </>
  );
}
