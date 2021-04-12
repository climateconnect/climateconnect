import { Button, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React, { useContext } from "react";
import { apiRequest, getLocalePrefix, redirect } from "../../../public/lib/apiOperations";
import { getAllChangedMembers } from "../../../public/lib/manageMembers";
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

export default function ManageOrganizationMembers({
  user,
  members,
  currentMembers,
  setCurrentMembers,
  rolesOptions,
  organization,
  token,
  availabilityOptions,
}) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "organization", locale: locale, organization: organization });
  const [user_role, setUserRole] = React.useState(members.find((m) => m.id === user.id).role);
  if (!user_role) setUserRole(members.find((m) => m.id === user.id).role);

  const canEdit = (member) => {
    return member.id === user.id || user_role.role_type > member.role.role_type;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit()
      .then(() => {
        redirect("/organizations/" + organization.url_slug, {
          message: texts.successfully_updated_org_members,
        });
      })
      .catch((e) => {
        console.log(e);
        redirect("/organizations/" + organization.url_slug, {
          errorMessage: texts.not_all_your_updates_have_worked,
        });
      });
  };

  const onSubmit = async () => {
    if (!verifyInput()) return false;
    const allChangedMembers = getAllChangedMembers(members, currentMembers, "organization_members");
    return Promise.all(
      allChangedMembers.map((m) => {
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

  const verifyInput = () => {
    if (currentMembers.filter((cm) => cm.role.name === "Creator").length !== 1) {
      alert(texts.there_must_be_exactly_one_creator_of_organization);
      return false;
    }
    if (!members.filter((m) => m.role.name === "Creator").length === 1) {
      alert(texts.error_no_creator);
      return false;
    }
    return true;
  };

  const deleteMember = (m) => {
    apiRequest(
      "delete",
      "/api/organizations/" + organization.url_slug + "/update_member/" + m.member_id + "/",
      token,
      null,
      true
    );
  };

  const updateMember = (m) => {
    apiRequest(
      "patch",
      "/api/organizations/" + organization.url_slug + "/update_member/" + m.member_id + "/",
      token,
      parseMemberForUpdateRequest(m, organization),
      true
    );
  };

  const createMembers = (organization_members) => {
    apiRequest(
      "post",
      "/api/organizations/" + organization.url_slug + "/add_members/",
      token,
      parseMembersForCreateRequest(organization_members, organization),
      true
    );
  };

  const updateCreator = (new_creator) => {
    apiRequest(
      "post",
      "/api/organizations/" + organization.url_slug + "/change_creator/",
      token,
      parseMemberForUpdateRequest(new_creator, organization),
      true
    );
  };

  return (
    <>
      <Typography variant="h4" color="primary" className={classes.headline}>
        {texts.manage_members_of_organization_name}
      </Typography>
      <form onSubmit={handleSubmit}>
        <ManageMembers
          currentMembers={currentMembers}
          rolesOptions={rolesOptions}
          setCurrentMembers={setCurrentMembers}
          availabilityOptions={availabilityOptions}
          user={user}
          canEdit={canEdit}
          role_property_name="role_in_organization"
          user_role={user_role}
          setUserRole={setUserRole}
          hideHoursPerWeek
          isOrganization
        />
        <div className={classes.buttonsContainer}>
          <div className={classes.buttons}>
            <Button
              className={classes.button}
              href={getLocalePrefix(locale) + "/organizations/" + organization.url_slug}
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
    organization_members: members.map((m) => ({
      ...m,
      permission_type_id: m.role.id,
      role_in_organization: m.role_in_organization ? m.role_in_organization : "",
    })),
  };
};

const parseMemberForUpdateRequest = (m, organization) => {
  return {
    id: m.member_id,
    user: m.id,
    role: m.role.id,
    role_in_organization: m.role_in_organization ? m.role_in_organization : "",
    organization: organization.id,
  };
};
