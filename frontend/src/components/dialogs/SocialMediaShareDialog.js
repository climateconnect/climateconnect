import LinkIcon from "@material-ui/icons/Link";
import GenericDialog from "./GenericDialog";
import React from "react";
import { Button, InputAdornment, TextField } from "@material-ui/core";

export default function SocialMediaShareDialog({ open, onClose, texts, project, locale }) {
  const handleClose = () => {
    onClose(false);
  };

  const BASE_URL = process.env.BASE_URL ? process.env.BASE_URL : "https://climateconnect.earth";
  const projectLink = BASE_URL + "/" + locale + "/projects/" + project.url_slug;
  const copyProjectLink = () => {
    navigator.clipboard.writeText(projectLink);
  };

  return (
    <GenericDialog onClose={handleClose} open={open} title={texts.tell_others_about_this_project}>
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
