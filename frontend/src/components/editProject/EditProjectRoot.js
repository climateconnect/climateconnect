import { Container, Divider, Typography, useMediaQuery } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Router from "next/router";
import React, { useContext, useRef, useState } from "react";

import { apiRequest } from "../../../public/lib/apiOperations";
import { blobFromObjectUrl } from "../../../public/lib/imageOperations";
import { indicateWrongLocation, isLocationValid } from "../../../public/lib/locationOperations";
import {
  getTranslationsFromObject,
  getTranslationsWithoutRedundantKeys,
} from "../../../public/lib/translationOperations";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import BottomNavigation from "../general/BottomNavigation";
import TranslateTexts from "../general/TranslateTexts";
import EditProjectContent from "./EditProjectContent";
import EditProjectOverview from "./EditProjectOverview";

const useStyles = makeStyles((theme) => {
  return {
    divider: {
      marginBottom: theme.spacing(2),
    },
    bottomNavigation: {
      marginTop: theme.spacing(3),
      minHeight: theme.spacing(2),
    },
    headline: {
      textAlign: "center",
      marginTop: theme.spacing(4),
    },
  };
});

export default function EditProjectRoot({
  project,
  skillsOptions,
  userOrganizations,
  statusOptions,
  handleSetProject,
  tagsOptions,
  token,
  oldProject,
  user,
  user_role,
  handleSetErrorMessage,
  initialTranslations,
}) {
  const classes = useStyles();
  const { locale, locales } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale: locale });
  const isNarrowScreen = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const [locationOptionsOpen, setLocationOptionsOpen] = React.useState(false);
  const draftReqiredProperties = {
    name: texts.project_name,
    loc: texts.location,
  };
  const overviewInputsRef = useRef(null);
  const locationInputRef = useRef(null);
  const STEPS = ["edit_project", "check_translations"];

  const [step, setStep] = useState(STEPS[0]);
  const [translations, setTranslations] = useState(
    initialTranslations ? getTranslationsFromObject(initialTranslations, "project") : {}
  );

  const sourceLanguage = project.language ? project.language : locale;
  const targetLanguage = locales.find((l) => l !== sourceLanguage);

  // TODO: Allow changing sourceLanguage, targetLanguage

  const handleSetLocationOptionsOpen = (bool) => {
    setLocationOptionsOpen(bool);
  };

  const checkIfProjectValid = (isDraft) => {
    if (project?.loc && oldProject?.loc !== project.loc && !isLocationValid(project.loc)) {
      overviewInputsRef.current.scrollIntoView();
      indicateWrongLocation(locationInputRef, setLocationOptionsOpen, handleSetErrorMessage, texts);
      return false;
    }
    if (isDraft && Object.keys(draftReqiredProperties).filter((key) => !project[key]).length > 0) {
      Object.keys(draftReqiredProperties).map((key) => {
        if (!project[key]) {
          alert(
            texts.your_project_draft_is_missing_the_following_reqired_property +
              " " +
              draftReqiredProperties[key]
          );
          return false;
        }
      });
    }
    return true;
  };

  const onSaveDraft = async () => {
    const valid = checkIfProjectValid(true);
    //short circuit if there is problems with the project
    if (!valid) {
      return false;
    }
    const translationChanges = getTranslationsWithoutRedundantKeys(
      getTranslationsFromObject(initialTranslations, "project"),
      translations
    );
    apiRequest({
      method: "patch",
      url: "/api/projects/" + project.url_slug + "/",
      payload: await parseProjectForRequest(
        getProjectWithoutRedundancies(project, oldProject),
        translationChanges
      ),
      token: token,
      locale: locale,
    })
      .then(function () {
        Router.push({
          pathname: "/profiles/" + user.url_slug,
          query: {
            message: texts.you_have_successfully_edited_your_project,
          },
        });
      })
      .catch(function (error) {
        console.log(error);
        if (error) console.log(error.response);
      });
  };

  const onCheckTranslations = (e) => {
    e.preventDefault();
    setStep(STEPS[1]);
  };

  const additionalButtons = [
    {
      text: texts.check_translations,
      argument: "save",
      onClick: onCheckTranslations,
    },
  ];

  if (project.is_draft) {
    additionalButtons.push({
      text: texts.save_changes_as_draft,
      argument: "save",
      onClick: onSaveDraft,
    });
  }

  const handleCancel = () => {
    Router.push("/projects/" + project.url_slug + "/");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const valid = checkIfProjectValid(false);
    //short circuit if there is problems with the project
    if (!valid) {
      return false;
    }
    const projectToSubmit = project;
    let was_draft = false;
    if (project.is_draft) {
      projectToSubmit.is_draft = false;
      was_draft = true;
    }
    const translationChanges = getTranslationsWithoutRedundantKeys(
      getTranslationsFromObject(initialTranslations, "project"),
      translations
    );
    apiRequest({
      method: "patch",
      url: "/api/projects/" + project.url_slug + "/",
      payload: await parseProjectForRequest(
        getProjectWithoutRedundancies(project, oldProject),
        translationChanges
      ),
      token: token,
      locale: locale,
    })
      .then(function (response) {
        Router.push({
          pathname: "/projects/" + response.data.url_slug,
          query: {
            message: was_draft
              ? texts.your_project_has_been_published_great_work
              : texts.you_have_successfully_edited_your_project,
          },
        });
      })
      .catch(function (error) {
        console.log(error);
        if (error) console.log(error.response);
      });
  };

  const deleteProject = () => {
    apiRequest({
      method: "delete",
      url: "/api/projects/" + project.url_slug + "/",
      token: token,
      locale: locale,
    })
      .then(function () {
        Router.push({
          pathname: "/profiles/" + user.url_slug,
          query: {
            message: texts.you_have_successfully_deleted_your_project,
          },
        });
      })
      .catch(function (error) {
        console.log(error);
        if (error) console.log(error.response);
      });
  };

  const handleTranslationsSubmit = async (e) => {
    await handleSubmit(e);
  };

  const handleTranslationsDraftSubmit = async () => {
    await onSaveDraft();
  };

  const goToPreviousStep = () => {
    setStep(STEPS[STEPS.indexOf(step) - 1]);
  };

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

  const handleSetProjectData = (newProjectData) => {
    handleSetProject({ ...project, ...newProjectData });
  };

  const textsToTranslate = [
    {
      textKey: "name",
      rows: 1,
      headlineTextKey: "project_name",
    },
    {
      textKey: "short_description",
      rows: 5,
      headlineTextKey: "summary",
    },
    {
      textKey: "description",
      rows: 15,
      headlineTextKey: "project_description",
    },
    {
      textKey: "helpful_connections",
      rows: 1,
      headlineTextKey: "helpful_connections",
      isArray: true,
    },
  ];

  return (
    <Container>
      {step === "edit_project" ? (
        <form onSubmit={handleSubmit}>
          <EditProjectOverview
            tagsOptions={tagsOptions}
            project={project}
            smallScreen={isNarrowScreen}
            handleSetProject={handleSetProject}
            overviewInputsRef={overviewInputsRef}
            locationOptionsOpen={locationOptionsOpen}
            handleSetLocationOptionsOpen={handleSetLocationOptionsOpen}
            locationInputRef={locationInputRef}
          />
          <EditProjectContent
            project={project}
            handleSetProject={handleSetProject}
            statusOptions={statusOptions}
            userOrganizations={userOrganizations}
            skillsOptions={skillsOptions}
            user_role={user_role}
            deleteProject={deleteProject}
          />
          <Divider className={classes.divider} />
          <BottomNavigation
            onClickCancel={handleCancel}
            additionalButtons={additionalButtons}
            nextStepButtonType={project.is_draft ? "publish" : "save"}
            className={classes.bottomNavigation}
          />
        </form>
      ) : (
        <>
          <Typography color="primary" className={classes.headline} component="h1" variant="h4">
            {texts.translate}
          </Typography>
          <TranslateTexts
            data={project}
            handleSetData={handleSetProjectData}
            onSubmit={handleTranslationsSubmit}
            saveAsDraft={project.is_draft && handleTranslationsDraftSubmit}
            goToPreviousStep={goToPreviousStep}
            translations={translations}
            handleChangeTranslationContent={handleChangeTranslationContent}
            targetLanguage={targetLanguage}
            textsToTranslate={textsToTranslate}
            pageName="project"
            introTextKey="translate_project_intro"
          />
        </>
      )}
    </Container>
  );
}

const getProjectWithoutRedundancies = (newProject, oldProject) => {
  return Object.keys(newProject).reduce((obj, key) => {
    if (newProject[key] !== oldProject[key]) {
      obj[key] = newProject[key];
    }
    return obj;
  }, {});
};

const parseProjectForRequest = async (project, translationChanges) => {
  const ret = {
    ...project,
    translations: translationChanges,
  };
  if (project.image) ret.image = await blobFromObjectUrl(project.image);
  if (project.thumbnail_image)
    ret.thumbnail_image = await blobFromObjectUrl(project.thumbnail_image);
  if (project.skills) ret.skills = project.skills.map((s) => s.id);
  if (project.tags) ret.project_tags = project.tags.map((t) => t.id);
  if (project.status) ret.status = project.status.id;
  if (project.project_parents && project.project_parents.parent_organization)
    ret.parent_organization = project.project_parents.parent_organization.id;
  return ret;
};
