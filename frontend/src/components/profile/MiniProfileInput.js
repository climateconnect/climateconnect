import React, { useEffect } from "react";
import { Avatar, Typography, Tooltip, IconButton, TextField, Button } from "@material-ui/core";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import SelectField from "../general/SelectField";
import { makeStyles } from "@material-ui/core/styles";
import DeleteIcon from "@material-ui/icons/Delete";
import ConfirmDialog from "../dialogs/ConfirmDialog";

const useStyles = makeStyles(theme => {
  return {
    name: {
      padding: theme.spacing(1),
      paddingBottom: 0
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
    },
    removeButton: {
      backgroundColor: theme.palette.error.main,
      color: "white",
      marginTop: theme.spacing(2),
      "&:hover": {
        backgroundColor: theme.palette.error.main
      }
    },
    dialogText: {
      textAlign: "center"
    }
  };
});

export default function MiniProfileInput({
  className,
  profile,
  onDelete,
  availabilityOptions,
  rolesOptions,
  onChange,
  hideHoursPerWeek,
  editDisabled,
  isOrganization,
  allowAppointingCreator,
  creatorRole,
  fullRolesOptions
}) {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);

  useEffect(() => {
    if (
      profile.role.id !== creatorRole.id &&
      options.filter(o => o.id === creatorRole.id).length > 0
    ) {
      setOptions(rolesOptions.map(r => ({ ...r, key: r.id })).filter(r => r.name !== "Creator"));
    }
  });

  const [options, setOptions] = React.useState(
    profile.role.id === creatorRole.id
      ? fullRolesOptions.map(r => ({ ...r, key: r.id }))
      : rolesOptions.map(r => ({ ...r, key: r.id })).filter(r => r.name !== "Creator")
  );

  const handleChangeRolePermissions = event => {
    onChange({ ...profile, role: rolesOptions.find(r => r.name === event.target.value) });
  };

  const handleChangeRoleInProject = event => {
    onChange({ ...profile, role_in_project: event.target.value });
  };

  const handleChangeRoleInOrganization = event => {
    onChange({ ...profile, role_in_organization: event.target.value });
  };
  const handleChangeAvailability = event => {
    onChange({
      ...profile,
      availability: availabilityOptions.find(a => a.name === event.target.value)
    });
  };
  const handleOpenConfirmCreatorDialog = () => {
    setOpen(true);
  };
  const handleConfirmTransferCreator = shouldBeTransfered => {
    setOpen(false);
    if (shouldBeTransfered) {
      setOptions(fullRolesOptions);
      onChange({
        ...profile,
        role: creatorRole,
        changeCreator: true
      });
    }
  };
  return (
    <div className={className}>
      <Avatar alt={profile.name} size="large" src={profile.image} className={classes.avatar} />
      <Typography variant="h6" className={classes.name} color="secondary">
        {profile.first_name + " " + profile.last_name}
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
        disabled={
          profile.edited && profile.role.id !== creatorRole.id
            ? false
            : editDisabled || profile.role.id === creatorRole.id
        }
        options={options}
        controlledValue={profile.role}
        controlled
        required
        onChange={handleChangeRolePermissions}
      />
      {allowAppointingCreator && (
        <Button onClick={handleOpenConfirmCreatorDialog}>Make this user the Creator</Button>
      )}
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
        onChange={isOrganization ? handleChangeRoleInOrganization : handleChangeRoleInProject}
        value={isOrganization ? profile.role_in_organization : profile.role_in_project}
        disabled={profile.added ? false : editDisabled}
      />
      {!hideHoursPerWeek && (
        <>
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
            options={availabilityOptions}
            onChange={handleChangeAvailability}
            defaultValue={profile.availability}
            required
          />
        </>
      )}
      {editDisabled && !profile.added && (
        <Typography color="secondary">You can not edit or remove this member</Typography>
      )}
      {onDelete && (
        <Button
          variant="contained"
          startIcon={<DeleteIcon />}
          className={classes.removeButton}
          onClick={onDelete}
        >
          Remove
        </Button>
      )}
      <ConfirmDialog
        open={open}
        onClose={handleConfirmTransferCreator}
        title='Do you really want to lose "Creator" permissions?'
        text={
          <Typography component="div" className={classes.dialogText}>
            There is always exactly one organization member with Creator priviliges.
            <br />
            The Creator can add, remove and edit Administrators.
            <br />
            <p>
              <Typography component="span" color="error">
                If you make {profile.name} the Creator you will lose your Creator permissions.
              </Typography>
            </p>
            Do you really want to do this?
          </Typography>
        }
        cancelText="No"
        confirmText="Yes"
      />
    </div>
  );
}
