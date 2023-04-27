import { Button, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import ROLE_TYPES from "../../../public/data/role_types";
import { apiRequest, getLocalePrefix, redirect } from "../../../public/lib/apiOperations";
import { getAllChangedMembers, hasGreaterRole } from "../../../public/lib/manageMembers";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import ManageMembers from "../manageMembers/ManageMembers";
import { useRouter } from "next/router";

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
      marginLeft: theme.spacing(1),
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
    return member.id === user.id || hasGreaterRole(user_role.role_type, member.role.role_type);
  };

  const router = useRouter();
  const isCreationStage = router.query.isCreationStage;

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
        if (m.operation === "delete") deleteMember(m, locale);
        if (m.operation === "update") updateMember(m, locale);
        if (m.operation === "create") {
          createMembers(m.organization_members, locale);
        }
        if (m.operation === "creator_change") {
          updateCreator(m.new_creator, locale);
        }
      })
    );
  };

  const verifyInput = () => {
    if (currentMembers.filter((cm) => cm.role.role_type === ROLE_TYPES.all_type).length !== 1) {
      alert(texts.there_must_be_exactly_one_creator_of_organization);
      return false;
    }
    if (!members.filter((m) => m.role.role_type === ROLE_TYPES.all_type).length === 1) {
      alert(texts.error_no_creator);
      return false;
    }
    return true;
  };

  const deleteMember = (m, locale) => {
    apiRequest({
      method: "delete",
      url: "/api/organizations/" + organization.url_slug + "/update_member/" + m.member_id + "/",
      token: token,
      shouldThrowError: true,
      locale: locale,
    });
  };

  const updateMember = (m) => {
    apiRequest({
      method: "patch",
      url: "/api/organizations/" + organization.url_slug + "/update_member/" + m.member_id + "/",
      token: token,
      payload: parseMemberForUpdateRequest(m, organization),
      shouldThrowError: true,
      locale: locale,
    });
  };

  const createMembers = (organization_members) => {
    apiRequest({
      method: "post",
      url: "/api/organizations/" + organization.url_slug + "/add_members/",
      token: token,
      payload: parseMembersForCreateRequest(organization_members, organization),
      shouldThrowError: true,
      locale: locale,
    });
  };

  const updateCreator = (new_creator) => {
    apiRequest({
      method: "post",
      url: "/api/organizations/" + organization.url_slug + "/change_creator/",
      token: token,
      payload: parseMemberForUpdateRequest(new_creator, organization),
      shouldThrowError: true,
      locale: locale,
    });
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
              href={getLocalePrefix(locale) + "/organizations/" + organization.url_slug}
              variant="contained"
              color="secondary"
            >
              {isCreationStage ? texts.skip_for_now : texts.cancel}
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
