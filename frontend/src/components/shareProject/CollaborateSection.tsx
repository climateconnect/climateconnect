import { Button, Chip, IconButton, List, Tooltip, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import EnterTextDialog from "../dialogs/EnterTextDialog";

const useStyles = makeStyles((theme) => {
  return {
    skill: {
      display: "flex",
      border: "1px solid black",
      height: theme.spacing(5),
      [theme.breakpoints.up("lg")]: {
        minWidth: 220,
      },
      maxWidth: "100%",
      marginRight: theme.spacing(1),
      background: "none",
      borderRadius: 0,
      fontSize: 16,
      marginBottom: theme.spacing(1),
    },
    flexContainer: {
      display: "flex",
      flexDirection: "row",
      padding: 0,
      marginBottom: theme.spacing(3),
      flexWrap: "wrap",
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
  collaborationTexts,
}) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale: locale });

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

  const onClickConnectionsDialogOpen = () => {
    handleSetOpen({ connectionsDialog: true });
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
