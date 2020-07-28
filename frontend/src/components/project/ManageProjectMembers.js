import React from "react";
import ManageMembers from "../manageMembers/ManageMembers";
import { Typography, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { apiRequest, redirect } from "../../../public/lib/apiOperations";

const useStyles = makeStyles(theme => {
  return {
    headline: {
      textAlign: "center",
      marginTop: theme.spacing(4)
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
    }
  };
});

export default function ManageProjectMembers({
  user,
  members,
  currentMembers,
  setCurrentMembers,
  rolesOptions,
  project,
  token,
  availabilityOptions
}) {
  const classes = useStyles();
  const [user_role, setUserRole] = React.useState(members.find(m => m.id === user.id).role);
  if (!user_role) setUserRole(members.find(m => m.id === user.id).role);

  const handleSubmit = event => {
    event.preventDefault();
    onSubmit()
      .then(ret => {
        if (ret !== false)
          redirect("/projects/" + project.url_slug, {
            message: "You have successfully updated your team"
          });
      })
      .catch(e => {
        console.log(e);
        redirect("/projects/" + project.url_slug, { message: "Not all your updates have worked." });
      });
  };

  const onSubmit = async () => {
    if (!verifyInput()) return false;
    const allChangedMembers = getAllChangedMembers();
    return Promise.all(
      allChangedMembers.map(m => {
        if (m.operation === "delete") deleteMember(m);
        if (m.operation === "update") updateMember(m);
        if (m.operation === "create") {
          createMembers(m.team_members);
        }
        if (m.operation === "creator_change") {
          updateCreator(m.new_creator);
        }
      })
    );
  };

  const getAllChangedMembers = () => {
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
      allChangedMembers.push({ team_members: [...createdMembers], operation: "create" });

    if (creatorChange.length > 0)
      allChangedMembers.push({ new_creator: creatorChange[0], operation: "creator_change" });

    return allChangedMembers;
  };

  const verifyInput = () => {
    if (currentMembers.filter(cm => cm.role.name === "Creator").length !== 1) {
      alert("There must be exactly one creator of a project.");
      return false;
    }
    if (!members.filter(m => m.role.name === "Creator").length === 1) {
      alert("error(There wasn't a creator)");
      return false;
    }
    return true;
  };

  const canEdit = member => {
    return member.id === user.id || user_role.role_type > member.role.role_type;
  };

  const deleteMember = m => {
    apiRequest(
      "delete",
      "/api/projects/" + project.url_slug + "/members/" + m.member_id + "/",
      token,
      null,
      true
    );
  };

  const updateMember = m => {
    apiRequest(
      "patch",
      "/api/projects/" + project.url_slug + "/members/" + m.member_id + "/",
      token,
      parseMemberForUpdateRequest(m, project),
      true
    );
  };

  const createMembers = team_members => {
    apiRequest(
      "post",
      "/api/projects/" + project.url_slug + "/add_members/",
      token,
      parseMembersForCreateRequest(team_members, project),
      true
    );
  };

  const updateCreator = new_creator => {
    apiRequest(
      "post",
      "/api/projects/" + project.url_slug + "/change_creator/",
      token,
      parseMemberForUpdateRequest(new_creator, project),
      true
    );
  };
  return (
    <>
      <Typography variant="h4" color="primary" className={classes.headline}>
        Manage members of {project.name}
      </Typography>
      <form onSubmit={handleSubmit}>
        <ManageMembers
          currentMembers={currentMembers}
          rolesOptions={rolesOptions}
          setCurrentMembers={setCurrentMembers}
          availabilityOptions={availabilityOptions}
          user={user}
          canEdit={canEdit}
          role_property_name="role_in_project"
          user_role={user_role}
          setUserRole={setUserRole}
        />
        <div className={classes.buttonsContainer}>
          <div className={classes.buttons}>
            <Button
              className={classes.button}
              href={"/projects/" + project.url_slug}
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
  return {
    team_members: members.map(m => ({
      ...m,
      permission_type_id: m.role.id,
      role_in_project: m.role_in_project ? m.role_in_project : "",
      availability: m.availability.id
    }))
  };
};

const parseMemberForUpdateRequest = (m, project) => {
  return {
    id: m.member_id,
    user: m.id,
    role: m.role.id,
    role_in_project: m.role_in_project ? m.role_in_project : "",
    project: project.id,
    availability: m.availability.id
  };
};
