import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import React from "react";

export default function CloseSnackbarAction({ onClose }) {
  return (
    <IconButton aria-label="close" color="inherit" onClick={onClose} size="large">
      <CloseIcon fontSize="small" />
    </IconButton>
  );
}
