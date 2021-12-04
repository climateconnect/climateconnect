import { Container, LinearProgress, makeStyles, Typography, useMediaQuery } from "@material-ui/core";
import React, { useContext } from "react";
import getTexts from "../../../../public/texts/texts";
import theme from "../../../themes/theme";
import UserContext from "../../context/UserContext";

const useStyles = makeStyles((theme) => ({
  root: (props) => ({
    paddingTop: (props.embedded || props.barOnly) ? 0 : theme.spacing(1),
    paddingBottom: (props.embedded || props.barOnly) ? 0 : theme.spacing(1.5),
    background: props.embedded ? "transparent" : "#DFDFDF",
    position: props.embedded ? "auto" : "absolute",
    top: -90,
    zIndex: 3,
    left: 0,
    width: "100%",
    height: props.embedded ? "auto" : 95,
    [theme.breakpoints.down("sm")]: {
      position: props.embedded ? "auto" : "fixed",
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
    position: props.textBackground ? "relative" : "auto",
  }),
  amount: (props) => ({
    fontSize: props.embedded ? "auto" : 22,
    fontWeight: 600,
  }),
  barContainer: props => ({
    height: (props.small || props.isInWidget) ? 15 : 25,
    borderRadius: 15,
    backgroundColor: theme.palette.grey[theme.palette.type === "light" ? 200 : 700],
    [theme.breakpoints.down("xs")]: {
      height: 15
    }
  }),
  bar: (props) => ({
    borderRadius: 5,
    backgroundColor: props.barColor ? props.barColor : theme.palette.primary.main,
  }),
}));

export default function DonationGoal({ className, current, goal, name, embedded, barColor, barOnly, small, isInWidget }) {
  //const atTopOfPage = TopOfPage({ initTopOfPage: true, marginToTrigger: 95 });
  const classes = useStyles({ embedded: embedded, barColor: barColor, small: small, barOnly: barOnly,isInWidget: isInWidget });
  const { locale } = useContext(UserContext);
  const isNarrowScreen = useMediaQuery(theme.breakpoints.down("xs"))
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
          value={(current / goal) < 100 ? (current / goal) * 100 : 100}
          classes={{
            root: classes.barContainer,
            bar: classes.bar,
          }}
        />        
      </Container>
    </div>
  );
}
