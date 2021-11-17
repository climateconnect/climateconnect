import GenericDialog from "./GenericDialog";
import React from "react";

export default function SocialMediaShareDialog({ open, onClose, texts }) {
  const handleClose = () => {
    onClose(false);
  };

  return (
    <GenericDialog
      onClose={handleClose}
      open={open}
      title={texts.tell_others_about_this_project}
    />
  );
}
