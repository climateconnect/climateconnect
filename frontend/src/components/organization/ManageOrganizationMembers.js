import React from "react";
import { IconButton, Typography, Button } from "@material-ui/core";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import MiniProfileInput from "../profile/MiniProfileInput";
import AutoCompleteSearchBar from "../general/AutoCompleteSearchBar";
import { makeStyles } from "@material-ui/core/styles";
import axios from "axios";
import tokenConfig from "../../../public/config/tokenConfig";
import Router from "next/router";

const useStyles = makeStyles(theme => {
  return {
    memberContainer: {
      display: "flex",
      flexWrap: "wrap",
      marginBottom: theme.spacing(2)
    },
    headline: {
      textAlign: "center",
      marginTop: theme.spacing(4)
    },
    member: {
      width: theme.spacing(40),
      textAlign: "center",
      marginRight: theme.spacing(4),
      marginTop: theme.spacing(2)
    },
    buttons: {
      float: "right"
    },
    button: {
      marginRight: theme.spacing(2)
    },
    buttonsContainer: {
      height: 40,
      width: "100%"
    },
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
    }
  };
});

export default function ManageOrganizationMembers({
  user,
  members,
  currentMembers,
  setCurrentMembers,
  rolesOptions,
  organization,
  token,
  availabilityOptions
}) {
  const classes = useStyles();
  const [user_role, setUserRole] = React.useState(members.find(m => m.id === user.id).role);
  if (!user_role) setUserRole(members.find(m => m.id === user.id).role);

  const handleChangeMember = m => {
    if (m.role.name === "Creator" && user_role.name === "Creator") {
      //We have a creator change! This will trigger a different type of request
      setUserRole(rolesOptions.find(r => r.name === "Administrator"));
      setCurrentMembers([
        ...currentMembers.map(c => {
          if (c.url_slug === m.url_slug) return { ...m, edited: true };
          else if (c.id === user.id)
            return { ...c, role: rolesOptions.find(r => r.name === "Administrator"), edited: true };
          else return c;
        })
      ]);
    } else
      setCurrentMembers([
        ...currentMembers.map(c => {
          if (c.url_slug === m.url_slug) return m;
          else return c;
        })
      ]);
  };
  const handleRemoveMember = member => {
    setCurrentMembers([...currentMembers.filter(m => m.id !== member.id)]);
  };

  const handleAddMember = member => {
    setCurrentMembers([
      ...currentMembers,
      {
        ...member,
        role: rolesOptions.find(r => r.name === "Member"),
        role_in_organization: "",
        edited: true
      }
    ]);
  };

  const canEdit = member => {
    return member.id === user.id || user_role.role_type > member.role.role_type;
  };

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

  const handleSubmit = () => {
    event.preventDefault();
    onSubmit().then(() => {
      console.log("done!");
      Router.push({
        pathname: "/organizations/" + organization.url_slug,
        query: {
          message: "You have successfully updated your organization's members"
        }
      });
    }).catch;
  };

  const onSubmit = async () => {
    if (currentMembers.filter(cm => cm.role.name === "Creator").length !== 1) {
      alert("There must be exactly one creator of an organization.");
      return;
    }
    if (!members.filter(m => m.role.name === "Creator").length === 1) {
      alert("error(There wasn't a creator)");
      return;
    }
    console.log(currentMembers);
    const oldCreatorId = members.filter(m => m.role.name === "Creator")[0].id;
    const newCreatorId = currentMembers.filter(m => m.role.name === "Creator")[0].id;
    const deletedMembers = members.filter(m => !currentMembers.find(cm => cm.id === m.id));
    const creatorChange =
      oldCreatorId != newCreatorId ? currentMembers.filter(cm => cm.id === newCreatorId) : [];
    const createdMembers = currentMembers.filter(
      cm =>
        !members.find(m => m.id === cm.id) &&
        !creatorChange.find(m => m.id === cm.id) &&
        !(oldCreatorId != newCreatorId && cm.id === oldCreatorId)
    );
    const updatedMembers = currentMembers.filter(
      cm =>
        !members.includes(cm) &&
        !createdMembers.includes(cm) &&
        !creatorChange.find(m => m.id === cm.id) &&
        !(oldCreatorId != newCreatorId && cm.id === oldCreatorId)
    );
    const allChangedMembers = [
      ...deletedMembers.map(m => ({ ...m, operation: "delete" })),
      ...updatedMembers.map(m => ({ ...m, operation: "update" }))
    ];
    if (createdMembers.length > 0)
      allChangedMembers.push({ organization_members: [...createdMembers], operation: "create" });

    if (creatorChange.length > 0)
      allChangedMembers.push({ new_creator: creatorChange[0], operation: "creator_change" });
    return Promise.all(
      allChangedMembers.map(m => {
        if (m.operation === "delete") deleteMember(m);
        if (m.operation === "update") updateMember(m);
        if (m.operation === "create") {
          createMembers(m.organization_members);
        }
        if (m.operation === "creator_change") {
          updateCreator(m.new_creator);
        }
      })
    );
  };

  const deleteMember = m => {
    console.log("deleting member ");
    console.log(m);
    axios
      .delete(
        process.env.API_URL +
          "/api/organizations/" +
          organization.url_slug +
          "/update_member/" +
          m.member_id +
          "/",
        tokenConfig(token)
      )
      .then(function(response) {
        console.log(response);
        return Promise.resolve(response);
      })
      .catch(function(error) {
        console.log(error);
      });
  };

  const updateMember = m => {
    console.log("updating member ");
    console.log(m);
    axios
      .patch(
        process.env.API_URL +
          "/api/organizations/" +
          organization.url_slug +
          "/update_member/" +
          m.member_id +
          "/",
        parseMemberForUpdateRequest(m, organization),
        tokenConfig(token)
      )
      .then(function(response) {
        console.log(response);
        return Promise.resolve(response);
      })
      .catch(function(error) {
        console.log(error);
      });
  };

  const createMembers = organization_members => {
    console.log("creating members");
    console.log(organization_members);
    axios
      .post(
        process.env.API_URL + "/api/organizations/" + organization.url_slug + "/add_members/",
        parseMembersForCreateRequest(organization_members, organization),
        tokenConfig(token)
      )
      .then(function(response) {
        console.log(response);
        return Promise.resolve(response);
      })
      .catch(function(error) {
        console.log(error);
      });
  };

  const updateCreator = new_creator => {
    console.log("updating creator");
    console.log(new_creator);
    axios
      .post(
        process.env.API_URL + "/api/organizations/" + organization.url_slug + "/change_creator/",
        parseMemberForNewCreatorRequest(new_creator, organization),
        tokenConfig(token)
      )
      .then(function(response) {
        console.log("updated creator");
        console.log(response);
        return Promise.resolve(response);
      })
      .catch(function(error) {
        console.log(error);
        throw error;
      });
  };

  return (
    <>
      <Typography variant="h4" color="primary" className={classes.headline}>
        Manage members of {organization.name}
      </Typography>
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
      <form onSubmit={handleSubmit}>
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
                  hideHoursPerWeek
                  editDisabled={!canEdit(m)}
                  isOrganization
                  allowAppointingCreator={m.id !== user.id && user_role.name === "Creator"}
                />
              );
            })}
        </div>
        <div className={classes.buttonsContainer}>
          <div className={classes.buttons}>
            <Button
              className={classes.button}
              href={"/organizations/" + organization.url_slug}
              variant="contained"
              color="secondary"
            >
              Cancel
            </Button>
            <Button className={classes.button} variant="contained" color="primary" type="submit">
              Save
            </Button>
          </div>
        </div>
      </form>
    </>
  );
}

const parseMembersForCreateRequest = members => {
  console.log(members);
  return {
    organization_members: members.map(m => ({
      ...m,
      permission_type_id: m.role.role_type,
      role_in_organization: m.role_in_organization ? m.role_in_organization : ""
    }))
  };
};

const parseMemberForUpdateRequest = (m, organization) => {
  return {
    id: m.member_id,
    user: m.id,
    role: m.role.role_type,
    role_in_organization: m.role_in_organization ? m.role_in_organization : "",
    organization: organization.id
  };
};

const parseMemberForNewCreatorRequest = (m, organization) => {
  return {
    id: m.member_id,
    user: m.id,
    role: m.role.role_type,
    role_in_organization: m.role_in_organization ? m.role_in_organization : "",
    organization: organization.id
  };
};
