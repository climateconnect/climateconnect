import { Button } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import React, { useContext } from "react";
import ROLE_TYPES from "../../../../public/data/role_types";
import { apiRequest } from "../../../../public/lib/apiOperations";
import { getAllChangedMembers, hasGreaterRole } from "../../../../public/lib/manageMembers";
import getTexts from "../../../../public/texts/texts";
import UserContext from "../../context/UserContext";
import ManageMembers from "../../manageMembers/ManageMembers";

const useStyles = makeStyles((theme) => ({
  root: {
    flex: "auto",
    overflowY: "auto",
    width: "100%",
    background: "white",
    maxWidth: theme.breakpoints.values["md"],
    margin: "0 auto",
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  saveIcon: {
    float: "right",
  },
  buttonsWrapper: {
    marginTop: theme.spacing(0.5),
  },
}));

export default function ChatMemberManagementOverlay({
  participants,
  setParticipants,
  user_role,
  rolesOptions,
  chat_uuid,
  token,
  chat_id,
  toggleMemberManagementExpanded,
}) {
  const classes = useStyles();
  const { user, locale } = useContext(UserContext);
  const texts = getTexts({ page: "chat", locale: locale });
  const [state, setState] = React.useState({
    curParticipants: participants,
    curUserRole: user_role,
  });
  const canEdit = (p) => {
    const participant_role = p.role.name
      ? p.role
      : rolesOptions.find((o) => o.role_type === p.role.role_type);
    return (
      p.id === user.id || hasGreaterRole(state.curUserRole.role_type, participant_role.role_type)
    );
  };

  const handleSetCurParticipants = (newValue, newUserRoleValue) => {
    if (newUserRoleValue)
      setState({
        ...state,
        curParticipants: newValue,
        curUserRole: newUserRoleValue,
      });
    else setState({ ...state, curParticipants: newValue });
  };
  const handleSetCurUserRole = (newValue) => {
    setState({ ...state, curUserRole: newValue });
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit()
      .then(() => {
        setParticipants(state.curParticipants);
        toggleMemberManagementExpanded(
          texts.you_have_successfully_updated_this_chats_participants,
          "success"
        );
      })
      .catch((e) => {
        console.log(e);
        toggleMemberManagementExpanded(texts.something_went_wrong, "error");
      });
  };

  const onSubmit = async () => {
    if (!verifyInput()) return false;
    const allChangedMembers = getAllChangedMembers(
      participants,
      state.curParticipants,
      "chat_participants"
    );
    return Promise.all(
      allChangedMembers.map((m) => {
        if (m.operation === "delete") deleteMember(m, locale);
        if (m.operation === "update") updateMember(m, locale);
        if (m.operation === "create") {
          createMembers(m.chat_participants, locale);
        }
        if (m.operation === "creator_change") {
          updateCreator(m.new_creator, locale);
        }
      })
    );
  };

  const deleteMember = (m, locale) => {
    apiRequest({
      method: "delete",
      url: "/api/chat/" + chat_uuid + "/update_member/" + m.participant_id + "/",
      token: token,
      shouldThrowError: true,
      locale: locale,
    });
  };

  const updateMember = (m, locale) => {
    apiRequest({
      method: "patch",
      url: "/api/chat/" + chat_uuid + "/update_member/" + m.participant_id + "/",
      token: token,
      payload: parseMemberForUpdateRequest(m),
      shouldThrowError: true,
      locale: locale,
    });
  };

  const createMembers = (chat_participants, locale) => {
    apiRequest({
      method: "post",
      url: "/api/chat/" + chat_uuid + "/add_members/",
      token: token,
      payload: parseMembersForCreateRequest(chat_participants),
      shouldThrowError: true,
      locale: locale,
    });
  };

  const updateCreator = (new_creator, locale) => {
    apiRequest({
      method: "post",
      url: "/api/chat/" + chat_uuid + "/change_creator/",
      token: token,
      payload: parseMemberForUpdateRequest(new_creator),
      shouldThrowError: true,
      locale: locale,
    });
  };

  const parseMembersForCreateRequest = (members) => {
    return {
      chat_participants: members.map((m) => ({
        ...m,
        permission_type_id: m.role.id,
      })),
    };
  };

  const parseMemberForUpdateRequest = (m) => {
    return {
      id: m.participant_id,
      user: m.id,
      role: m.role.id,
      chat: chat_id,
    };
  };

  const verifyInput = () => {
    if (
      state.curParticipants.filter((cm) => cm.role.role_type === ROLE_TYPES.all_type).length !== 1
    ) {
      alert(texts.there_must_be_exactly_one_creator_of_an_organization);
      return false;
    }
    if (!participants.filter((m) => m.role.role_type === ROLE_TYPES.all_type).length === 1) {
      alert(texts.error + ": " + texts.there_wasnt_a_creator);
      return false;
    }
    return true;
  };

  return (
    <form className={classes.root} onSubmit={handleSubmit}>
      <div className={classes.buttonsWrapper}>
        <Button
          color="secondary"
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={toggleMemberManagementExpanded}
        >
          {texts.go_back}
        </Button>
        <Button
          color="primary"
          variant="contained"
          startIcon={<SaveIcon />}
          className={classes.saveIcon}
          type="submit"
        >
          {texts.save}
        </Button>
      </div>
      <ManageMembers
        currentMembers={state.curParticipants}
        setCurrentMembers={handleSetCurParticipants}
        rolesOptions={rolesOptions}
        user={user}
        role_property_name="none"
        user_role={state.curUserRole}
        setUserRole={handleSetCurUserRole}
        hideHoursPerWeek
        canEdit={canEdit}
        label={texts.search_for_users_to_add_to_this_group_chat}
        dontPickRole
      />
    </form>
  );
}
