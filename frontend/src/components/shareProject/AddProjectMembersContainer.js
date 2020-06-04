import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Avatar, Typography, Button } from "@material-ui/core";
import SelectField from "../general/SelectField";
import roles from "./../../../public/data/roles.json";
import profile_info_metadata from "./../../../public/data/profile_info_metadata.json";
import { TextField, Tooltip } from "@material-ui/core";
import { IconButton } from "@material-ui/core";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";

const useStyles = makeStyles(theme => {
  return {
    memberContainer: {
      display: "flex"
    },
    member: {
      width: theme.spacing(40),
      textAlign: "center"
    },
    addMemberButtonContainer: {
      width: theme.spacing(40)
    },
    addMemberButton: {
      margin: "0 auto",
      marginLeft: theme.spacing(10),
      marginTop: theme.spacing(5)
    },
    name: {
      padding: theme.spacing(1),
      paddingBottom: 0
    },
    disableHover: {
      "&:hover": {
        textDecoration: "none"
      }
    },
    avatar: {
      height: theme.spacing(7),
      width: theme.spacing(7),
      margin: "0 auto",
      fontSize: 50
    },
    field: {
      width: theme.spacing(40),
      marginBottom: theme.spacing(1)
    },
    fieldLabel: {
      textAlign: "left",
      marginBottom: theme.spacing(0.5)
    },
    tooltip: {
      fontSize: 16
    }
  };
});

export default function AddProjectMembersContainer({ projectMembers, blockClassName }) {
  const classes = useStyles();
  console.log(projectMembers);

  return (
    <form className={blockClassName}>
      <div className={classes.memberContainer}>
        {projectMembers.map((m, index) => {
          console.log(m);
          return (
            <div className={classes.member} key={index}>
              <Avatar alt={m.name} size="large" src={m.image} className={classes.avatar} />
              <Typography variant="h6" className={classes.name} color="secondary">
                {m.name}
              </Typography>
              <Typography className={classes.fieldLabel} color="primary">
                Permissions
                <Tooltip title={"Choose what permissions the user has on the project."}>
                  <IconButton>
                    <HelpOutlineIcon className={classes.tooltip} />
                  </IconButton>
                </Tooltip>
              </Typography>
              <SelectField
                label="Pick user's permissions"
                size="small"
                className={classes.field}
                options={roles}
                defaultValue={m.permissions}
                disabled={m.permissions.key === "creator"}
                required
              />
              <Typography color="primary" className={classes.fieldLabel}>
                Role in project
                <Tooltip title={"Pick or describe what the user's role in the project is."}>
                  <IconButton>
                    <HelpOutlineIcon className={classes.tooltip} />
                  </IconButton>
                </Tooltip>
              </Typography>
              <TextField
                size="small"
                variant="outlined"
                className={classes.field}
                label="Pick or type user's role"
                required
              />
              <Typography className={classes.fieldLabel} color="primary">
                Hour contributed per week
                <Tooltip
                  title={
                    "Pick how many hours per week the user contributes to this project on average."
                  }
                >
                  <IconButton>
                    <HelpOutlineIcon className={classes.tooltip} />
                  </IconButton>
                </Tooltip>
              </Typography>
              <SelectField
                label="Hours"
                size="small"
                className={classes.field}
                options={profile_info_metadata.availability.options}
                required
              />
            </div>
          );
        })}
        <div className={classes.addMemberButtonContainer}>
          <Button
            color="primary"
            variant="contained"
            className={classes.addMemberButton}
            startIcon={<AddCircleOutlineIcon />}
          >
            Add Member
          </Button>
        </div>
      </div>
    </form>
  );
}
