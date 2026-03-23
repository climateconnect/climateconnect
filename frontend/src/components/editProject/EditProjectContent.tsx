import { Switch, TextField, Typography, useMediaQuery, Theme } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { RefObject, useContext, useState } from "react";
import getProjectTypeTexts from "../../../public/data/projectTypeTexts";
import ROLE_TYPES from "../../../public/data/role_types";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import ConfirmDialog from "../dialogs/ConfirmDialog";
import SelectField from "../general/SelectField";
import MiniProfilePreview from "../profile/MiniProfilePreview";
import ProjectDescriptionHelp from "../project/ProjectDescriptionHelp";
import DeleteProjectButton from "./DeleteProjectButton";
import { Project, Role } from "../../types";
import { EditProjectTypeSelector } from "./EditProjectTypeSelector";
import ProjectDateSection from "../shareProject/ProjectDateSection";

const useStyles = makeStyles<Theme>((theme) => ({
  select: {
    maxWidth: 250,
  },
  startDate: {
    marginRight: theme.spacing(4),
    [theme.breakpoints.down("md")]: {
      marginBottom: theme.spacing(2),
    },
  },
  creator: {
    display: "inline-block",
    marginLeft: theme.spacing(2),
  },
  inlineBlock: {
    marginBottom: theme.spacing(2),
    display: "inline-block",
  },
  block: {
    marginBottom: theme.spacing(2),
  },
  subHeader: {
    fontWeight: "bold",
    color: theme.palette.background.default_contrastText,
  },
  skill: {
    display: "flex",
    border: "1px solid black",
    height: theme.spacing(5),
    minWidth: 220,
    maxWidth: "100%",
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1),
    background: "none",
    borderRadius: 0,
    fontSize: 16,
  },
  flexContainer: {
    display: "flex",
    flexDirection: "row",
    padding: 0,
    flexWrap: "wrap",
    marginTop: theme.spacing(2),
  },
  spacer: {
    marginBottom: theme.spacing(1),
  },
  addButton: {
    marginTop: theme.spacing(2),
  },
  deleteBtn: {
    display: "block",
    float: "none",
    marginTop: theme.spacing(1),
  },
  buttonsContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  warning: {
    color: theme.palette.error.main,
  },
}));

type Args = {
  project: Project;
  handleSetProject: Function;
  userOrganizations: any;
  user_role: Role;
  deleteProject: Function;
  errors: any;
  contentRef?: RefObject<any>;
  projectTypeOptions?: any;
};

export default function EditProjectContent({
  project,
  handleSetProject,
  userOrganizations,
  user_role,
  deleteProject,
  errors,
  contentRef,
  projectTypeOptions,
}: Args) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale: locale, project: project });
  const projectTypeTexts = getProjectTypeTexts(texts);
  const typeId = project.project_type?.type_id ?? "project";
  const isNarrowScreen = useMediaQuery<Theme>((theme) => theme.breakpoints.down("sm"));
  const [open, setOpen] = useState({ delete: false });

  const handleChangeProject = (newValue, key) => {
    handleSetProject({ ...project, [key]: newValue });
  };

  /*
    This is a helper function just for <ProjectDateSection>
    It's a bit of a hack to be able to use the same code even though handleSetProject
    is implemented differently in EditProject and ShareProject
  */
  const handleSetProjectData = (newData) => {
    handleSetProject({
      ...project,
      ...newData,
    });
  };

  const handleClickDeleteProjectPopup = () => {
    setOpen({ ...open, delete: true });
  };

  const handleDeleteProjectDialogClose = (confirmed) => {
    if (confirmed) {
      deleteProject();
    }
    setOpen({ ...open, delete: false });
  };

  const handleSwitchChange = (event) => {
    if (
      event.target.checked &&
      !project?.project_parents?.parent_organization &&
      userOrganizations[0]
    )
      handleSetProject({
        ...project,
        project_parents: {
          ...project.project_parents,
          parent_organization: userOrganizations[0],
        },
        is_personal_project: !event.target.checked,
      });
    else handleChangeProject(!event.target.checked, "is_personal_project");
  };

  const handleChangeProjectType = (newProjectType) => {
    handleSetProject({
      ...project,
      project_type: newProjectType,
    });
  };

  return (
    <div ref={contentRef}>
      <div className={classes.block}>
        <div className={classes.block}>
          <Typography component="span">
            {isNarrowScreen ? texts.personal : projectTypeTexts.personal[typeId]}
          </Typography>
          <Switch
            checked={!project.is_personal_project}
            onChange={handleSwitchChange}
            name="checkedA"
            inputProps={{ "aria-label": "secondary checkbox" }}
            color="primary"
          />
          <Typography component="span">{projectTypeTexts.organizations[typeId]}</Typography>
        </div>
        {!isNarrowScreen && user_role.role_type === ROLE_TYPES.all_type && (
          <DeleteProjectButton
            project={project}
            handleClickDeleteProjectPopup={handleClickDeleteProjectPopup}
          />
        )}
        <div className={classes.block}>
          {project.is_personal_project ? (
            <>
              {texts.created_by}
              <MiniProfilePreview
                className={classes.creator}
                profile={project?.project_parents?.parent_user}
                size="small"
              />
            </>
          ) : (
            <SelectField
              controlled
              controlledValue={
                project?.project_parents?.parent_organization
                  ? project?.project_parents?.parent_organization
                  : userOrganizations[0]
              }
              onChange={(event) =>
                handleChangeProject(
                  {
                    ...project.project_parents,
                    parent_organization: userOrganizations.find(
                      (o) => o.name === event.target.value
                    ),
                  },
                  "project_parents"
                )
              }
              options={userOrganizations}
              label={texts.created_by}
              className={classes.select}
              required
            />
          )}
        </div>
        <div className={classes.block}>
          <EditProjectTypeSelector
            project={project}
            projectTypeOptions={projectTypeOptions}
            onChangeProjectType={handleChangeProjectType}
          />
        </div>
        <div className={classes.block}>
          <ProjectDateSection
            projectData={project}
            handleSetProjectData={handleSetProjectData}
            errors={errors}
          />
        </div>
        <div className={classes.block}>
          <ProjectDescriptionHelp typeId={project.project_type.type_id} />
          <div className={classes.spacer} />
          <TextField
            variant="outlined"
            fullWidth
            multiline
            rows={9}
            label={texts.project_description}
            onChange={(event) =>
              handleChangeProject(event.target.value.substring(0, 4000), "description")
            }
            helperText={texts.describe_your_project_in_detail_please_only_use_english}
            placeholder={texts.describe_your_project_in_more_detail}
            value={project.description ? project.description : ""}
          />
        </div>
        <div className={classes.block}>
          <Typography component="h2" variant="h6" color="primary" className={classes.subHeader}>
            {projectTypeTexts.allow[project.project_type.type_id]}
          </Typography>
          <Switch
            checked={project.collaborators_welcome}
            onChange={(event) => handleChangeProject(event.target.checked, "collaborators_welcome")}
            name="checkedA"
            inputProps={{ "aria-label": "secondary checkbox" }}
            color="primary"
          />
        </div>
        {project.collaborators_welcome && (
          <>
            {isNarrowScreen && user_role.role_type === ROLE_TYPES.all_type && (
              <div className={classes.block}>
                <Typography
                  component="h2"
                  variant="subtitle2"
                  color="primary"
                  className={`${classes.warning} ${classes.subHeader}`}
                >
                  {texts.do_you_want_to_delete_your_project}
                </Typography>
                <DeleteProjectButton
                  project={project}
                  handleClickDeleteProjectPopup={handleClickDeleteProjectPopup}
                  className={classes.deleteBtn}
                />
              </div>
            )}
          </>
        )}
      </div>
      <ConfirmDialog
        open={open.delete}
        onClose={handleDeleteProjectDialogClose}
        cancelText={texts.no}
        confirmText={texts.yes}
        title={texts.do_you_really_want_to_delete_your_project}
        text={texts.if_you_delete_your_project_it_will_be_lost}
      />
    </div>
  );
}
