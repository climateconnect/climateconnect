import { Switch, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React from "react";
import { Theme } from "@mui/material/styles";

const useStyles = makeStyles((theme: Theme) => ({
  flexBlock: {
    display: "flex",
    justifyContent: "space-around",
  },
  switchTextContainer: {
    display: "flex",
    alignItems: "center",
  },
  switchText: {
    textAlign: "center",
    position: "relative",
  },
  switchedActive: {
    fontWeight: "bold",
    color: theme.palette.background.default_contrastText
  },
}));

export default function Switcher({
  trueLabel,
  falseLabel,
  value,
  required,
  handleChangeValue,
  color
}: any) {
  const classes = useStyles({ value: value});

  const handleValueChange = (event) => {
    handleChangeValue(event.target.value);
  };
  return (
    <div className={classes.flexBlock}>
      <span className={classes.switchTextContainer}>
        <Typography
          className={`${classes.switchText} ${!value && classes.switchedActive}`}
        >
          {falseLabel}
        </Typography>
      </span>
      <Switch
        checked={value}
        required={required}
        color={color ? color : "primary"}
        name="checkedA"
        inputProps={{ "aria-label": "secondary checkbox" }}
        onChange={handleValueChange}
      />
      <span className={classes.switchTextContainer}>
        <Typography
          className={`${classes.switchText} ${value && classes.switchedActive}`}
        >
          {trueLabel}
        </Typography>
      </span>
    </div>
  );
}
