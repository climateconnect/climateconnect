import { Switch, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React from "react";

const useStyles = makeStyles(() => ({
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
  bold: {
    fontWeight: "bold",
  },
}));

export default function Switcher({
  trueLabel,
  falseLabel,
  value,
  required,
  handleChangeValue,
}: any) {
  const classes = useStyles();

  const handleValueChange = (event) => {
    handleChangeValue(event.target.value);
  };
  return (
    <div className={classes.flexBlock}>
      <span className={classes.switchTextContainer}>
        <Typography
          className={`${classes.switchText} ${!value && classes.bold}`}
          color={value ? "secondary" : "primary"}
        >
          {falseLabel}
        </Typography>
      </span>
      <Switch
        checked={value}
        required={required}
        color="primary"
        name="checkedA"
        inputProps={{ "aria-label": "secondary checkbox" }}
        onChange={handleValueChange}
      />
      <span className={classes.switchTextContainer}>
        <Typography
          className={`${classes.switchText} ${value && classes.bold}`}
          color={value ? "primary" : "secondary"}
        >
          {trueLabel}
        </Typography>
      </span>
    </div>
  );
}
