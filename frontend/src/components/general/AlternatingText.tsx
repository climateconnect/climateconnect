import { Typography } from "@mui/material";
import React, { useContext } from "react";
import TextLoop from "react-text-loop";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";

export default function AlternatingText({ classes, mobile }) {
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "landing_page", locale: locale });
  return (
    <TextLoop mask={true} interval={4000}>
      <div className={classes.titleTextFirstLine}>
        <Typography component="h1" variant="h5" color="primary" className={classes.titleText}>
          {texts.find}
        </Typography>
        {texts.climate_projects}
      </div>
      <div className={classes.titleTextFirstLine}>
        <Typography component="h1" variant="h5" color="primary" className={classes.titleText}>
          {texts.work_on}
        </Typography>
        {texts.climate_projects_with}
      </div>
      <div className={classes.titleTextFirstLine}>
        <Typography component="h1" variant="h5" color="primary" className={classes.titleText}>
          {texts.learn_from}
        </Typography>
        {texts.climate_projects_with}
      </div>
      <div className={classes.titleTextFirstLine}>
        <Typography component="h1" variant="h5" color="primary" className={classes.titleText}>
          {texts.replicate}
        </Typography>
        {texts.climate_projects}
      </div>
      <div className={classes.titleTextFirstLine}>
        <Typography component="h1" variant="h5" color="primary" className={classes.titleText}>
          {texts.share_request}
        </Typography>
        {texts.climate_projects}
      </div>
      <div className={classes.titleTextFirstLine}>
        <Typography component="h1" variant="h5" color="primary" className={classes.titleText}>
          {mobile ? texts.join_invitation : texts.collaborate_with}
        </Typography>
        {texts.climate_projects_with}
      </div>
    </TextLoop>
  );
}
