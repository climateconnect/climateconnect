import { IconButton, TextField, Tooltip, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";

import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";

const useStyles = makeStyles({
  shortDescriptionWrapper: {
    width: "100%",
    paddingTop: "56.25%",
    position: "relative",
  },
  shortDescription: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: "100%",
  },
  fullHeight: {
    height: "100%",
  },
});

export default function AddSummarySection({
  projectData,
  onDescriptionChange,
  className,
  subHeaderClassname,
  toolTipClassName,
  helpTexts,
  ToolTipIcon,
}) {
  const classes = useStyles(projectData);
  const shortDescriptionRef = React.useRef(null);
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale: locale });

  return (
    <div className={className}>
      <Typography component="h2" variant="subtitle2" color="primary" className={subHeaderClassname}>
        {texts.summarize_your_project}*
        <Tooltip title={helpTexts.short_description} className={toolTipClassName}>
          <IconButton size="large">
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
            texts.briefly_summarise_what_you_are_doing_part_one +
            (projectData.short_description ? projectData.short_description.length : 0) +
            texts.briefly_summarise_what_you_are_doing_part_two
          }
          ref={shortDescriptionRef}
          InputLabelProps={{
            shrink: true,
          }}
          onChange={(event) => onDescriptionChange(event, "short_description")}
          className={classes.shortDescription}
          InputProps={{
            classes: { root: classes.fullHeight, inputMultiline: classes.fullHeight },
          }}
          rows={2}
          value={projectData.short_description}
        />
      </div>
    </div>
  );
}
