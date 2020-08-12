import React from "react";
import { Container, Typography } from "@material-ui/core";
import MultiLevelSelector from "../general/MultiLevelSelector";
import { makeStyles } from "@material-ui/core/styles";
import BottomNavigation from "../general/BottomNavigation";

const useStyles = makeStyles(theme => {
  return {
    headline: {
      textAlign: "center",
      marginTop: theme.spacing(8),
      marginBottom: theme.spacing(8)
    },
    stepsTracker: {
      maxWidth: 600,
      margin: "0 auto"
    },
    block: {
      marginBottom: theme.spacing(4)
    },
    backButton: {
      color: theme.palette.primary.main
    },
    nextStepButton: {
      float: "right"
    },
    appealText: {
      textAlign: "center",
      fontWeight: "bold"
    },
    appealBox: {
      marginTop: theme.spacing(4),
      marginBottom: theme.spacing(-2)
    }
  };
});

export default function SelectCategory({
  project,
  handleSetProjectData,
  goToNextStep,
  goToPreviousStep,
  categoryOptions
}) {
  const classes = useStyles();
  const [selectedCategories, setSelectedCategories] = React.useState(
    project.project_tags ? project.project_tags : []
  );

  const onClickNextStep = () => {
    if (selectedCategories.length <= 0) alert("Please choose at least one category!");
    else if (selectedCategories.length > 3) alert("You can only choose up to 3 categories.");
    else {
      handleSetProjectData({ project_tags: selectedCategories });
      goToNextStep();
    }
  };

  const onClickPreviousStep = () => {
    handleSetProjectData({ project_tags: selectedCategories });
    goToPreviousStep();
  };

  return (
    <Container maxWidth="lg">
      <div className={classes.appealBox}>
        <Typography className={classes.appealText}>
          You can combine categories. For example if you fund treeplanting, select both{" "}
          {"Afforestation/Reforestration"} and {"Funding"}
        </Typography>
        <Typography className={classes.appealText}>
          This way you can specify what you are doing and in which field.
        </Typography>
      </div>
      <div className={classes.block}>
        <MultiLevelSelector
          itemsToSelectFrom={categoryOptions}
          maxSelections={3}
          itemNamePlural="categories"
          selected={selectedCategories}
          setSelected={setSelectedCategories}
          dragAble={true}
        />
      </div>
      <BottomNavigation
        className={classes.block}
        onClickPreviousStep={onClickPreviousStep}
        onClickNextStep={onClickNextStep}
      />
    </Container>
  );
}
