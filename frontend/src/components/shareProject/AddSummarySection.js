import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Typography, Tooltip, IconButton, TextField } from "@material-ui/core";

const useStyles = makeStyles({
  shortDescriptionWrapper: {
    width: "100%",
    paddingTop: "56.25%",
    position: "relative"
  },
  shortDescription: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: "100%"
  },
  fullHeight: {
    height: "100%"
  }
});

export default function AddSummarySection({
  projectData,
  onDescriptionChange,
  className,
  subHeaderClassname,
  toolTipClassName,
  helpTexts,
  ToolTipIcon
}) {
  const classes = useStyles(projectData);
  const shortDescriptionRef = React.useRef(null);

  return (
    <div className={className}>
      <Typography component="h2" variant="subtitle2" color="primary" className={subHeaderClassname}>
        Summarize your project*
        <Tooltip title={helpTexts.short_description} className={toolTipClassName}>
          <IconButton>
            <ToolTipIcon />
          </IconButton>
        </Tooltip>
      </Typography>
      <div className={classes.shortDescriptionWrapper}>
        <TextField
          variant="outlined"
          required
          fullWidth
          multiline
          helperText={
            "Briefly summarise what you are doing (up to 240 characters)\n\nPlease only use English!"
          }
          ref={shortDescriptionRef}
          InputLabelProps={{
            shrink: true
          }}
          onChange={event => onDescriptionChange(event, "short_description")}
          className={classes.shortDescription}
          InputProps={{
            classes: { root: classes.fullHeight, inputMultiline: classes.fullHeight }
          }}
          placeholder={
            "Briefly summarise what you are doing (up to 240 characters)\n\nPlease only use English!"
          }
          rows={2}
          value={projectData.short_description}
        />
      </div>
    </div>
  );
}
