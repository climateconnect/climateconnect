import { Typography } from "@material-ui/core";
import React, { useContext } from "react";
import TextLoop from "react-text-loop";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";

export default function AlternatingText({ classes, mobile }) {
  if (!classes) classes = {};
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "general", locale: locale });
  return (
    <TextLoop mask={true} interval={4000}>
      <Typography component="h1" variant="h5" color="primary" className={classes.titleText}>
        {texts.share}
      </Typography>
      <Typography component="h1" variant="h5" color="primary" className={classes.titleText}>
        {texts.find}
      </Typography>
      <Typography component="h1" variant="h5" color="primary" className={classes.titleText}>
        {texts.work_on}
      </Typography>
      <Typography component="h1" variant="h5" color="primary" className={classes.titleText}>
        {texts.get_inspired_by}
      </Typography>
      <Typography component="h1" variant="h5" color="primary" className={classes.titleText}>
        {texts.replicate}
      </Typography>
      <Typography component="h1" variant="h5" color="primary" className={classes.titleText}>
        {mobile ? texts.join : texts.collaborate_with}
      </Typography>
    </TextLoop>
  );
}
