import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import EnterTextDialog from "../dialogs/EnterTextDialog";
import MultiLevelSelectDialog from "../dialogs/MultiLevelSelectDialog";
import { Typography, Tooltip, IconButton, List, Chip, Button } from "@material-ui/core";

const useStyles = makeStyles(theme => {
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
      fontSize: 16
    },
    flexContainer: {
      display: "flex",
      flexDirection: "row",
      padding: 0,
      marginBottom: theme.spacing(3)
    }
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
  collaborationTexts
}) {
  const classes = useStyles();
  const [selectedItems, setSelectedItems] = React.useState(
    projectData.skills ? [...projectData.skills] : []
  );
  const handleSkillDelete = skill => {
    handleSetProjectData({
      skills: projectData.skills
        .slice(0, projectData.skills.indexOf(skill))
        .concat(
          projectData.skills.slice(projectData.skills.indexOf(skill) + 1, projectData.skills.length)
        )
    });
    setSelectedItems(
      projectData.skills
        .slice(0, projectData.skills.indexOf(skill))
        .concat(
          projectData.skills.slice(projectData.skills.indexOf(skill) + 1, projectData.skills.length)
        )
    );
  };

  const handleConnectionDelete = connection => {
    handleSetProjectData({
      helpful_connections: projectData.helpful_connections
        .slice(0, projectData.helpful_connections.indexOf(connection))
        .concat(
          projectData.helpful_connections.slice(
            projectData.helpful_connections.indexOf(connection) + 1,
            projectData.helpful_connections.length
          )
        )
    });
  };

  const onClickSkillsDialogOpen = () => {
    handleSetOpen({ skillsDialog: true });
  };

  const onClickConnectionsDialogOpen = () => {
    handleSetOpen({ connectionsDialog: true });
  };

  const handleSkillsDialogClose = skills => {
    if (skills) handleSetProjectData({ skills: skills });
    handleSetOpen({ skillsDialog: false });
  };

  const handleConnectionsDialogClose = connection => {
    if (projectData.helpful_connections && projectData.helpful_connections.includes(connection))
      alert("You can not add the same connection twice.");
    else {
      if (connection)
        handleSetProjectData({
          helpful_connections: [...projectData.helpful_connections, connection]
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
          {collaborationTexts.skills[projectData.status.name]}
          <Tooltip title={helpTexts.addSkills} className={toolTipClassName}>
            <IconButton>
              <ToolTipIcon />
            </IconButton>
          </Tooltip>
        </Typography>
        <div>
          {projectData.skills && (
            <List className={classes.flexContainer}>
              {projectData.skills.map(skill => (
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
            {projectData.skills && projectData.skills.length ? "Edit skills" : "Add Skills"}
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
          {collaborationTexts.connections[projectData.status.name]}
          <Tooltip title={helpTexts.addConnections} className={toolTipClassName}>
            <IconButton>
              <ToolTipIcon />
            </IconButton>
          </Tooltip>
        </Typography>
        {projectData.helpful_connections && (
          <List className={classes.flexContainer}>
            {projectData.helpful_connections.map(connection => (
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
          Add Connections
        </Button>
      </div>
      <MultiLevelSelectDialog
        open={open.skillsDialog}
        onClose={handleSkillsDialogClose}
        type="skills"
        itemsToChooseFrom={skillsOptions}
        items={projectData.skills}
        selectedItems={selectedItems}
        setSelectedItems={setSelectedItems}
      />
      <EnterTextDialog
        open={open.connectionsDialog}
        onClose={handleConnectionsDialogClose}
        maxLength={25}
        applyText="Add"
        inputLabel="Connection"
        title="Add a helpful connection"
      />
    </>
  );
}
