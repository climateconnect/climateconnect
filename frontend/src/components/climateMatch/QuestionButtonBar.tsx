import { Button } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import LightBigButton from "../staticpages/LightBigButton";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";

const useStyles = makeStyles((theme) => ({
  backButton: {
    height: 40,
    color: "white",
    borderColor: "white",
  },
  backIconButton: {
    color: "white",
  },
  forwardButton: {
    height: 40,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    float: "right",
    fontSize: 14,
  },
}));

export default function QuestionButtonBar({ onForwardClick, onBackClick, disableForward }: any) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "climatematch", locale: locale });
  return (
    <div>
      {disableForward ? (
        <Button className={classes.backIconButton} onClick={onBackClick}>
          <ArrowBackIosIcon />
          {texts.back}
        </Button>
      ) : (
        <Button variant="outlined" className={classes.backButton} onClick={onBackClick}>
          {texts.back}
        </Button>
      )}
      {!disableForward && (
        <LightBigButton className={classes.forwardButton} onClick={onForwardClick}>
          {texts.forward}
        </LightBigButton>
      )}
    </div>
  );
}
