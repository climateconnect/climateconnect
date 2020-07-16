import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import SelectField from "../general/SelectField";
import DatePicker from "../general/DatePicker";
import { Switch, Typography, TextField } from "@material-ui/core";
import MiniProfilePreview from "../profile/MiniProfilePreview";
import ProjectDescriptionHelp from "../project/ProjectDescriptionHelp";
import collaborationTexts from "../../../public/data/collaborationTexts";

const useStyles = makeStyles(theme => ({
  select: {
    maxWidth: 250
  },
  startDate: {
    marginRight: theme.spacing(4)
  },
  creator: {
    display: "inline-block",
    marginLeft: theme.spacing(2)
  },
  inlineBlock: {
    marginBottom: theme.spacing(2),
    display: "inline-block"
  },
  block: {
    marginBottom: theme.spacing(2)
  }
}));

export default function EditProjectContent({
  project,
  handleSetProject,
  statusOptions,
  userOrganizations,
  skillsOptions
}) {
  const classes = useStyles();
  const statusesWithStartDate = statusOptions.filter(s => s.has_start_date).map(s => s.id);
  const statusesWithEndDate = statusOptions.filter(s => s.has_end_date).map(s => s.id);
  console.log(project);
  console.log(statusOptions);
  console.log(project.status);
  const handleChangeProject = (newValue, key) => {
    handleSetProject({ ...project, [key]: newValue });
  };
  return (
    <div>
      <div className={classes.block}>
        <div className={classes.block}>
          <Typography component="span">Personal Project</Typography>
          <Switch
            checked={!project.is_personal_project}
            onChange={event => handleChangeProject(!event.target.checked, "is_personal_project")}
            name="checkedA"
            inputProps={{ "aria-label": "secondary checkbox" }}
            color="primary"
          />
          <Typography component="span">{"Organization's project"}</Typography>
        </div>
        <div className={classes.block}>
          {project.is_personal_project ? (
            <>
              Created by
              <MiniProfilePreview
                className={classes.creator}
                profile={project.project_parents.parent_user}
                size="small"
              />
            </>
          ) : (
            <SelectField
              controlled
              controlledValue={project.project_parents.parent_organization}
              onChange={event =>
                handleChangeProject(
                  {
                    ...project.project_parents,
                    parent_organization: userOrganizations.find(
                      o => o.name === event.target.value
                    )
                  },
                  "project_parents"
                )
              }
              options={userOrganizations}
              label="Created by"
              className={classes.select}
              required
            />
          )}
        </div>
        <div className={classes.block}>
          <SelectField
            controlled
            controlledValue={project.status}
            onChange={event =>
              handleChangeProject(
                statusOptions.find(s => s.name === event.target.value),
                "status"
              )
            }
            options={statusOptions}
            label="Project status"
            className={classes.select}
            required
          />
        </div>
        <div className={classes.block}>
          {statusesWithStartDate.includes(project.status.id) && (
            <DatePicker
              className={classes.startDate}
              label="Start date"
              date={project.start_date}
              handleChange={newDate => handleChangeProject(newDate, "start_date")}
              required
            />
          )}
          {statusesWithEndDate.includes(project.status.id) && (
            <DatePicker
              className={classes.datePicker}
              label="End date"
              date={project.start_date}
              handleChange={newDate => handleChangeProject(newDate, "end_date")}
              required
              minDate={project.start_date && new Date(project.start_date)}
            />
          )}
        </div>
        <ProjectDescriptionHelp status={project.status} />            
        <TextField
          variant="outlined"
          fullWidth
          multiline
          rows={9}
          label="Project description"
          onChange={event => handleChangeProject(event.target.value.substring(0, 4000), "description")}
          helperText={"Describe your project in detail. Please only use English!"}
          placeholder={`Describe your project in more detail.\n\n-What are you trying to achieve?\n-How are you trying to achieve it\n-What were the biggest challenges?\n-What insights have you gained during the implementation?`}
          value={project.description}
        />
        <Typography
          component="h2"
          variant="subtitle2"
          color="primary"
          className={classes.subHeader}
        >
          {collaborationTexts.allow[project.status.name]}
        </Typography>
        <Switch
          checked={project.collaborators_welcome}
          onChange={event => handleChangeProject(event.target.checked, "collaborators_welcome")}
          name="checkedA"
          inputProps={{ "aria-label": "secondary checkbox" }}
          color="primary"
        />
      </div>
    </div>
  );
}
