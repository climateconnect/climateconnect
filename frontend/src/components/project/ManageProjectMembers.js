import { Button, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React, { useContext } from "react";
import ROLE_TYPES from "../../../public/data/role_types";
import { apiRequest, getLocalePrefix, redirect } from "../../../public/lib/apiOperations";
import { hasGreaterRole } from "../../../public/lib/manageMembers";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import ManageMembers from "../manageMembers/ManageMembers";

const useStyles = makeStyles((theme) => {
  return {
    headline: {
      textAlign: "center",
      marginTop: theme.spacing(4),
    },
    buttons: {
      float: "right",
    },
    button: {
      marginRight: theme.spacing(2),
    },
    buttonsContainer: {
      height: 40,
      width: "100%",
    },
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
  availabilityOptions,
}) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale: locale, project: project });
  const [user_role, setUserRole] = React.useState(members.find((m) => m.id === user.id).role);
  if (!user_role) setUserRole(members.find((m) => m.id === user.id).role);
  const handleSetCurrentMembers = (newValue, newUserRoleValue) => {
    setCurrentMembers(newValue);
    if (newUserRoleValue) setUserRole(newUserRoleValue);
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit()
      .then((ret) => {
        if (ret !== false)
          redirect("/projects/" + project.url_slug, {
            message: texts.you_have_successfully_updated_your_team,
          });
      })
      .catch((e) => {
        console.log(e);
        redirect("/projects/" + project.url_slug, {
          message: texts.not_all_your_updates_have_worked,
        });
      });
  };

  const onSubmit = async () => {
    if (!verifyInput()) return false;
    const allChangedMembers = getAllChangedMembers();
    return Promise.all(
      allChangedMembers.map((m) => {
        if (m.operation === "delete") deleteMember(m, locale);
        if (m.operation === "update") updateMember(m, locale);
        if (m.operation === "create") {
          createMembers(m.team_members, locale);
        }
        if (m.operation === "creator_change") {
          updateCreator(m.new_creator, locale);
        }
      })
    );
  };

  const getAllChangedMembers = () => {
    const oldCreatorId = members.filter((m) => m.role.role_type === ROLE_TYPES.all_type)[0].id;
    const newCreatorId = currentMembers.filter((m) => m.role.role_type === ROLE_TYPES.all_type)[0]
      .id;
    const deletedMembers = members.filter((m) => !currentMembers.find((cm) => cm.id === m.id));
    const creatorChange =
      oldCreatorId != newCreatorId ? currentMembers.filter((cm) => cm.id === newCreatorId) : [];
    const createdMembers = currentMembers.filter(
      (cm) =>
        !members.find((m) => m.id === cm.id) &&
        !creatorChange.find((m) => m.id === cm.id) &&
        !(oldCreatorId != newCreatorId && cm.id === oldCreatorId)
    );
    const updatedMembers = currentMembers.filter(
      (cm) =>
        !members.includes(cm) &&
        !createdMembers.includes(cm) &&
        !creatorChange.find((m) => m.id === cm.id) &&
        !(oldCreatorId != newCreatorId && cm.id === oldCreatorId)
    );
    const allChangedMembers = [
      ...deletedMembers.map((m) => ({ ...m, operation: "delete" })),
      ...updatedMembers.map((m) => ({ ...m, operation: "update" })),
    ];
    if (createdMembers.length > 0)
      allChangedMembers.push({ team_members: [...createdMembers], operation: "create" });

    if (creatorChange.length > 0)
      allChangedMembers.push({ new_creator: creatorChange[0], operation: "creator_change" });

    return allChangedMembers;
  };

  const verifyInput = () => {
    if (currentMembers.filter((cm) => cm.role.role_type === ROLE_TYPES.all_type).length !== 1) {
      alert(texts.there_must_be_exactly_one_creator_of_a_project);
      return false;
    }
    if (!members.filter((m) => m.role.role_type === ROLE_TYPES.all_type).length === 1) {
      alert(texts.error_no_creator);
      return false;
    }
    return true;
  };

  const canEdit = (member) => {
    return member.id === user.id || hasGreaterRole(user_role.role_type, member.role.role_type);
  };

  const deleteMember = (m, locale) => {
    apiRequest({
      method: "delete",
      url: "/api/projects/" + project.url_slug + "/members/" + m.member_id + "/",
      token: token,
      shouldThrowError: true,
      locale: locale,
    });
  };

  const updateMember = (m, locale) => {
    apiRequest({
      method: "patch",
      url: "/api/projects/" + project.url_slug + "/members/" + m.member_id + "/",
      token: token,
      payload: parseMemberForUpdateRequest(m, project),
      shouldThrowError: true,
      locale: locale,
    });
  };

  const createMembers = (team_members, locale) => {
    apiRequest({
      method: "post",
      url: "/api/projects/" + project.url_slug + "/add_members/",
      token: token,
      payload: parseMembersForCreateRequest(team_members, project),
      shouldThrowError: true,
      locale: locale,
    });
  };

  const updateCreator = (new_creator, locale) => {
    apiRequest({
      method: "post",
      url: "/api/projects/" + project.url_slug + "/change_creator/",
      token: token,
      payload: parseMemberForUpdateRequest(new_creator, project),
      shouldThrowError: true,
      locale: locale,
    });
  };
  return (
    <>
      <Typography variant="h4" color="primary" className={classes.headline}>
        {texts.manage_members_of_project}
      </Typography>
      <form onSubmit={handleSubmit}>
        <ManageMembers
          currentMembers={currentMembers}
          rolesOptions={rolesOptions}
          setCurrentMembers={handleSetCurrentMembers}
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
              href={getLocalePrefix(locale) + "/projects/" + project.url_slug}
              variant="contained"
              color="secondary"
            >
              {texts.cancel}
            </Button>
            <Button className={classes.button} variant="contained" color="primary" type="submit">
              {texts.save}
            </Button>
          </div>
        </div>
      </form>
    </>
  );
}

const parseMembersForCreateRequest = (members) => {
  return {
    team_members: members.map((m) => ({
      ...m,
      permission_type_id: m.role.id,
      role_in_project: m.role_in_project ? m.role_in_project : "",
      availability: m.availability.id,
    })),
  };
};

const parseMemberForUpdateRequest = (m, project) => {
  return {
    id: m.member_id,
    user: m.id,
    role: m.role.id,
    role_in_project: m.role_in_project ? m.role_in_project : "",
    project: project.id,
    availability: m.availability.id,
  };
};
