import { Container, makeStyles, Theme, Typography, useMediaQuery } from "@material-ui/core";
import React from "react";
import theme from "../../../themes/theme";
import IconWrapper from "./IconWrapper";

const useStyles = makeStyles(() => ({
  root: {
    display: "flex",
  },
  icon: {
    width: 28,
    marginBottom: theme.spacing(-2),
    marginRight: theme.spacing(2),
  },
}));

export default function TextBox({
  className,
  headlineClass,
  textBodyClass,
  icon,
  text,
  headline,
  children,
  subPoints,
  subHeadlineClass,
}) {
  const classes = useStyles();
  const isNarrowScreen = useMediaQuery<Theme>(theme.breakpoints.down("xs"));
  return (
    <Container className={`${className} ${classes.root}`}>
      {!isNarrowScreen && <IconWrapper src={icon} />}
      <div>
        <Typography component="h1" className={headlineClass}>
          {isNarrowScreen && <img src={icon} className={classes.icon} />}
          {headline}
        </Typography>
        {children}
        <Typography className={textBodyClass}>{text}</Typography>
        {subPoints &&
          subPoints.map((p, index) => (
            <div key={index}>
              <Typography component="h2" className={subHeadlineClass}>
                {p.headline}
              </Typography>
              <Typography>{p.text}</Typography>
            </div>
          ))}
      </div>
    </Container>
  );
}
