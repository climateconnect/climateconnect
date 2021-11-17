import LinkIcon from "@material-ui/icons/Link";
import GenericDialog from "./GenericDialog";
import React from "react";
import { Button, InputAdornment, makeStyles, TextField } from "@material-ui/core";
import {
  EmailShareButton,
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  LinkedinShareButton,
  RedditShareButton,
  TelegramShareButton,
  EmailIcon,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
  LinkedinIcon,
  RedditIcon,
  TelegramIcon,
} from "react-share";

const useStyles = makeStyles((theme) => ({
  shareButtonsContainer: {
    paddingBottom: theme.spacing(2),
    display: "flex",
    justifyContent: "space-between",
  },
}));

export default function SocialMediaShareDialog({
  open,
  onClose,
  texts,
  project,
  locale,
  projectAdmin,
}) {
  const classes = useStyles();

  const handleClose = () => {
    onClose(false);
  };

  const BASE_URL = process.env.BASE_URL ? process.env.BASE_URL : "https://climateconnect.earth";
  const projectLink = BASE_URL + "/" + locale + "/projects/" + project.url_slug;
  const facebookHashtag = "#believeintogether";
  const twitterHastags = ["believeintogether"];
  const message = texts.climate_protection_project_by + projectAdmin.name + ": " + project.name;
  const mailBody = texts.this_is_the_link_to_the_project;
  const copyProjectLink = () => {
    navigator.clipboard.writeText(projectLink);
  };

  return (
    <GenericDialog onClose={handleClose} open={open} title={texts.tell_others_about_this_project}>
      <div className={classes.shareButtonsContainer}>
        <EmailShareButton url={projectLink} subject={message} body={mailBody}>
          <EmailIcon size={50} round={true} />
        </EmailShareButton>
        <FacebookShareButton url={projectLink} quote={message} hashtag={facebookHashtag}>
          <FacebookIcon size={50} round={true} />
        </FacebookShareButton>
        <TwitterShareButton url={projectLink} title={message} hashtags={twitterHastags}>
          <TwitterIcon size={50} round={true} />
        </TwitterShareButton>
        <WhatsappShareButton url={projectLink} title={message}>
          <WhatsappIcon size={50} round={true} />
        </WhatsappShareButton>
        <LinkedinShareButton url={projectLink}>
          <LinkedinIcon size={50} round={true} />
        </LinkedinShareButton>
        <RedditShareButton url={projectLink} title={message}>
          <RedditIcon size={50} round={true} />
        </RedditShareButton>
        <TelegramShareButton url={projectLink} title={message}>
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
              <Button onClick={copyProjectLink}>{texts.copy_link}</Button>
            </InputAdornment>
          ),
        }}
        variant="outlined"
      />
    </GenericDialog>
  );
}
