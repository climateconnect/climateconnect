import React, { PropsWithChildren } from "react";
import { Typography, Theme } from "@mui/material";

import makeStyles from "@mui/styles/makeStyles";

const useStyles = makeStyles<Theme, { horizontal?: boolean }>((theme) => ({
  explainerElementWrapper: (props) => ({
    display: "flex",
    flexDirection: props.horizontal ? "row" : "column",
    justifyContent: props.horizontal ? "center" : "auto",
    alignItems: "center",
    textAlign: props.horizontal ? undefined : "center",
    maxWidth: props.horizontal ? 330 : 300,
    position: "relative",
  }),
  explainerIcon: (props) => ({
    maxWidth: 50,
    marginBottom: props.horizontal ? 0 : theme.spacing(2),
    marginRight: props.horizontal ? theme.spacing(5) : 0,
  }),
}));

type Props = PropsWithChildren<{
  icon?: string;
  text: string | JSX.Element;
  alt?: string;
  horizontal?: boolean;
}>;
export default function ExplainerElement({ icon, text, children, alt, horizontal }: Props) {
  const classes = useStyles({ horizontal: horizontal });
  return (
    <div className={classes.explainerElementWrapper}>
      {children}
      <img src={icon} className={classes.explainerIcon} alt={alt} />
      <Typography>{text}</Typography>
    </div>
  );
}
