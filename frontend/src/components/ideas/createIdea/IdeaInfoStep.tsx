import { Button, TextField, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext, useState } from "react";
import getTexts from "../../../../public/texts/texts";
import UserContext from "../../context/UserContext";
import UploadImageField from "../UploadImageField";

const useStyles = makeStyles((theme) => ({
  textField: {
    width: "100%",
    marginBottom: theme.spacing(2),
  },
  headline: {
    fontWeight: 600,
    fontSize: 17,
    marginBottom: theme.spacing(0.5),
  },
  uploadImageField: {
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
      margin: "0 auto",
      marginTop: theme.spacing(1),
    },
  },
  motivationText: {
    marginBottom: theme.spacing(2),
    fontSize: 17,
    fontWeight: 600,
  },
  imageAnDescriptionWrapper: {
    display: "flex",
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
    },
  },
  descriptionContainer: {
    flexGrow: 1,
    marginRight: theme.spacing(1),
  },
  nextStepButton: {
    marginTop: theme.spacing(2),
    float: "right",
    color: "white",
  },
}));

export const SHORT_DESCRIPTION_MAX_LENGTH = 2048;

export default function IdeaInfoStep({ idea, handleValueChange, updateImages, goToNextStep }) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "idea", locale: locale });

  const handleSubmit = (e) => {
    e.preventDefault();
    goToNextStep();
  };

  const [shortDescriptionError, setShortDescriptionError] = useState("");

  const handleChangeShortDescription = (e) => {
    if (e.target.value.length > SHORT_DESCRIPTION_MAX_LENGTH)
      setShortDescriptionError(texts.idea_description_max_length_reached);
    else if (shortDescriptionError) setShortDescriptionError("");
    handleValueChange(e.target.value.slice(0, SHORT_DESCRIPTION_MAX_LENGTH), "short_description");
  };
  return (
    <form onSubmit={handleSubmit}>
      <Typography className={classes.motivationText}>
        {texts.create_an_idea_first_step_text}
      </Typography>
      <Typography className={classes.headline}>{texts.title}*</Typography>
      <TextField
        className={classes.textField}
        placeholder={texts.give_your_idea_a_meaningful_title}
        variant="outlined"
        required
        id="titleInput"
        onChange={(e) => handleValueChange(e.target.value, "name")}
        value={idea.name}
      />
      <div className={classes.imageAnDescriptionWrapper}>
        <div className={classes.descriptionContainer}>
          <Typography className={classes.headline}>{texts.description}*</Typography>
          <TextField
            className={classes.textField}
            variant="outlined"
            placeholder={texts.describe_idea_placeholder}
            required
            size="small"
            multiline
            rows={9}
            onChange={(e) => handleChangeShortDescription(e)}
            value={idea.short_description}
            helperText={shortDescriptionError}
            error={shortDescriptionError as any}
          />
        </div>
        <div>
          <Typography className={classes.headline}>{texts.image_optional}</Typography>
          <UploadImageField
            className={classes.uploadImageField}
            updateImages={updateImages}
            image={idea.image}
          />
        </div>
      </div>
      <Button type="submit" variant="contained" color="primary" className={classes.nextStepButton}>
        {texts.go_forward}
      </Button>
    </form>
  );
}
