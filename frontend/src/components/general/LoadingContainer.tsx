import { Theme, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";

const useStyles = makeStyles<Theme, { subtractedHeight?: string }>(() => ({
  spinnerContainer: (props) => ({
    display: "flex",
    position: "relative",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: `calc(100vh - ${props.subtractedHeight}px)`,
    flexDirection: "column",
  }),
  spinner: {
    width: 100,
  },
}));
export default function LoadingContainer({ headerHeight, footerHeight }) {
  const classes = useStyles({
    subtractedHeight: (headerHeight + footerHeight).toString(),
  });
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "general", locale: locale });
  return (
    <div className={classes.spinnerContainer}>
      <div>
        <img className={classes.spinner} src="/images/logo.png" alt="Climate Connect logo" />
      </div>
      <Typography component="div">{texts.loading_and_waiting}</Typography>
    </div>
  );
}
