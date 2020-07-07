import React from "react";
import { Container } from "@material-ui/core";
import MultiLevelSelector from "./MultiLevelSelector";
import { makeStyles } from "@material-ui/core/styles";
import BottomNavigation from "./BottomNavigation";

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
    project.categories ? project.categories : []
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
      <div className={classes.block}>
        <MultiLevelSelector
          itemsToSelectFrom={categoryOptions}
          maxSelections={3}
          itemNamePlural="categories"
          selected={selectedCategories}
          setSelected={setSelectedCategories}
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
