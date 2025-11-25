import React, { useContext } from "react";
import { TextField } from "@mui/material";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import { makeStyles } from "@mui/styles";
import { useTheme } from "@mui/material/styles";
import { getBackgroundContrastColor } from "../../../public/lib/themeOperations";

const useStyles = makeStyles((theme) => ({
  root: {
    marginBottom: theme.spacing(5),
    display: "flex",
    justifyContent: "center",
  },
  textField: {
    width: "100%",
    maxWidth: 800,
  },
  resize: {
    fontSize: 20,
  },
  input: {
    fontWeight: 600,
  },
}));

export default function ProjectNameSection({ projectData, handleSetProjectData }) {
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale: locale });
  const theme = useTheme();
  const classes = useStyles();

  const onChangeName = (e) => {
    handleSetProjectData({
      name: e.target.value,
    });
  };
  const color = getBackgroundContrastColor(theme);

  return (
    <div className={classes.root}>
      <TextField
        label={texts.project_name}
        className={classes.textField}
        required
        color={color}
        InputProps={{
          classes: {
            input: `${classes.resize} ${classes.input}`,
          },
        }}
        InputLabelProps={{
          classes: {
            root: classes.resize,
          },
        }}
        value={projectData.name}
        onChange={onChangeName}
      />
    </div>
  );
}
