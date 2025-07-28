import { Container } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import NavigationButtons from "../general/NavigationButtons";
import ActiveSectorsSelector from "../hub/ActiveSectorsSelector";

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

export default function SelectSectors({
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
    if (project.sectors.length <= 0) alert(texts.please_choose_at_least_one_sector);
    else if (project.sectors.length > 3) alert(texts.you_can_only_choose_up_to_3_sectors);
    else {
      goToNextStep();
    }
  };

  const onClickPreviousStep = () => {
    goToPreviousStep();
  };

  //(Share Project step 2)
  return (
    <Container maxWidth="lg">
      <div className={classes.block}>
        <Container maxWidth="md">
          <ActiveSectorsSelector
            selectedSectors={project.sectors ? project.sectors : []}
            sectorsToSelectFrom={sectorsToSelectFrom}
            maxSelectedNumber={3}
            onSelectNewSector={onSelectNewSector}
            onClickRemoveSector={onClickRemoveSector}
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
