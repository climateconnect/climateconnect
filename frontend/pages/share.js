import React, { useContext } from "react";
import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import WideLayout from "../src/components/layouts/WideLayout";
import StepsTracker from "../src/components/general/StepsTracker";
import ShareProject from "../src/components/shareProject/ShareProject";
import SelectCategory from "../src/components/shareProject/SelectCategory";
import EnterDetails from "../src/components/shareProject/EnterDetails";
import AddTeam from "../src/components/shareProject/AddTeam";
//TODO: this should be retrieved asynchronously, e.g. via getInitialProps
import ProjectSubmittedPage from "../src/components/shareProject/ProjectSubmittedPage";
import axios from "axios";
import tokenConfig from "../public/config/tokenConfig";
const DEFAULT_STATUS = "inprogress";
import Cookies from "next-cookies";
import LoginNudge from "../src/components/general/LoginNudge";
import UserContext from "../src/components/context/UserContext";

const useStyles = makeStyles(theme => {
  return {
    stepsTracker: {
      maxWidth: 600,
      margin: "0 auto"
    },
    headline: {
      textAlign: "center",
      marginTop: theme.spacing(4)
    }
  };
});

const steps = [
  {
    key: "share",
    text: "share project",
    headline: "Share a project"
  },
  {
    key: "selectCategory",
    text: "project category",
    headline: "Select your project's category"
  },
  {
    key: "enterDetails",
    text: "project details"
  },
  {
    key: "addTeam",
    text: "add team",
    headline: "Add your team"
  }
];

export default function Share({
  availabilityOptions,
  userOrganizations,
  categoryOptions,
  skillsOptions
}) {
  const classes = useStyles();
  const [project, setProject] = React.useState(defaultProjectValues);
  const [curStep, setCurStep] = React.useState(steps[0]);
  const [finished, setFinished] = React.useState(false);
  const { user } = useContext(UserContext);

  const goToNextStep = () => {
    console.log(project);
    setCurStep(steps[steps.indexOf(curStep) + 1]);
  };

  const goToPreviousStep = () => {
    setCurStep(steps[steps.indexOf(curStep) - 1]);
  };

  const submitProject = event => {
    console.log(project);
    //TODO: make a request to publish the project
    event.preventDefault();
    setFinished(true);
  };

  const saveAsDraft = event => {
    event.preventDefault();
    setProject({ ...project, isDraft: true });
    setFinished(true);
  };

  const handleSetProject = newProjectData => {
    setProject({ ...project, ...newProjectData });
  };

  return (
    <WideLayout title="Share a project" hideHeadline={true}>
      {user ? (
        <>
          {!finished ? (
            <>
              <StepsTracker
                grayBackground={true}
                className={classes.stepsTracker}
                steps={steps}
                activeStep={curStep.key}
              />
              <Typography variant="h4" color="primary" className={classes.headline}>
                {curStep.headline ? curStep.headline : project.name}
              </Typography>
              {curStep.key === "share" && (
                <ShareProject
                  project={project}
                  handleSetProjectData={handleSetProject}
                  goToNextStep={goToNextStep}
                  userOrganizations={userOrganizations}
                />
              )}
              {curStep.key === "selectCategory" && (
                <SelectCategory
                  project={project}
                  handleSetProjectData={handleSetProject}
                  goToNextStep={goToNextStep}
                  goToPreviousStep={goToPreviousStep}
                  categoryOptions={categoryOptions}
                />
              )}
              {curStep.key === "enterDetails" && (
                <EnterDetails
                  projectData={project}
                  handleSetProjectData={handleSetProject}
                  goToNextStep={goToNextStep}
                  goToPreviousStep={goToPreviousStep}
                  skillsOptions={skillsOptions}
                />
              )}
              {curStep.key === "addTeam" && (
                <AddTeam
                  projectData={project}
                  handleSetProjectData={handleSetProject}
                  submit={submitProject}
                  saveAsDraft={saveAsDraft}
                  goToPreviousStep={goToPreviousStep}
                  availabilityOptions={availabilityOptions}
                />
              )}
            </>
          ) : (
            <>
              <ProjectSubmittedPage isDraft={project.isDraft} url_slug={project.url_slug} />
            </>
          )}
        </>
      ) : (
        <LoginNudge fullPage whatToDo="share a project" />
      )}
    </WideLayout>
  );
}

Share.getInitialProps = async ctx => {
  const { token } = Cookies(ctx);
  return {
    availabilityOptions: await getAvailabilityOptions(token),
    userOrganizations: await getUserOrganizations(token),
    categoryOptions: await getCategoryOptions(token),
    skillsOptions: await getSkillsOptions(token)
  };
};

const getAvailabilityOptions = async token => {
  try {
    const resp = await axios.get(process.env.API_URL + "/availability/", tokenConfig(token));
    if (resp.data.results.length === 0) return null;
    else {
      return resp.data.results;
    }
  } catch (err) {
    console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
};

const getCategoryOptions = async token => {
  try {
    const resp = await axios.get(process.env.API_URL + "/api/projecttags/", tokenConfig(token));
    if (resp.data.results.length === 0) return null;
    else {
      return parseOptions(resp.data.results, "parent_tag");
    }
  } catch (err) {
    console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
};

const getSkillsOptions = async token => {
  try {
    const resp = await axios.get(process.env.API_URL + "/skills/", tokenConfig(token));
    if (resp.data.results.length === 0) return null;
    else {
      console.log(parseOptions(resp.data.results, "parent_skill"));
      return parseOptions(resp.data.results, "parent_skill");
    }
  } catch (err) {
    console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
};

const parseOptions = (options, parentPropertyName) => {
  return options
    .filter(o => o[parentPropertyName] === null)
    .map(o => {
      return {
        name: o.name,
        key: o.id,
        subcategories: options
          .filter(so => so[parentPropertyName] === o.id)
          .map(so => {
            return {
              name: so.name,
              key: so.id
            };
          })
      };
    });
};

const getUserOrganizations = async token => {
  try {
    const resp = await axios.get(
      process.env.API_URL + "/api/my_organizations/",
      tokenConfig(token)
    );
    if (resp.data.length === 0) return null;
    else {
      return resp.data.map(o => o.organization);
    }
  } catch (err) {
    console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
};

//TODO: remove some of these default values as they are just for testing
const defaultProjectValues = {
  collaborators_welcome: true,
  status: DEFAULT_STATUS,
  skills: [],
  helpful_connections: [],
  collaboratingOrganizations: [],
  //TODO: Should contain the logged in user as the creator and parent_user by default
  members: [
    {
      first_name: "Christoph",
      last_name: "Stoll",
      url_slug: "christophstoll",
      image: "images/christophstoll.jpg",
      permissions: {
        key: "creator",
        name: "Creator"
      }
    }
  ]
};
