import { Button, Chip, IconButton, List, Tooltip, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import EnterTextDialog from "../dialogs/EnterTextDialog";
import MultiLevelSelectDialog from "../dialogs/MultiLevelSelectDialog";

const useStyles = makeStyles((theme) => {
  return {
    skill: {
      display: "flex",
      border: "1px solid black",
      height: theme.spacing(5),
      minWidth: 220,
      maxWidth: "100%",
      marginRight: theme.spacing(1),
      background: "none",
      borderRadius: 0,
      fontSize: 16,
    },
    flexContainer: {
      display: "flex",
      flexDirection: "row",
      padding: 0,
      marginBottom: theme.spacing(3),
    },
  };
});

export default function CollaborateSection({
  projectData,
  handleSetProjectData,
  blockClassName,
  subHeaderClassName,
  toolTipClassName,
  helpTexts,
  ToolTipIcon,
  open,
  handleSetOpen,
  skillsOptions,
  collaborationTexts,
}) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale: locale });
  const [selectedItems, setSelectedItems] = React.useState(
    projectData.skills ? [...projectData.skills] : []
  );
  const handleSkillDelete = (skill) => {
    handleSetProjectData({
      skills: projectData.skills
        .slice(0, projectData.skills.indexOf(skill))
        .concat(
          projectData.skills.slice(projectData.skills.indexOf(skill) + 1, projectData.skills.length)
        ),
    });
    setSelectedItems(
      projectData.skills
        .slice(0, projectData.skills.indexOf(skill))
        .concat(
          projectData.skills.slice(projectData.skills.indexOf(skill) + 1, projectData.skills.length)
        )
    );
  };

  const handleConnectionDelete = (connection) => {
    handleSetProjectData({
      helpful_connections: projectData.helpful_connections
        .slice(0, projectData.helpful_connections.indexOf(connection))
        .concat(
          projectData.helpful_connections.slice(
            projectData.helpful_connections.indexOf(connection) + 1,
            projectData.helpful_connections.length
          )
        ),
    });
  };

  const onClickSkillsDialogOpen = () => {
    handleSetOpen({ skillsDialog: true });
  };

  const onClickConnectionsDialogOpen = () => {
    handleSetOpen({ connectionsDialog: true });
  };

  const handleSkillsDialogClose = (skills) => {
    if (skills) handleSetProjectData({ skills: skills });
    handleSetOpen({ skillsDialog: false });
  };

  const handleConnectionsDialogClose = (connection) => {
    if (projectData.helpful_connections && projectData.helpful_connections.includes(connection))
      alert(texts.you_can_not_add_the_same_connection_twice);
    else {
      if (connection)
        handleSetProjectData({
          helpful_connections: [...projectData.helpful_connections, connection],
        });
      handleSetOpen({ connectionsDialog: false });
    }
  };
  return (
    <>
      <div className={blockClassName}>
        <Typography
          component="h2"
          variant="subtitle2"
          color="primary"
          className={subHeaderClassName}
        >
          {collaborationTexts.skills[projectData.project_type.type_id]}
          <Tooltip title={helpTexts.addSkills} className={toolTipClassName}>
            <IconButton size="large">
              <ToolTipIcon />
            </IconButton>
          </Tooltip>
        </Typography>
        <div>
          {projectData.skills && (
            <List className={classes.flexContainer}>
              {projectData.skills.map((skill) => (
                <Chip
                  key={skill.key}
                  label={skill.name}
                  className={classes.skill}
                  onDelete={() => handleSkillDelete(skill)}
                />
              ))}
            </List>
          )}
          <Button variant="contained" color="primary" onClick={onClickSkillsDialogOpen}>
            {projectData.skills && projectData.skills.length ? texts.edit_skills : texts.add_skills}
          </Button>
        </div>
      </div>
      <div className={blockClassName}>
        <Typography
          component="h2"
          variant="subtitle2"
          color="primary"
          className={subHeaderClassName}
        >
          {collaborationTexts.connections[projectData.project_type.type_id]}
          <Tooltip title={helpTexts.addConnections} className={toolTipClassName}>
            <IconButton size="large">
              <ToolTipIcon />
            </IconButton>
          </Tooltip>
        </Typography>
        {projectData.helpful_connections && (
          <List className={classes.flexContainer}>
            {projectData.helpful_connections.map((connection) => (
              <Chip
                key={connection}
                label={connection}
                className={classes.skill}
                onDelete={() => handleConnectionDelete(connection)}
              />
            ))}
          </List>
        )}
        <Button variant="contained" color="primary" onClick={onClickConnectionsDialogOpen}>
          {texts.add_connections}
        </Button>
      </div>
      <MultiLevelSelectDialog
        open={open.skillsDialog}
        onClose={handleSkillsDialogClose}
        type="skills"
        options={skillsOptions}
        /* TODO(unused) items={projectData.skills} */
        selectedItems={selectedItems}
        setSelectedItems={setSelectedItems}
      />
      <EnterTextDialog
        open={open.connectionsDialog}
        onClose={handleConnectionsDialogClose}
        maxLength={25}
        applyText={texts.add}
        inputLabel={texts.connection}
        title={texts.add_a_helpful_connection}
      />
    </>
  );
}
