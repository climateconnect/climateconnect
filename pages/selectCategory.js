import React from "react";
import { Typography, Button, Container } from "@material-ui/core";
import WideLayout from "../src/components/layouts/WideLayout";
import MultiLevelSelector from "../src/components/shareProject/MultiLevelSelector";
import { makeStyles } from "@material-ui/core/styles";
import StepsTracker from "../src/components/general/StepsTracker";
import project_categories from "../public/data/project_categories.json";

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

export default function Create() {
  const classes = useStyles();
  const [selectedCategories, setSelectedCategories] = React.useState([]);

  const steps = [
    {
      key: "share",
      text: "share project"
    },
    {
      key: "category",
      text: "project category"
    },
    {
      key: "details",
      text: "project details"
    }
  ];

  return (
    <WideLayout title="Select your project's category" hideHeadline={true}>
      <StepsTracker
        grayBackground={true}
        className={classes.stepsTracker}
        steps={steps}
        activeStep={steps[0].key}
      />
      <Typography variant="h4" color="primary" className={classes.headline}>
        {"Select your project's category"}
      </Typography>
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
          <Button variant="contained" className={classes.backButton}>
            Back
          </Button>
          <Button variant="contained" className={classes.nextStepButton} color="primary">
            Next Step
          </Button>
        </div>
      </Container>
    </WideLayout>
  );
}
