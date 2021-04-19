import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Router from "next/router";
import React, { useContext, useEffect, useState } from "react";
import { apiRequest } from "../../../public/lib/apiOperations";
import { blobFromObjectUrl } from "../../../public/lib/imageOperations";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import StepsTracker from "./../general/StepsTracker";
import AddTeam from "./AddTeam";
import EnterDetails from "./EnterDetails";
import ProjectSubmittedPage from "./ProjectSubmittedPage";
import SelectCategory from "./SelectCategory";
import ShareProject from "./ShareProject";
import TranslateProject from "./TranslateProject";
const DEFAULT_STATUS = 2;

const useStyles = makeStyles((theme) => {
  return {
    stepsTracker: {
      maxWidth: 600,
      margin: "0 auto",
    },
    headline: {
      textAlign: "center",
      marginTop: theme.spacing(4),
    },
  };
});

const getSteps = (texts, sourceLocale) => {
  const steps = [
    {
      key: "share",
      text: texts.basic_info,
      headline: texts.share_a_project,
    },
    {
      key: "selectCategory",
      text: texts.project_category,
      headline: texts.select_1_to_3_categories_that_fit_your_project,
    },
    {
      key: "enterDetails",
      text: texts.project_details,
    },
    {
      key: "addTeam",
      text: texts.add_team,
      headline: texts.add_your_team,
    },
  ];
  if (sourceLocale === "de") {
    steps.push({
      key: "translate",
      text: texts.languages,
      headline: texts.translate,
      sourceLocale: ["de"],
    });
  }
  return steps;
};

export default function ShareProjectRoot({
  availabilityOptions,
  userOrganizations,
  categoryOptions,
  skillsOptions,
  rolesOptions,
  user,
  statusOptions,
  token,
  setMessage,
}) {
  const classes = useStyles();
  const { locale, locales } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale: locale });
  const steps = getSteps(texts, locale);
  const [project, setProject] = React.useState(
    getDefaultProjectValues(
      {
        ...user,
        role: rolesOptions.find((r) => r.name === "Creator"),
        role_in_project: "",
      },
      statusOptions,
      userOrganizations
    )
  );

  const getStep = (stepNumber) => {
    if (stepNumber >= steps.length) return steps[steps.length - 1];
    return steps[stepNumber];
  };

  const [sourceLanguage, setSourceLanguage] = useState(locale);
  const [targetLanguage, setTargetLanguage] = useState(locales.find((l) => l !== locale));
  const [translations, setTranslations] = React.useState({});
  const [curStep, setCurStep] = React.useState(getStep(0));
  const [finished, setFinished] = React.useState(false);

  const changeTranslationLanguages = ({ newLanguagesObject }) => {
    if (newLanguagesObject.sourceLanguage) setSourceLanguage(newLanguagesObject.sourceLanguage);
    if (newLanguagesObject.targetLanguage) setTargetLanguage(newLanguagesObject.targetLanguage);
  };

  useEffect(() => {
    if (window) {
      const location = window.location.href;
      Router.beforePopState(({ as }) => {
        if (location.includes("/share") && as != "/share") {
          const result = window.confirm(
            texts.are_you_sure_you_want_to_leave_you_will_lose_your_project
          );
          if (!result) {
            return false;
          }
        }
        return true;
      });
    }
  });

  const handleChangeTranslationContent = (locale, newTranslations, isManualChange) => {
    const newTranslationsObject = {
      ...translations,
      [locale]: {
        ...translations[locale],
        ...newTranslations,
        is_manual_translation: isManualChange ? true : false,
      },
    };
    setTranslations({ ...newTranslationsObject });
  };

  const goToNextStep = () => {
    const curStepIndex = steps.indexOf(steps.find((s) => s.key === curStep.key));
    setCurStep(getStep(curStepIndex + 1));
    setMessage("");
    //scroll to top when navigating to another step
    window.scrollTo(0, 0);
  };

  const goToPreviousStep = () => {
    const curStepIndex = steps.indexOf(steps.find((s) => s.key === curStep.key));
    setCurStep(getStep(curStepIndex - 1));
    setMessage("");
    //scroll to top when navigating to another step
    window.scrollTo(0, 0);
  };

  const submitProject = async (event) => {
    event.preventDefault();
    const payload = await formatProjectForRequest(project, sourceLanguage, translations);

    try {
      const resp = await apiRequest({
        method: "post",
        url: "/api/create_project/",
        payload: payload,
        token: token,
        locale: locale,
        shouldThrowError: true,
      });
      setProject({ ...project, url_slug: resp.data.url_slug });
      setFinished(true);
    } catch (error) {
      console.log(error);
      setProject({ ...project, error: true });
      console.log(error?.response?.data);
      if (error) console.log(error.response);
    }
  };

  const saveAsDraft = async (event) => {
    event.preventDefault();
    apiRequest({
      method: "post",
      url: "/api/create_project/",
      payload: await formatProjectForRequest(
        { ...project, is_draft: true },
        sourceLanguage,
        translations
      ),
      token: token,
      locale: locale,
    })
      .then(function (response) {
        setProject({ ...project, url_slug: response.data.url_slug, is_draft: true });
      })
      .catch(function (error) {
        console.log(error);
        setProject({ ...project, error: true });
        if (error) console.log(error.response);
      });
    setFinished(true);
  };

  const handleSetProject = (newProjectData) => {
    setProject({ ...project, ...newProjectData });
  };
  return (
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
              setMessage={setMessage}
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
              statusOptions={statusOptions}
            />
          )}
          {curStep.key === "addTeam" && (
            <AddTeam
              projectData={project}
              handleSetProjectData={handleSetProject}
              goToPreviousStep={goToPreviousStep}
              goToNextStep={goToNextStep}
              availabilityOptions={availabilityOptions}
              rolesOptions={rolesOptions}
              onSubmit={submitProject}
              saveAsDraft={saveAsDraft}
              isLastStep={steps[steps.length - 1].key === "addTeam"}
            />
          )}
          {curStep.key === "translate" && (
            <TranslateProject
              projectData={project}
              handleSetProjectData={handleSetProject}
              handleChangeTranslationContent={handleChangeTranslationContent}
              onSubmit={submitProject}
              saveAsDraft={saveAsDraft}
              goToPreviousStep={goToPreviousStep}
              availabilityOptions={availabilityOptions}
              rolesOptions={rolesOptions}
              translations={translations}
              sourceLanguage={sourceLanguage}
              targetLanguage={targetLanguage}
              changeTranslationLanguages={changeTranslationLanguages}
            />
          )}
        </>
      ) : (
        <>
          <ProjectSubmittedPage
            user={user}
            isDraft={project.is_draft}
            url_slug={project.url_slug}
            hasError={project.error}
          />
        </>
      )}
    </>
  );
}

//TODO: remove some of these default values as they are just for testing
const getDefaultProjectValues = (loggedInUser, statusOptions, userOrganizations) => {
  return {
    collaborators_welcome: true,
    status: statusOptions.find((s) => s.id === DEFAULT_STATUS),
    skills: [],
    helpful_connections: [],
    collaborating_organizations: [],
    loc: {},
    parent_organization: userOrganizations ? userOrganizations[0] : null,
    isPersonalProject: !(userOrganizations && userOrganizations.length > 0),
    is_organization_project: userOrganizations && userOrganizations.length > 0,
    //TODO: Should contain the logged in user as the creator and parent_user by default
    team_members: [{ ...loggedInUser }],
    website: "",
  };
};

const formatProjectForRequest = async (project, sourceLanguage, translations) => {
  return {
    ...project,
    status: project.status.id,
    skills: project.skills.map((s) => s.key),
    team_members: project.team_members.map((m) => ({
      url_slug: m.url_slug,
      role: m.role.id,
      availability: m.availability.id,
      id: m.id,
      role_in_project: m.role_in_project,
    })),
    project_tags: project?.project_tags?.map((s) => s.key),
    parent_organization: project?.parent_organization?.id,
    collaborating_organizations: project.collaborating_organizations.map((o) => o.id),
    image: await blobFromObjectUrl(project.image),
    thumbnail_image: await blobFromObjectUrl(project.thumbnail_image),
    source_language: sourceLanguage,
    translations: translations ? translations : {},
  };
};
