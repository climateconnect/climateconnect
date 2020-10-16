import React from "react";
import { makeStyles, IconButton } from "@material-ui/core";
import AutoCompleteSearchBar from "../general/AutoCompleteSearchBar";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import MiniProfileInput from "../profile/MiniProfileInput";

const useStyles = makeStyles(theme => ({
  searchBarContainer: {
    marginTop: theme.spacing(4),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 100
  },
  searchBar: {
    width: 800,
    display: "flex"
  },
  block: {
    marginBottom: theme.spacing(4)
  },
  memberContainer: {
    display: "flex",
    flexWrap: "wrap",
    marginBottom: theme.spacing(2)
  },
  member: {
    width: theme.spacing(40),
    textAlign: "center",
    marginRight: theme.spacing(4),
    marginTop: theme.spacing(2)
  }
}));

export default function ManageMembers({
  currentMembers,
  rolesOptions,
  setCurrentMembers,
  availabilityOptions,
  user,
  canEdit,
  user_role,
  role_property_name,
  setUserRole,
  hideHoursPerWeek,
  isOrganization
}) {
  const classes = useStyles();
  const renderSearchOption = option => {
    return (
      <React.Fragment>
        <IconButton>
          <AddCircleOutlineIcon />
        </IconButton>
        {option.first_name + " " + option.last_name}
      </React.Fragment>
    );
  };

  const handleAddMember = member => {
    setCurrentMembers([
      ...currentMembers,
      {
        ...member,
        role: rolesOptions.find(r => r.name === "Member"),
        [role_property_name]: "",
        edited: true
      }
    ]);
  };

  const handleChangeMember = m => {
    if (m.changeCreator) {
      handleCreatorChange(m);
    } else {
      setCurrentMembers([
        ...currentMembers.map(c => {
          if (c.url_slug === m.url_slug) return m;
          else return c;
        })
      ]);
    }
  };

  const handleCreatorChange = m => {
    setUserRole(rolesOptions.find(r => r.name === "Administrator"));
    setCurrentMembers([
      ...currentMembers.map(c => {
        if (c.url_slug === m.url_slug) return { ...m, edited: true };
        else if (c.id === user.id)
          return { ...c, role: rolesOptions.find(r => r.name === "Administrator"), edited: true };
        else return c;
      })
    ]);
  };

  const handleRemoveMember = member => {
    setCurrentMembers([...currentMembers.filter(m => m.id !== member.id)]);
  };

  return (
    <div>
      <div className={classes.searchBarContainer}>
        <AutoCompleteSearchBar
          label="Search for your organization's members"
          className={`${classes.searchBar} ${classes.block}`}
          baseUrl={process.env.API_URL + "/api/members/?search="}
          clearOnSelect
          freeSolo
          filterOut={[...currentMembers]}
          onSelect={handleAddMember}
          renderOption={renderSearchOption}
          getOptionLabel={option => option.first_name + " " + option.last_name}
          helperText="Type the name of the team member you want to add next."
        />
      </div>
      <div className={classes.memberContainer}>
        {currentMembers &&
          currentMembers.length > 0 &&
          currentMembers.map((m, index) => {
            const creatorRole = rolesOptions.find(r => r.name === "Creator");
            const profile = m.id === user.id ? { ...m, role: user_role } : m;
            return (
              <MiniProfileInput
                key={index}
                className={classes.member}
                profile={profile}
                onDelete={
                  canEdit(m) && m.role.name !== "Creator" ? () => handleRemoveMember(m) : null
                }
                availabilityOptions={availabilityOptions}
                rolesOptions={
                  !canEdit(m) || m.id === user.id
                    ? rolesOptions
                    : rolesOptions.filter(r => r.role_type < user_role.role_type)
                }
                fullRolesOptions={rolesOptions}
                creatorRole={creatorRole}
                onChange={handleChangeMember}
                hideHoursPerWeek={hideHoursPerWeek}
                editDisabled={!canEdit(m)}
                isOrganization={isOrganization}
                allowAppointingCreator={m.id !== user.id && user_role.name === "Creator"}
              />
            );
          })}
      </div>
    </div>
  );
}
