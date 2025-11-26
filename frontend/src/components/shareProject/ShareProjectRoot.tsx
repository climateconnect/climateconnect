import { Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import Router from "next/router";
import React, { useContext, useEffect, useState } from "react";
import ROLE_TYPES from "../../../public/data/role_types";
import { apiRequest } from "../../../public/lib/apiOperations";
import { blobFromObjectUrl } from "../../../public/lib/imageOperations";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import GenericDialog from "../dialogs/GenericDialog";
import TranslateTexts from "../general/TranslateTexts";
import StepsTracker from "./../general/StepsTracker";
import AddTeam from "./AddTeam";
import EnterDetails from "./EnterDetails";
import ProjectSubmittedPage from "./ProjectSubmittedPage";
import ShareProject from "./ShareProject";
import { Project, SkillType, Role, Organization, Sector } from "../../types";
import { parseLocation } from "../../../public/lib/locationOperations";
import SelectSectors from "./SelectSectors";

const useStyles = makeStyles((theme) => {
  return {
    stepsTracker: {
      maxWidth: 600,
      margin: "0 auto",
    },
    headline: {
      textAlign: "center",
      marginTop: theme.spacing(4),
      color: theme.palette.background.default_contrastText,
    },
  };
});

const getSteps = (texts) => {
  const steps = [
    {
      key: "share",
      text: texts.basic_info,
      headline: texts.share_your_climate_project,
    },
    {
      key: "selectSector",
      text: texts.project_category,
      headline: texts.select_1_to_3_sectors_that_fit_your_project,
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
  /*if (sourceLocale === "de") {
    steps.push({
      key: "translate",
      text: texts.languages,
      headline: texts.translate,
      sourceLocale: ["de"],
    })
  }*/
  return steps;
};

type availabilityOptionsProps = {
  id: number;
  key: string;
  name: string;
};

type ShareProjectRootProps = {
  availabilityOptions: availabilityOptionsProps[];
  userOrganizations: Organization[];
  skillsOptions: SkillType[];
  rolesOptions: Role[];
  user: any;
  token: string;
  setMessage: (message: string) => void;
  projectTypeOptions: any[];
  hubName?: string;
  sectorOptions: Sector[];
};

export default function ShareProjectRoot({
  availabilityOptions,
  userOrganizations,
  skillsOptions,
  rolesOptions,
  user,
  token,
  setMessage,
  projectTypeOptions,
  hubName,
  sectorOptions,
}: ShareProjectRootProps) {
  const classes = useStyles();
  const { locale, locales } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale: locale });
  const steps = getSteps(texts);

  const [project, setProject] = React.useState(
    getDefaultProjectValues(
      {
        ...user,
        role: rolesOptions.find((r) => r.role_type === ROLE_TYPES.all_type),
        role_in_project: "",
      },
      projectTypeOptions,
      userOrganizations,
      locale,
      hubName
    )
  );
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [loadingSubmitDraft, setLoadingSubmitDraft] = useState(false);

  const getStep = (stepNumber) => {
    if (stepNumber >= steps.length) return steps[steps.length - 1];
    return steps[stepNumber];
  };

  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const targetLanguage = locales.find((l) => l !== locale);
  const [translations, setTranslations] = React.useState({});
  const [curStep, setCurStep] = React.useState(getStep(0));
  const [finished, setFinished] = React.useState(false);

  // TODO: Allow changing sourceLanguage, targetLanguage

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
    const curStepIndex = steps.indexOf(steps.find((s) => s.key === curStep.key)!);
    setCurStep(getStep(curStepIndex + 1));
    setMessage("");
    //scroll to top when navigating to another step
    window.scrollTo(0, 0);
  };

  const goToPreviousStep = () => {
    const curStepIndex = steps.indexOf(steps.find((s) => s.key === curStep.key)!);
    setCurStep(getStep(curStepIndex - 1));
    setMessage("");
    //scroll to top when navigating to another step
    window.scrollTo(0, 0);
  };

  // TODO: save as draft and submit project share a lot of logic. I could be refactored
  const submitProject = async (event) => {
    event.preventDefault();
    setLoadingSubmit(true);
    const payload = await formatProjectForRequest(project, translations);
    payload.sectors = project.sectors?.map((sector) => sector.key);

    try {
      const resp = await apiRequest({
        method: "post",
        url: "/api/create_project/",
        payload: payload,
        token: token,
        locale: locale,
      });
      setProject({ ...project, error: false, url_slug: resp.data.url_slug });
      setLoadingSubmit(false);
      setFinished(true);
    } catch (error: any) {
      console.log(error?.response?.data);
      if (error?.response?.data?.message) {
        const errorMessage = error.response.data.message;
        setErrorMessage(`Error ${error?.response?.status}: ${errorMessage}`);
      }
      setErrorDialogOpen(true);
      setProject({ ...project, error: true });
      setLoadingSubmit(false);
    }
  };
  const saveAsDraft = async (event) => {
    event.preventDefault();
    setLoadingSubmitDraft(true);
    apiRequest({
      method: "post",
      url: "/api/create_project/",
      payload: await formatProjectForRequest({ ...project, is_draft: true }, translations),
      token: token,
      locale: locale,
    })
      .then(function (response) {
        setProject({ ...project, url_slug: response.data.url_slug, is_draft: true });
        setLoadingSubmitDraft(false);
        setFinished(true);
      })
      .catch(function (error) {
        console.log(error);
        setErrorDialogOpen(true);
        setProject({ ...project, error: true });
        setLoadingSubmitDraft(false);
        if (error) console.log(error.response);
      });
  };

  const handleSetProject = (newProjectData) => {
    setProject({ ...project, ...newProjectData });
  };

  const handleCloseErrorDialog = () => {
    setErrorMessage("");
    setErrorDialogOpen(false);
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
      headlineTextKey: "short_description",
      maxCharacters: 280,
      showCharacterCounter: true,
    },
    {
      textKey: "description",
      rows: 15,
      headlineTextKey: "description",
    },
    {
      textKey: "helpful_connections",
      rows: 1,
      headlineTextKey: "helpful_connections",
      isArray: true,
    },
  ];

  const onSelectNewSector = (event) => {
    event.preventDefault();
    const sector = sectorOptions.find((sector) => sector.name === event.target.value);
    if (
      sector &&
      project?.sectors &&
      project.sectors.filter((h) => h.name === sector.name)?.length === 0
    ) {
      setProject({
        ...project,
        sectors: [...project.sectors, sector],
      });
    }
  };

  const onClickRemoveSector = (sector) => {
    const sectorsAfterRemoval = project?.sectors?.filter((h) => h.name !== sector.name);
    setProject({
      ...project,
      sectors: sectorsAfterRemoval,
    });
  };

  return (
    <>
      {!finished ? (
        <>
          <StepsTracker
            grayBackground={true}
            /*TODO(undefined) className={classes.stepsTracker} */
            steps={steps}
            activeStep={curStep.key}
          />
          <Typography variant="h4" className={classes.headline}>
            {curStep.headline && curStep.headline}
          </Typography>
          {curStep.key === "share" && (
            <ShareProject
              project={project}
              handleSetProjectData={handleSetProject}
              userOrganizations={userOrganizations}
              projectTypeOptions={projectTypeOptions}
              goToNextStep={goToNextStep}
              hubName={hubName}
            />
          )}
          {curStep.key === "selectSector" && (
            <SelectSectors
              project={project}
              goToNextStep={goToNextStep}
              goToPreviousStep={goToPreviousStep}
              sectorsToSelectFrom={sectorOptions.filter(
                (sector) =>
                  project?.sectors?.filter((addedSector) => addedSector.name === sector.name)
                    .length === 0
              )}
              onSelectNewSector={onSelectNewSector}
              onClickRemoveSector={onClickRemoveSector}
            />
          )}
          {curStep.key === "enterDetails" && (
            <EnterDetails
              projectData={project}
              handleSetProjectData={handleSetProject}
              goToNextStep={goToNextStep}
              goToPreviousStep={goToPreviousStep}
              skillsOptions={skillsOptions}
              setMessage={setMessage}
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
              loadingSubmit={loadingSubmit}
              loadingSubmitDraft={loadingSubmitDraft}
            />
          )}
          {curStep.key === "translate" && (
            <TranslateTexts
              data={project}
              handleSetData={handleSetProject}
              onSubmit={submitProject}
              goToPreviousStep={goToPreviousStep}
              handleChangeTranslationContent={handleChangeTranslationContent}
              translations={translations}
              targetLanguage={targetLanguage}
              pageName="project"
              textsToTranslate={textsToTranslate}
              arrayTranslationKeys={["helpful_connections"]}
              introTextKey="translate_project_intro"
              submitButtonText={texts.submit}
              saveAsDraft={saveAsDraft}
              loadingSubmit={loadingSubmit}
              loadingSubmitDraft={loadingSubmitDraft}
            />
          )}
        </>
      ) : (
        <>
          <ProjectSubmittedPage
            user={user}
            isDraft={project.is_draft}
            url_slug={project.url_slug}
            hubName={hubName}
            hasError={project.error}
          />
        </>
      )}
      {project.error && (
        <GenericDialog
          open={errorDialogOpen}
          onClose={handleCloseErrorDialog}
          title={texts.internal_server_error}
        >
          <Typography>
            {errorMessage ? errorMessage : texts.error_when_publishing_project}
          </Typography>
        </GenericDialog>
      )}
    </>
  );
}

//TODO: remove some of these default values as they are just for testing
const getDefaultProjectValues = (
  loggedInUser,
  projectTypeOptions,
  userOrganizations,
  locale,
  hubName
): Project => {
  return {
    collaborators_welcome: true,
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
    language: locale,
    project_type: projectTypeOptions.find((t) => t.type_id === "project"),
    hubName: hubName,
    sectors: [],
  };
};

const formatProjectForRequest = async (project, translations) => {
  return {
    ...project,
    loc: parseLocation(project.loc, true),
    skills: project.skills.map((s) => s.key),
    team_members: project.team_members.map((m) => ({
      url_slug: m.url_slug,
      role: m.role.id,
      availability: m.availability?.id,
      id: m.id,
      role_in_project: m.role_in_project,
    })),
    project_tags: project?.project_tags?.map((s) => s.key),
    parent_organization: project?.parent_organization?.id,
    collaborating_organizations: project.collaborating_organizations.map((o) => o.id),
    image: await blobFromObjectUrl(project.image),
    thumbnail_image: await blobFromObjectUrl(project.thumbnail_image),
    source_language: project.language,
    translations: translations ? translations : {},
  };
};
