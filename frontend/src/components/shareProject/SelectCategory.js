import React from "react";
import { Button, Container } from "@material-ui/core";
import MultiLevelSelector from "./MultiLevelSelector";
import { makeStyles } from "@material-ui/core/styles";
import project_categories from "../../../public/data/project_categories.json";

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

export default function SelectCategory({ project, setProject, goToNextStep, goToPreviousStep }) {
  const classes = useStyles();
  const [selectedCategories, setSelectedCategories] = React.useState(
    project.categories ? project.categories : []
  );

  const onClickNextStep = () => {
    if (selectedCategories.length <= 0) alert("Please choose at least one category!");
    else if (selectedCategories.length > 3) alert("You can only choose up to 3 categories.");
    else {
      setProject({ ...project, categories: selectedCategories });
      goToNextStep();
    }
  };

  const onClickPreviousStep = () => {
    setProject({ ...project, categories: selectedCategories });
    goToPreviousStep();
  };

  return (
    <Container maxWidth="lg">
      <div className={classes.block}>
        <MultiLevelSelector
          itemsToSelectFrom={project_categories}
          maxSelections={3}
          itemNamePlural="categories"
          selected={selectedCategories}
          setSelected={setSelectedCategories}
        />
      </div>
      <div className={`${classes.block} ${classes.navigationButtonWrapper}`}>
        <Button variant="contained" className={classes.backButton} onClick={onClickPreviousStep}>
          Back
        </Button>
        <Button
          variant="contained"
          className={classes.nextStepButton}
          color="primary"
          onClick={onClickNextStep}
        >
          Next Step
        </Button>
      </div>
    </Container>
  );
}
