import React from "react";
import { Typography, Container } from "@material-ui/core";
import WideLayout from "../src/components/layouts/WideLayout";
import RadioButtons from "../src/components/general/RadioButtons";
import { makeStyles } from "@material-ui/core/styles";
import StepsTracker from "../src/components/general/StepsTracker";
import DatePicker from "../src/components/general/DatePicker";
import project_status_metadata from "../public/data/project_status_metadata";
const DEFAULT_STATUS = "inprogress";

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
    subHeader: {
      marginBottom: theme.spacing(4)
    },
    inlineSubHeader: {
      display: "inline-block",
      marginRight: theme.spacing(4)
    },
    inlineBlock: {
      display: "inline-block"
    }
  };
});

export default function EnterDetails({ projectData }) {
  const [project, setProject] = React.useState(projectData ? projectData : defaultProject);
  const classes = useStyles();

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

  const values = project_status_metadata.map(status => ({
    ...status,
    label: status.createProjectLabel
  }));

  const statusesWithEndDate = ["cancelled", "finished"];

  const onStatusRadioChange = newStatus => {
    setProject({ ...project, status: newStatus });
  };

  //TODO: remove default values
  return (
    <WideLayout title="Share a project" hideHeadline={true}>
      <StepsTracker
        grayBackground={true}
        className={classes.stepsTracker}
        steps={steps}
        activeStep={steps[2].key}
      />
      <Typography variant="h4" color="primary" className={classes.headline}>
        {project.name}
      </Typography>
      <Container maxWidth="lg">
        <Typography
          component="h2"
          variant="subtitle2"
          color="primary"
          className={classes.subHeader}
        >
          General Information*
        </Typography>
        <div>
          <Typography component="h2" variant="subtitle2" className={classes.inlineSubHeader}>
            Your project is
          </Typography>
          <div className={classes.inlineBlock}>
            <RadioButtons
              defaultValue={DEFAULT_STATUS}
              onChange={onStatusRadioChange}
              values={values}
            />
          </div>
        </div>
        <div>
          <Typography component="h2" variant="subtitle2" className={classes.inlineSubHeader}>
            {!statusesWithEndDate.includes(project.status) ? "Started on" : "Date"}
          </Typography>
          <div className={classes.inlineBlock}>
            <DatePicker />
          </div>
        </div>
      </Container>
    </WideLayout>
  );
}

const defaultProject = {
  name: "CO2-Labels for University Canteen",
  status: DEFAULT_STATUS
};
