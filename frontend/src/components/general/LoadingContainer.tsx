"use client";
import { Icon, SvgIcon, Theme, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { Box } from "@mui/system";

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
  text: {
    fontSize: 18,
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
        <LoadingIcon />
      </div>
      <Typography component="div" className={classes.text}>
        {texts.loading_and_waiting}
      </Typography>
    </div>
  );
}

function LoadingIcon() {
  return (
    <Box
      component="img"
      src="/images/logo_spinner.svg"
      sx={{
        height: 80,
        width: 80,
        animation: "spin 2s linear infinite",
        "@keyframes spin": {
          "0%": {
            transform: "rotate(0deg)",
          },
          "100%": {
            transform: "rotate(360deg)",
          },
        },
      }}
    />
  );
}
