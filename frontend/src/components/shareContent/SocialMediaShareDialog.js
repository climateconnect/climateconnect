import { Button, InputAdornment, makeStyles, TextField } from "@material-ui/core";
import LinkIcon from "@material-ui/icons/Link";
import React, { useContext } from "react";
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
import UserContext from "../context/UserContext";
import GenericDialog from "../dialogs/GenericDialog";

const useStyles = makeStyles((theme) => ({
  shareButtonsContainer: {
    paddingBottom: theme.spacing(2),
    display: "flex",
    justifyContent: "space-between",
    [theme.breakpoints.down("xs")]: {
      justifyContent: "flex-start",
      flexWrap: "wrap",
    },
  },
}));

export default function SocialMediaShareDialog({
  open,
  onClose,
  createShareRecord,
  tinyScreen,
  SHARE_OPTIONS,
  projectLink,
  title,
  mailBody,
  texts,
}) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);

  const handleClose = () => {
    onClose(false);
  };

  const facebookHashtag = "#BelieveInTogether";
  const twitterHastags = ["BelieveInTogether"];

  const handleClick = (sharedVia) => {
    createShareRecord(sharedVia);
    navigator.clipboard.writeText(projectLink);
  };

  return (
    <GenericDialog onClose={handleClose} open={open} title={texts.tell_others_about_this_project}>
      <div className={classes.shareButtonsContainer}>
        <EmailShareButton
          beforeOnClick={() => createShareRecord(SHARE_OPTIONS.e_mail)}
          url={projectLink}
          subject={title}
          body={mailBody}
        >
          <EmailIcon size={50} round={true} />
        </EmailShareButton>
        <FacebookShareButton
          beforeOnClick={() => createShareRecord(SHARE_OPTIONS.facebook)}
          url={projectLink}
          quote={title}
          hashtag={facebookHashtag}
        >
          <FacebookIcon size={50} round={true} />
        </FacebookShareButton>
        <TwitterShareButton
          beforeOnClick={() => createShareRecord(SHARE_OPTIONS.twitter)}
          url={projectLink}
          title={title}
          hashtags={twitterHastags}
        >
          <TwitterIcon size={50} round={true} />
        </TwitterShareButton>
        <WhatsappShareButton
          beforeOnClick={() => createShareRecord(SHARE_OPTIONS.whatsapp)}
          url={projectLink}
          title={title}
        >
          <WhatsappIcon size={50} round={true} />
        </WhatsappShareButton>
        {false && (
          <LinkedinShareButton
            beforeOnClick={() => createShareRecord(SHARE_OPTIONS.linkedin)}
            url={projectLink}
          >
            <LinkedinIcon size={50} round={true} />
          </LinkedinShareButton>
        )}
        <RedditShareButton
          beforeOnClick={() => createShareRecord(SHARE_OPTIONS.reddit)}
          url={projectLink}
          title={title}
        >
          <RedditIcon size={50} round={true} />
        </RedditShareButton>
        <TelegramShareButton
          beforeOnClick={() => createShareRecord(SHARE_OPTIONS.telegram)}
          url={projectLink}
          title={title}
        >
          <TelegramIcon size={50} round={true} />
        </TelegramShareButton>
      </div>
      <TextField
        fullWidth
        label={texts.link}
        defaultValue={projectLink}
        InputProps={{
          readOnly: true,
          startAdornment: (
            <InputAdornment position="start">
              <LinkIcon />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <Button onClick={() => handleClick(SHARE_OPTIONS.link)}>
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
