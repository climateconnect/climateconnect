import {
  Card,
  FormControlLabel,
  Grid,
  makeStyles,
  Radio,
  RadioGroup,
  Typography,
} from "@material-ui/core";
import { SportsRugbySharp } from "@material-ui/icons";
import React from "react";
import { ProjectType } from "../../types";

const useStyles = makeStyles((theme) => ({
  reset: {
    margin: 0,
    padding: 0,
    listStyleType: "none",
    width: "100%",
  },
  box: {
    borderRadius: 3,
    margin: theme.spacing(1),
    boxShadow: "3px 3px 8px #E0E0E0",
    cursor: "pointer",
    display: "flex",
    color: theme.palette.secondary.main,
    alignItems: "center",
    position: "relative",
  },
  boxActive: {
    backgroundColor: "#d7f1ef",
    border: `1px solid ${theme.palette.primary.main}`,
  },
  textBox: {
    width: 225,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    marginRight: theme.spacing(4),
  },
  headline: {
    fontWeight: "bold",
  },
  helpText: {
    fontSize: 14,
  },
  imageContainer: {
    width: 60,
    margin: theme.spacing(2),
    display: "flex",
    alignItems: "stretch",
    height: "100%",
  },
  image: {
    height: "100%",
    width: "100%",
  },
  radioButton: {
    position: "absolute",
    right: 0,
    top: 0,
  },
}));

export default function ProjectTypeSelector({ className, value, onChange }) {
  const classes = useStyles();
  const types = [
    {
      name: "Project",
      value: "project",
      icon: "project.png",
      helpText: "Not an idea or event? Click here",
    },
    {
      name: "Idea",
      value: "idea",
      icon: "idea.svg",
      helpText: "Share your climate idea to find help and knowledge",
    },
    {
      name: "Event",
      value: "event",
      icon: "calendar.png",
      helpText: "Your project will show up in the event calendar",
    },
  ];
  return (
    <div className={className}>
      <RadioGroup>
        <Grid container component="ul" spacing={2} className={`${classes.reset} ${classes.root}`}>
          {types.map((type) => (
            <Grid item xs={12} sm={6} md={6} lg={6} component="li">
              <ProjectTypeBox type={type} value={value} onChange={onChange} />
            </Grid>
          ))}
        </Grid>
      </RadioGroup>
    </div>
  );
}

const ProjectTypeBox = ({ type, value, onChange }) => {
  const classes = useStyles();
  const handleChangeValue = (e) => {
    onChange(type.value);
  };
  return (
    <Card
      variant="outlined"
      className={`${classes.box} ${value === type.value && classes.boxActive}`}
      onClick={handleChangeValue}
    >
      <div className={classes.imageContainer}>
        <img src={`/images/${type.icon}`} className={classes.image} />
      </div>
      <div className={classes.textBox}>
        <Typography className={classes.headline}>{type.name}</Typography>
        <Typography className={classes.helpText}>{type.helpText}</Typography>
      </div>
      <Radio
        checked={value === type.value}
        onChange={handleChangeValue}
        name={type.name}
        value={type.value}
        className={classes.radioButton}
        color="primary"
      />
    </Card>
  );
};
