import {
  Button,
  Chip,
  List,
  Switch,
  TextField,
  Typography,
  useMediaQuery,
  Theme,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { Ref, useContext, useState } from "react";
import getCollaborationTexts from "../../../public/data/collaborationTexts";
import ROLE_TYPES from "../../../public/data/role_types";
import { getProjectTypeDateOptions } from "../../../public/data/projectTypeOptions";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import ConfirmDialog from "../dialogs/ConfirmDialog";
import EnterTextDialog from "../dialogs/EnterTextDialog";
import MultiLevelSelectDialog from "../dialogs/MultiLevelSelectDialog";
import DatePicker from "../general/DatePicker";
import SelectField from "../general/SelectField";
import MiniProfilePreview from "../profile/MiniProfilePreview";
import ProjectDescriptionHelp from "../project/ProjectDescriptionHelp";
import DeleteProjectButton from "./DeleteProjectButton";
import dayjs from "dayjs";
import { Project, Role } from "../../types";
import { EditProjectTypeSelector } from "./EditProjectTypeSelector";

const useStyles = makeStyles((theme) => ({
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
    marginTop: theme.spacing(2)
  }
}));

type Args = {
  project: Project;
  handleSetProject: Function;
  userOrganizations: any;
  skillsOptions: any;
  user_role: Role;
  deleteProject: Function;
  errors: any;
  contentRef?: React.RefObject<any>;
  projectTypeOptions?: any;
};

export default function EditProjectContent({
  project,
  handleSetProject,
  userOrganizations,
  skillsOptions,
  user_role,
  deleteProject,
  errors,
  contentRef,
  projectTypeOptions,
}: Args) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale: locale, project: project });
  const collaborationTexts = getCollaborationTexts(texts);
  const [selectedItems, setSelectedItems] = useState(project.skills ? [...project.skills] : []);
  const isNarrowScreen = useMediaQuery<Theme>((theme) => theme.breakpoints.down("sm"));
  const [open, setOpen] = useState({ skills: false, connections: false, delete: false });
  const PROJECT_TYPE_DATE_OPTIONS = getProjectTypeDateOptions(texts);

  const handleChangeProject = (newValue, key) => {
    handleSetProject({ ...project, [key]: newValue });
  };

  const onClickSkillsDialogOpen = () => {
    setOpen({ ...open, skills: true });
  };

  const handleSkillsDialogClose = () => {
    setOpen({ ...open, skills: false });
  };

  const handleSkillDelete = (skill) => {
    handleSetProject({
      ...project,
      skills: project.skills.filter((s) => s.id !== skill.id),
    });
    setSelectedItems(project.skills.filter((s) => s.id !== skill.id));
  };

  const handleSkillsDialogSave = (skills) => {
    if (skills) handleSetProject({ ...project, skills: skills });
    setOpen({ ...open, skills: false });
  };

  const onClickConnectionsDialogOpen = () => {
    setOpen({ ...open, connections: true });
  };

  const handleConnectionDelete = (connection) => {
    handleSetProject({
      ...project,
      helpful_connections: project.helpful_connections.filter((c) => c != connection),
    });
  };

  const handleConnectionsDialogClose = (connection) => {
    if (project.helpful_connections && project.helpful_connections.includes(connection))
      alert(texts.you_can_not_add_the_same_connection_twice);
    else {
      if (connection)
        handleSetProject({
          ...project,
          helpful_connections: [...project.helpful_connections, connection],
        });
      setOpen({ ...open, connections: false });
    }
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
      !project.project_parents.parent_organization &&
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
            {isNarrowScreen ? texts.personal : texts.personal_project}
          </Typography>
          <Switch
            checked={!project.is_personal_project}
            onChange={handleSwitchChange}
            name="checkedA"
            inputProps={{ "aria-label": "secondary checkbox" }}
            color="primary"
          />
          <Typography component="span">{texts.organizations_project}</Typography>
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
                profile={project.project_parents.parent_user}
                size="small"
              />
            </>
          ) : (
            <SelectField
              controlled
              controlledValue={
                project.project_parents.parent_organization
                  ? project.project_parents.parent_organization
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
          {PROJECT_TYPE_DATE_OPTIONS[project.project_type.type_id].enableStartDate && (
            <DatePicker
              className={classes.startDate}
              label={texts.start_date}
              enableTime={PROJECT_TYPE_DATE_OPTIONS[project.project_type.type_id].enableTime}
              date={dayjs(project.start_date)}
              handleChange={(newDate) => handleChangeProject(newDate, "start_date")}
              error={errors.start_date}
            />
          )}
          {PROJECT_TYPE_DATE_OPTIONS[project.project_type.type_id].enableEndDate && (
            <DatePicker
              label={texts.end_date}
              date={dayjs(project.end_date)}
              enableTime={PROJECT_TYPE_DATE_OPTIONS[project.project_type.type_id].enableTime}
              handleChange={(newDate) => handleChangeProject(newDate, "end_date")}
              minDate={project.start_date && dayjs(project.start_date)}
              error={errors.end_date}
            />
          )}
        </div>
        <div className={classes.block}>
          <ProjectDescriptionHelp project_type={project.project_type} />
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
            {collaborationTexts.allow[project.project_type.type_id]}
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
            <div className={classes.block}>
              <Typography
                component="h2"
                variant="subtitle2"
                color="primary"
                className={classes.subHeader}
              >
                {collaborationTexts.skills[project.project_type.type_id]}
              </Typography>
              <div>
                {project.skills?.length > 0 && (
                  <List className={classes.flexContainer}>
                    {project.skills.map((skill) => (
                      <Chip
                        key={skill.id}
                        label={skill.name}
                        className={classes.skill}
                        onDelete={() => handleSkillDelete(skill)}
                      />
                    ))}
                  </List>
                )}
                <Button variant="contained" color="primary" onClick={onClickSkillsDialogOpen} className={classes.addButton}>
                  {project.skills && project.skills.length ? texts.edit_skills : texts.add_skills}
                </Button>
              </div>
            </div>
            <div className={classes.block}>
              <Typography
                component="h2"
                variant="subtitle2"
                color="primary"
                className={classes.subHeader}
              >
                {collaborationTexts.connections[project.project_type.type_id]}
              </Typography>
              {project.helpful_connections?.length > 0 && (
                <List className={classes.flexContainer}>
                  {project.helpful_connections.map((connection) => (
                    <Chip
                      key={connection}
                      label={connection}
                      className={classes.skill}
                      onDelete={() => handleConnectionDelete(connection)}
                    />
                  ))}
                </List>
              )}
              <Button variant="contained" color="primary" onClick={onClickConnectionsDialogOpen} className={classes.addButton}>
                {texts.add_connections}
              </Button>
            </div>
          </>
        )}
      </div>
      <MultiLevelSelectDialog
        open={open.skills}
        onClose={handleSkillsDialogClose}
        onSave={handleSkillsDialogSave}
        type="skills"
        options={skillsOptions}
        items={project.skills}
        selectedItems={selectedItems}
        setSelectedItems={setSelectedItems}
      />
      <EnterTextDialog
        open={open.connections}
        onClose={handleConnectionsDialogClose}
        maxLength={25}
        applyText={texts.add}
        inputLabel={texts.connection}
        title={texts.add_a_helpful_connection}
      />
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
