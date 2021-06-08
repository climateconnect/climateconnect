import { Button, makeStyles, TextField, Typography } from "@material-ui/core";
import React, { useContext, useState } from "react";
import getTexts from "../../../../public/texts/texts";
import UserContext from "../../context/UserContext";

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(1),
    background: "white",
  },
  mainHeadline: {
    fontWeight: 700,
    fontSize: 20,
    textAlign: "center",
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(1)
  },
  textField: {
    width: "100%",
    marginBottom: theme.spacing(2),
  },
  headline: {
    fontWeight: 600,
    fontSize: 17,
    marginBottom: theme.spacing(0.5),
  },
  buttonBar: {
    marginTop: theme.spacing(2),
  },
  publishButton: {
    float: "right",
  },
}))

export default function EditIdeaRoot({idea, cancelEdit}) {
  const classes = useStyles()
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "idea", locale: locale });
  const [editedIdea, setEditedIdea] = useState(idea)

  const handleValueChange = (newValue, key) => {
    setEditedIdea({ ...editedIdea, [key]: newValue });
  };

  const onClickCancel = (e) => {
    e.preventDefault()
    cancelEdit()
  }
  return (
    <div className={classes.root}>
      <Typography component="h2" className={classes.mainHeadline}>{texts.edit_your_idee}</Typography>
      <Typography className={classes.headline}>{texts.title}*</Typography>
      <TextField
        className={classes.textField}
        placeholder={texts.give_your_idea_a_meaningful_title}
        variant="outlined"
        required
        id="titleInput"
        onChange={(e) => handleValueChange(e.target.value, "name")}
        value={editedIdea.name}
      />
      <div className={classes.buttonBar}>
        <Button variant="contained" onClick={onClickCancel}>
          {texts.cancel}
        </Button>
        <Button type="submit" variant="contained" color="primary" className={classes.publishButton}>
          {texts.save}
        </Button>
      </div>
    </div>
  )
}