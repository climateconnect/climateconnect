import React, { useContext } from "react";
import { makeStyles, Button } from "@material-ui/core";
import ManageMembers from "../../manageMembers/ManageMembers";
import UserContext from "../../context/UserContext";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import SaveIcon from "@material-ui/icons/Save";
import { getAllChangedMembers } from "../../../../public/lib/manageMembers";
import { apiRequest } from "../../../../public/lib/apiOperations";

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
  const [state, setState] = React.useState({
    curParticipants: participants,
    curUserRole: user_role,
  });
  const { user } = useContext(UserContext);
  const canEdit = (p) => {
    const participant_role = p.role.name ? p.role : rolesOptions.find((o) => o.name === p.role);
    return p.id === user.id || state.curUserRole.role_type > participant_role.role_type;
  };

  const handleSetCurParticipants = (newValue) => setState({ ...state, curParticipants: newValue });
  const handleSetCurUserRole = (newValue) => setState({ ...state, curUserRole: newValue });

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit()
      .then(() => {
        setParticipants(state.curParticipants);
        toggleMemberManagementExpanded(
          "You have successfully updated this chat's participants!",
          "success"
        );
      })
      .catch((e) => {
        console.log(e);
        toggleMemberManagementExpanded(
          "Something went wrong! Contact contact@climateconnect.earth if this happens repeatedly!",
          "error"
        );
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
        if (m.operation === "delete") deleteMember(m);
        if (m.operation === "update") updateMember(m);
        if (m.operation === "create") {
          createMembers(m.chat_participants);
        }
        if (m.operation === "creator_change") {
          updateCreator(m.new_creator);
        }
      })
    );
  };

  const deleteMember = (m) => {
    apiRequest(
      "delete",
      "/api/chat/" + chat_uuid + "/update_member/" + m.participant_id + "/",
      token,
      null,
      true
    );
  };

  const updateMember = (m) => {
    apiRequest(
      "patch",
      "/api/chat/" + chat_uuid + "/update_member/" + m.participant_id + "/",
      token,
      parseMemberForUpdateRequest(m),
      true
    );
  };

  const createMembers = (chat_participants) => {
    apiRequest(
      "post",
      "/api/chat/" + chat_uuid + "/add_members/",
      token,
      parseMembersForCreateRequest(chat_participants),
      true
    );
  };

  const updateCreator = (new_creator) => {
    apiRequest(
      "post",
      "/api/chat/" + chat_uuid + "/change_creator/",
      token,
      parseMemberForUpdateRequest(new_creator),
      true
    );
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
    if (state.curParticipants.filter((cm) => cm.role.name === "Creator").length !== 1) {
      alert("There must be exactly one creator of an organization.");
      return false;
    }
    if (!participants.filter((m) => m.role.name === "Creator").length === 1) {
      alert("error(There wasn't a creator)");
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
          Go back
        </Button>
        <Button
          color="primary"
          variant="contained"
          startIcon={<SaveIcon />}
          className={classes.saveIcon}
          type="submit"
        >
          Save
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
        label="Search for users to add to this group chat"
        dontPickRole
      />
    </form>
  );
}
