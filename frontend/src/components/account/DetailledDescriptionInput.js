import { IconButton, makeStyles, TextField, Tooltip, Typography } from "@material-ui/core";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import React from "react";

const useStyles = makeStyles((theme) => ({
  headline: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: theme.spacing(1),
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
      <Typography color="primary" variant="h2" className={classes.headline}>
        {title}
        <Tooltip title={helpText} className={classes.tooltip}>
          <IconButton>
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
