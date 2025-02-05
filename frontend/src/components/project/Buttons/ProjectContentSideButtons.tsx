import React, { useContext, useEffect, useState } from "react";
import { Button, Badge, useMediaQuery, IconButton } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import Cookies from "universal-cookie";

import GroupAddIcon from "@mui/icons-material/GroupAdd";
import EditIcon from "@mui/icons-material/Edit";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";

import UserContext from "../../context/UserContext";
import ROLE_TYPES from "../../../../public/data/role_types";
import getTexts from "../../../../public/texts/texts";
import { getMembershipRequests } from "../../../../public/lib/projectOperations";
import ProjectRequestersDialog from "../../dialogs/ProjectRequestersDialog";
import { getLocalePrefix } from "../../../../public/lib/apiOperations";
import JoinButton from "./JoinButton";
import theme from "../../../themes/theme";

const useStyles = makeStyles((theme) => ({
  memberButtons: {
    float: "right",
    display: "flex",
    flexDirection: "column",
  },

  editProjectButton: {
    marginTop: theme.spacing(1),
  },
  showRequestsButton: {
    background: "#f7f7f7",
    color: theme.palette.secondary.main,
    "&:hover": {
      background: "#e3e3e3",
    },
  },
  leaveProjectButton: {
    // TODO: we should really encapsulate
    // spacing style into specific spacing components, akin
    // to what Braid's <Box /> component does. This makes
    // the frontend code more maintainable, and spacing more deterministic
    marginTop: theme.spacing(1),
    background: theme.palette.error.main,
    color: "white",
    ["&:hover"]: {
      backgroundColor: theme.palette.error.main,
    },
  },
  joinButton: {
    float: "right",
  },
  iconButton: {
    color: "white",
    marginBottom: theme.spacing(1),
    backgroundColor: theme.palette.primary.main,
    "&:hover": {
      backgroundColor: "#36797e",
    },
  },
  leaveIconButton: {
    background: theme.palette.error.main,
    "&:hover": {
      backgroundColor: "#c96262",
    },
  },
}));

export default function ProjectContentSideButtons({
  project,
  showRequesters,
  toggleShowRequests,
  handleSendProjectJoinRequest,
  requestedToJoinProject,
  leaveProject,
  hubUrl,
}) {
  const token = new Cookies().get("auth_token");
  const classes = useStyles();
  const { user, locale, CUSTOM_HUB_URLS } = useContext(UserContext);
  const isCustomHub = CUSTOM_HUB_URLS.includes(hubUrl);

  const texts = getTexts({ page: "project", locale: locale, project: project });
  const isNarrowScreen = useMediaQuery(theme.breakpoints.down("md"));

  const user_permission =
    user && project.team && project.team.find((m) => m.id === user.id)
      ? project.team.find((m) => m.id === user.id).permission
      : null;
  const hasAdminPermissions = [ROLE_TYPES.all_type, ROLE_TYPES.read_write_type].includes(
    user_permission
  );

  const [requesters, setRequesters] = useState([]);
  const [requestersRetrieved, setRequestersRetrieved] = useState(false);
  // Fetch and populate requesters on initial load
  useEffect(() => {
    (async () => {
      //short circuit if the user doesn't have the necessary permissions to see join requests
      if (!(user_permission && hasAdminPermissions)) {
        return;
      }
      // Returns an array of objects with an ID (request ID) and
      // associated user profile.
      try {
        const membershipRequests = await getMembershipRequests(project.url_slug, locale, token);
        // Now transform to a shape of objects where a specific request ID is
        // alongside a user profile.
        const userRequests = membershipRequests.map((r) => {
          const user = {
            requestId: r.id,
            user: r.user_profile,
          };
          return user;
        });
        setRequesters(userRequests);
        setRequestersRetrieved(true);
      } catch (e) {
        console.log(e.response.data);
      }
    })();
  }, []);

  const ShowRequestsButton = () => {
    if (isNarrowScreen) {
      return (
        <Badge badgeContent={requesters.length} color="error">
          <IconButton size="large" className={classes.iconButton} onClick={toggleShowRequests}>
            <GroupAddIcon />
          </IconButton>
        </Badge>
      );
    } else {
      return (
        <Badge badgeContent={requesters.length} color="primary">
          <Button
            className={`${classes.editProjectButton} ${classes.showRequestsButton}`}
            variant="contained"
            onClick={toggleShowRequests}
          >
            {texts.review_join_requests}
          </Button>
        </Badge>
      );
    }
  };

  const EditProjectButton = ({ isCustomHub }) => {
    if (isNarrowScreen) {
      return (
        <IconButton
          size="large"
          className={classes.iconButton}
          href={
            isCustomHub
              ? `${getLocalePrefix(locale) + "/editProject/" + project.url_slug + "?hub=" + hubUrl}`
              : `${getLocalePrefix(locale) + "/editProject/" + project.url_slug}`
          }
        >
          <EditIcon />
        </IconButton>
      );
    } else {
      return (
        <Button
          className={classes.editProjectButton}
          variant="contained"
          href={
            isCustomHub
              ? `${getLocalePrefix(locale) + "/editProject/" + project.url_slug + "?hub=" + hubUrl}`
              : `${getLocalePrefix(locale) + "/editProject/" + project.url_slug}`
          }
        >
          {project.is_draft ? texts.edit_draft : texts.edit}
        </Button>
      );
    }
  };

  const LeaveProjectButton = () => {
    if (isNarrowScreen) {
      return (
        <IconButton
          size="large"
          className={`${classes.iconButton} ${classes.leaveIconButton}`}
          onClick={leaveProject}
        >
          <ExitToAppIcon />
        </IconButton>
      );
    } else {
      return (
        <Button className={classes.leaveProjectButton} variant="contained" onClick={leaveProject}>
          {texts.leave_project}
        </Button>
      );
    }
  };

  return (
    <div>
      {user && project.team && project.team.find((m) => m.id === user.id) && (
        <div className={classes.memberButtons}>
          {user_permission && hasAdminPermissions && (
            <>
              {/* Badge is dynamic based on the number of membership requesters */}
              <ShowRequestsButton />
              <EditProjectButton isCustomHub={isCustomHub} />
            </>
          )}
          {/* Otherwise if not a project admin, just show the Leave Project button */}
          <LeaveProjectButton />
        </div>
      )}

      {/* If the user is an admin on the project, or is already part
        of the project (has read only permissions), then we don't want to show the membership request button. */}
      {!hasAdminPermissions &&
        project.project_type.type_id !== "event" &&
        !(user_permission && [ROLE_TYPES.read_only_type].includes(user_permission)) && (
          <JoinButton
            handleSendProjectJoinRequest={handleSendProjectJoinRequest}
            requestedToJoin={requestedToJoinProject}
            className={classes.joinButton}
            hasAdminPermissions={hasAdminPermissions}
          />
        )}

      {/* Only present dialog if button has been clicked! */}
      <ProjectRequestersDialog
        open={showRequesters}
        project={project}
        requesters={requesters}
        onClose={toggleShowRequests}
        user={user}
        loading={!requestersRetrieved}
        user_permission={user_permission}
      />
    </div>
  );
}
