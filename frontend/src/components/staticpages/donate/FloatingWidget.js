import React from "react";
import { Container, makeStyles } from "@material-ui/core";
import ElementOnScreen from "../../general/ElementOnScreen";
import TopOfPage from "../../hooks/TopOfPage";
import BottomOfPage from "../../hooks/BottomOfPage";
import DonationGoal from "./DonationGoals";

const useStyles = makeStyles(theme => {
  return {
    twingle: {
      width: "100%",
      height: "100%",
      border: 0
    },
    twingleContainer: {
      position: "absolute",
      top: 110,
      right: theme.spacing(8),
      width: 400,
      height: 660,
      maxHeight: "95vh",
      [theme.breakpoints.down("md")]: {
        right: theme.spacing(2)
      },
      zIndex: 2
    },
    twingleContainerFixed: {
      position: "fixed",
      bottom: 10,
      top: "auto"
    },
    twingleContainerHidden: {
      visibility: "hidden"
    },
    twingleContainerAtBottom: {
      position: "absolute",
      bottom: -20,
      top: "auto"
    }
  };
});

export default function FloatingWidget({ goal_name, current_amount, goal_amount }) {
  const classes = useStyles();
  const [el, setEl] = React.useState(null);
  const [isFixed, setIsFixed] = React.useState(false);
  const [isAtBottom, setIsAtBottom] = React.useState(false);
  const trigger = ElementOnScreen({ el: el });
  const atTopOfPage = TopOfPage({ initTopOfPage: false, marginToTrigger: 200 });
  const atBottomOfPage = BottomOfPage({ initBottomOfPage: false, marginToTrigger: 363 });
  if (trigger && !isFixed) setIsFixed(true);
  if (atTopOfPage && !trigger && isFixed) setIsFixed(false);
  if (atBottomOfPage && !isAtBottom) setIsAtBottom(true);
  if (!atBottomOfPage && isAtBottom) setIsAtBottom(false);
  return (
    <Container maxWidth="xl" className={classes.twingleWrapper}>
      <div
        className={`${classes.twingleContainer} ${isFixed &&
          classes.twingleContainerFixed} ${isAtBottom && classes.twingleContainerAtBottom}`}
        ref={node => {
          if (node) {
            setEl(node);
          }
        }}
      >
        {goal_name && (
          <DonationGoal
            name={goal_name}
            current={current_amount}
            goal={goal_amount}
            className={classes.donationGoal}
          />
        )}
        <iframe
          className={classes.twingle}
          src="https://spenden.twingle.de/climate-connect-gug-haftungsbeschrankt/climate-connect/tw5ee1f393e9a58/widget"
        />
      </div>
    </Container>
  );
}
