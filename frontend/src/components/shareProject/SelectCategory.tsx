import { Container, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import NavigationButtons from "../general/NavigationButtons";
import MiniHubPreviews from "../hub/MiniHubPreviews";

const useStyles = makeStyles((theme) => {
  return {
    headline: {
      textAlign: "center",
      marginTop: theme.spacing(8),
      marginBottom: theme.spacing(8),
    },
    stepsTracker: {
      maxWidth: 600,
      margin: "0 auto",
    },
    block: {
      marginBottom: theme.spacing(4),
      marginTop: theme.spacing(4),
    },
    backButton: {
      color: theme.palette.primary.main,
    },
    nextStepButton: {
      float: "right",
    },
    appealText: {
      textAlign: "center",
      fontWeight: "bold",
    },
    appealBox: {
      marginTop: theme.spacing(4),
      marginBottom: theme.spacing(-2),
    },
  };
});

export default function SelectCategory({
  project,
  goToNextStep,
  goToPreviousStep,
  sectorsToSelectFrom,
  onSelectNewSector,
  onClickRemoveSector,
}) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale: locale });

  const onClickNextStep = () => {
    if (project.sectors.length <= 0) alert(texts.please_choose_at_least_one_category);
    else if (project.sectors.length > 3) alert(texts.you_can_only_choose_up_to_3_categories);
    else {
      goToNextStep();
    }
  };

  const onClickPreviousStep = () => {
    goToPreviousStep();
  };

  //(Share Project step 2)
  //Use ActiveHubsSelect instead of MultiLevelSelector (Ask Tobi if different design should be used)
  return (
    <Container maxWidth="lg">
      <div className={classes.appealBox}>
        <Typography className={classes.appealText}>
          {texts.you_can_combine_categories_text}
        </Typography>
        <Typography className={classes.appealText}>
          {texts.this_way_you_can_specify_what_you_are_doing_and_in_which_field}
        </Typography>
      </div>
      <div className={classes.block}>
        <Container maxWidth="md">
          <MiniHubPreviews
            allowCreate
            editMode
            allHubs={sectorsToSelectFrom}
            hubs={project.sectors ? project.sectors : []}
            onSelectNewHub={onSelectNewSector}
            onClickRemoveHub={onClickRemoveSector}
          />
        </Container>
      </div>
      <NavigationButtons
        className={classes.block}
        onClickPreviousStep={onClickPreviousStep}
        onClickNextStep={onClickNextStep}
      />
    </Container>
  );
}
