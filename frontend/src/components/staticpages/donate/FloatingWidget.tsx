import { Container } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React from "react";
import BottomOfPage from "../../hooks/BottomOfPage";
import ElementOnScreen from "../../hooks/ElementOnScreen";
import ElementSpaceToTop from "../../hooks/ElementSpaceToTop";
import DonationGoal from "./DonationGoal";

const useStyles = makeStyles((theme) => {
  return {
    twingle: {
      width: "100%",
      height: "100%",
      border: 0,
    },
    twingleContainer: {
      position: "absolute",
      top: 110,
      right: theme.spacing(8),
      width: 400,
      height: 660,
      maxHeight: "95vh",
      [theme.breakpoints.down("lg")]: {
        right: theme.spacing(2),
      },
      zIndex: 2,
    },
    twingleContainerFixed: {
      position: "fixed",
      bottom: 10,
      top: "auto",
    },
    twingleContainerHidden: {
      visibility: "hidden",
    },
    twingleContainerAtBottom: {
      position: "absolute",
      bottom: -20,
      top: "auto",
    },
  };
});

export default function FloatingWidget({ goal_name, current_amount, goal_amount }) {
  const classes = useStyles();
  const [el, setEl] = React.useState<HTMLDivElement | null>(null);
  const [isFixed, setIsFixed] = React.useState(false);
  const [isAtBottom, setIsAtBottom] = React.useState(false);
  const trigger = ElementOnScreen({ el: el });
  const spaceToTop = ElementSpaceToTop({ /*initTopOfPage: true,*/ el });
  const atBottomOfPage = BottomOfPage({ initBottomOfPage: false, marginToTrigger: 363 });
  if (!isFixed && trigger && spaceToTop.page != null && spaceToTop.page > 215) setIsFixed(true);
  if (isFixed && spaceToTop.page != null && spaceToTop.page < 215) setIsFixed(false);
  if (atBottomOfPage && !isAtBottom) setIsAtBottom(true);
  if (!atBottomOfPage && isAtBottom) setIsAtBottom(false);
  return (
    <Container maxWidth="xl" /*TODO(undefined) className={classes.twingleWrapper}*/>
      <div
        className={`${classes.twingleContainer} ${isFixed && classes.twingleContainerFixed} ${
          isAtBottom && classes.twingleContainerAtBottom
        }`}
        ref={(node) => {
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
            /*TODO(undefined) className={classes.donationGoal}*/
            isInWidget
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
