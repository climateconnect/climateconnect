import { Container, LinearProgress, Theme, Typography, useMediaQuery } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import getTexts from "../../../../public/texts/texts";
import theme from "../../../themes/theme";
import UserContext from "../../context/UserContext";

type StyleProps = {
  embedded: boolean;
  barOnly: boolean;
  textBackground?: string;
  isInWidget: boolean;
  barColor?: string;
  small: boolean;
};
const useStyles = makeStyles<Theme, StyleProps>((theme) => ({
  root: (props) => ({
    paddingTop: props.embedded || props.barOnly ? 0 : theme.spacing(1),
    paddingBottom: props.embedded || props.barOnly ? 0 : theme.spacing(1.5),
    background: props.embedded ? "transparent" : "#DFDFDF",
    position: props.embedded ? undefined : "absolute",
    top: -90,
    zIndex: 3,
    left: 0,
    width: "100%",
    height: props.embedded ? "auto" : 95,
    [theme.breakpoints.down("md")]: {
      position: props.embedded ? undefined : "fixed",
      top: "auto",
      bottom: 42,
    },
  }),
  rootFixed: {
    [theme.breakpoints.up("md")]: {
      position: "fixed",
      top: 0,
      borderTop: 0,
    },
  },
  text: (props) => ({
    textAlign: "center",
    fontWeight: 600,
    color: props.embedded ? "white" : theme.palette.secondary.main,
    marginBottom: theme.spacing(1),
    background: props.textBackground ? props.textBackground : "auto",
    position: props.textBackground ? "relative" : undefined,
  }),
  amount: (props) => ({
    fontSize: props.embedded ? "auto" : 22,
    fontWeight: 600,
  }),
  barContainer: (props) => ({
    height: props.small || props.isInWidget ? 15 : 25,
    borderRadius: 15,
    backgroundColor: theme.palette.grey[theme.palette.mode === "light" ? 200 : 700],
    [theme.breakpoints.down("sm")]: {
      height: 15,
    },
  }),
  bar: (props) => ({
    borderRadius: 5,
    backgroundColor: props.barColor ? props.barColor : theme.palette.primary.main,
  }),
  barText: (props) => ({
    position: "absolute",
    top: "50%",
    left: props.textMarginLeft,
    transform: "translate(0, -50%)", // Center the text
    zIndex: 1000,
    color: theme.palette.primary.main,
    fontWeight: "bold",
    fontSize: 20,
  }),
}));

export default function DonationGoal({
  className,
  current,
  goal,
  name,
  embedded,
  barColor,
  barOnly,
  small,
  isInWidget,
}: any) {
  //const atTopOfPage = TopOfPage({ initTopOfPage: true, marginToTrigger: 95 });
  const classes = useStyles({
    embedded: embedded,
    barColor: barColor,
    small: small,
    barOnly: barOnly,
    isInWidget: isInWidget,
    textMarginLeft:
      current / goal < 0.9 ? `${(current / goal) * 100 + 1}%` : `${(current / goal) * 100 - 25}%`,
  });
  const { locale } = useContext(UserContext);
  const isNarrowScreen = useMediaQuery<Theme>(theme.breakpoints.down("sm"));
  const texts = getTexts({ page: "donate", locale: locale, classes: classes, goal: goal });
  return (
    <div className={`${className} ${classes.root}`}>
      <Container>
        {(!barOnly || !isNarrowScreen) && (
          <>
            <Typography className={classes.text}>
              {name}:{!embedded && <br />}{" "}
              <Typography className={classes.amount} component="span">
                {current}€
              </Typography>{" "}
              {texts.raised_out_of_goal}
            </Typography>
          </>
        )}

        <LinearProgress
          variant="determinate"
          value={current / goal < 100 ? (current / goal) * 100 : 100}
          classes={{
            root: classes.barContainer,
            bar: classes.bar,
          }}
        />
        <div className={classes.barText}>
          {current}/{goal}
        </div>
      </Container>
    </div>
  );
}
