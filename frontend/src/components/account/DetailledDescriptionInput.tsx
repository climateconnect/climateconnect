import { IconButton, TextField, Tooltip, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import React from "react";

const useStyles = makeStyles((theme) => ({
  headline: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: theme.spacing(1),
    color: theme.palette.background.default_contrastText
  },
}));

export default function DetailledDescriptionInput({ title, helpText, value, onChange, infoKey }) {
  const classes = useStyles();
  const handleDescriptionChange = (e) => {
    e.preventDefault();
    onChange(e, infoKey);
  };
  return (
    <div>
      <Typography color="contrast" variant="h2" className={classes.headline}>
        {title}
        <Tooltip title={helpText} /*TODO(unused) className={classes.tooltip} */>
          <IconButton size="large">
            <HelpOutlineIcon />
          </IconButton>
        </Tooltip>
      </Typography>
      <TextField
        variant="outlined"
        fullWidth
        multiline
        rows={9}
        onChange={handleDescriptionChange}
        value={value}
      />
    </div>
  );
}
