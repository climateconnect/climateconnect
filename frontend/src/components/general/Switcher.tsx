import { Switch, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React from "react";
import { Theme } from "@mui/material/styles";

const useStyles = makeStyles((theme: Theme) => ({
  flexBlock: {
    display: "flex",
    justifyContent: "flex-start",
    gap: theme.spacing(2),
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
    color: theme.palette.background.default_contrastText,
  },
  disabled: {
    opacity: 0.5,
    pointerEvents: "none",
  },
}));

export default function Switcher({
  trueLabel,
  falseLabel,
  value,
  required,
  handleChangeValue,
  color,
  disabled,
}: any) {
  const classes = useStyles({ value: value });

  const handleValueChange = (event) => {
    handleChangeValue(event.target.value);
  };
  return (
    <div className={`${classes.flexBlock} ${disabled ? classes.disabled : ""}`}>
      <span className={classes.switchTextContainer}>
        <Typography className={`${classes.switchText} ${!value && classes.switchedActive}`}>
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
        disabled={disabled}
      />
      <span className={classes.switchTextContainer}>
        <Typography className={`${classes.switchText} ${value && classes.switchedActive}`}>
          {trueLabel}
        </Typography>
      </span>
    </div>
  );
}
