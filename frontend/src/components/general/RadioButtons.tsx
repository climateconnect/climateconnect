import React from "react";
import { RadioGroup, Radio, FormControlLabel } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";

const useStyles = makeStyles({
  root: {
    "&:hover": {
      backgroundColor: "transparent",
    },
  },
  icon: {
    borderRadius: "50%",
    width: 16,
    height: 16,
    boxShadow: "inset 0 0 0 1px rgba(16,22,26,.2), inset 0 -1px 0 rgba(16,22,26,.1)",
    backgroundColor: "#f5f8fa",
    backgroundImage: "linear-gradient(180deg,hsla(0,0%,100%,.8),hsla(0,0%,100%,0))",
    "$root.Mui-focusVisible &": {
      outline: "2px auto rgba(19,124,189,.6)",
      outlineOffset: 2,
    },
    "input:hover ~ &": {
      backgroundColor: "#ebf1f5",
    },
    "input:disabled ~ &": {
      boxShadow: "none",
      background: "rgba(206,217,224,.5)",
    },
  },
  checkedIcon: {
    backgroundColor: "#137cbd",
    backgroundImage: "linear-gradient(180deg,hsla(0,0%,100%,.1),hsla(0,0%,100%,0))",
    "&:before": {
      display: "block",
      width: 16,
      height: 16,
      backgroundImage: "radial-gradient(#fff,#fff 28%,transparent 32%)",
      content: '""',
    },
    "input:hover ~ &": {
      backgroundColor: "#106ba3",
    },
  },
});

function StyledRadio(props) {
  const classes = useStyles();

  return (
    <Radio
      className={classes.root}
      disableRipple
      color="default"
      checkedIcon={<span className={`${classes.icon} ${classes.checkedIcon}`} />}
      icon={<span className={classes.icon} />}
      {...props}
    />
  );
}

// TODO: dead code?
export default function RadioButtons({ values, defaultValue, value, className, onChange }: any) {
  const [checkedValue, setCheckedValue] = React.useState(value ? value : defaultValue);

  const handleCheckedValueChange = (event) => {
    setCheckedValue(event.target.value);
    onChange(event.target.value);
  };

  return (
    <RadioGroup
      className={className}
      value={checkedValue}
      onChange={handleCheckedValueChange}
      aria-label="project status" //TODO: fix
      name="customized-radios"
    >
      {values.map((value) => (
        <FormControlLabel
          value={value.key}
          key={value.key}
          control={<StyledRadio />}
          label={value.label ? value.label : value.name}
        />
      ))}
    </RadioGroup>
  );
}
