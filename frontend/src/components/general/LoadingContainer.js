import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React, { useContext, useMemo } from "react";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";

const useStyles = makeStyles(() => ({
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
  const texts = useMemo(() => getTexts({ page: "general", locale: locale }), [locale]);
  return (
    <div className={classes.spinnerContainer}>
      <div>
        <img
          className={classes.spinner}
          src="/images/logo.svg"
          alt="Climate Connect logo"
          loading="lazy"
        />
      </div>
      <Typography component="div">{texts.loading_and_waiting}</Typography>
    </div>
  );
}
