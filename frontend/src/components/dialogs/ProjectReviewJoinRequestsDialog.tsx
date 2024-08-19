import {
  Avatar,
  Button,
  Container,
  Divider,
  LinearProgress,
  Link,
  Typography,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext, useState } from "react";
import Cookies from "universal-cookie";
import Router from "next/router";

// Relative imports
import { apiRequest, getLocalePrefix } from "../../../public/lib/apiOperations";
import { getImageUrl } from "../../../public/lib/imageOperations";
import { getMembershipRequests } from "../../../public/lib/projectOperations";
import getTexts from "../../../public/texts/texts";
import FeedbackContext from "../context/FeedbackContext";
import UserContext from "../context/UserContext";
import GenericDialog from "./GenericDialog";

const useStyles = makeStyles((theme) => ({
  requestersContainer: {
    padding: theme.spacing(1),
  },
  user: {
    display: "flex",
    alignItems: "center",
  },
  avatar: {
    margin: theme.spacing(1),
  },
  username: {
    fontWeight: 600,
    fontSize: 14,
  },
  followedText: {
    [theme.breakpoints.down("sm")]: {
      fontSize: 13,
    },
  },
  loginButton: {
    marginTop: theme.spacing(3),
  },
  loginButtonContainer: {
    display: "flex",
    justifyContent: "center",
  },
  noOpenRequestsText: {
    textAlign: "center",
  },
  dialogTitle: {
    color: "#207178",
    fontWeight: "bold",
  },
  dialogMessage: {
    color: "#207178",
    fontSize: 14,
    padding: theme.spacing(1),
  },
  dialogButtonContainer: {
    display: "flex",
    gap: 10,
    justifyContent: "flex-end",
    marginBottom: 15,
  },
  dialogButton: {
    padding: "5px 20px",
    fontSize: 12,
  },
}));

export default function ProjectReviewJoinRequestsDialog({
  loading,
  onClose,
  open,
  project,
  requesters,
  url,
  user,
  user_permission,
}) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale: locale, count: requesters?.length});

  const userDoNotPermissionProps = {
    classes: classes,
    texts: texts,
  };

  const userDoNotExistProps = {
    texts: texts,
    classes: classes,
    locale: locale,
    url: url,
  };

  const handleClose = () => {
    onClose();
  };
  
  const dialogTitle =
    requesters.length > 0
      ? texts.project_requesters_dialog_title
      : texts.project_requesters_dialog_title_with_no_user;

  return (
    <GenericDialog
      maxWidth="sm"
      onClose={handleClose}
      open={open}
      title={dialogTitle}
      titleTextClassName={classes.dialogTitle}
    >
      {
        // If we don't have any permissions, we can't load the join requests
        !user_permission ? (
          <UserDoNotPermission {...userDoNotPermissionProps} />
        ) : loading ? (
          <LinearProgress />
        ) : !user ? (
          <UserDoNotExist {...userDoNotExistProps} />
        ) : // If there are users requesting to join and we have permission to view them: render them!
        requesters && requesters.length > 0 ? (
          <ProjectRequesters
            handleClose={handleClose}
            project={project}
            initialRequesters={requesters}
          />
        ) : (
          <Typography className={classes.noOpenRequestsText}>
            {texts.no_open_project_join_requests}
          </Typography>
        )
      }
    </GenericDialog>
  );
}

const UserDoNotPermission = ({ classes, texts }) => (
  <Typography className={classes.noOpenRequestsText}>
    {texts.only_project_admins_can_view_join_requests}
  </Typography>
);

const UserDoNotExist = ({ texts, classes, locale, url }) => (
  <>
    <Typography>
      {texts.please_log_in + " " + texts.to_see_this_projects_requesters + "!"}
    </Typography>
    <Container className={classes.loginButtonContainer}>
      <Button
        className={classes.loginButton}
        variant="contained"
        color="primary"
        href={getLocalePrefix(locale) + "/signin?redirect=" + encodeURIComponent(url)}
      >
        {texts.log_in}
      </Button>
    </Container>
  </>
);

const ProjectRequesters = ({ initialRequesters, project, handleClose }) => {
  const [requesters, setRequesters] = useState(initialRequesters);
  const { locale } = useContext(UserContext);
  const cookies = new Cookies();
  const token = cookies.get("auth_token");
  /**
   * After any update is made to approve
   * or reject, we call the backend to update the
   * current list.
   */
  async function handleUpdateRequesters() {
    try {
      const newRequesters = await getMembershipRequests(project.url_slug, locale, token);
      setRequesters(newRequesters);
      if (newRequesters.length === 0) {
        handleClose();
      }
      
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <>
      <Divider />
      {requesters?.length > 0 &&
        requesters.map((requester, index) => {
          return (
            <div key={index}>
              <Requester
                project={project}
                locale={locale}
                requester={requester}
                requestId={requester.requestId}
                handleUpdateRequesters={handleUpdateRequesters}
                token={token}
              />
              <Divider />
            </div>
          );
        })}
    </>
  );
};

/**
 * Separate cohesive component that encapsulates
 * all the requester state and functionality together.
 */
const Requester = ({ handleUpdateRequesters, locale, project, requester, requestId, token }) => {
  const classes = useStyles();
  const { showFeedbackMessage } = useContext(FeedbackContext);
  const texts = getTexts({ page: "general", locale: locale });

  async function handleRequest(approve: boolean): Promise<void> {
    const url = `/api/projects/${project.url_slug}/request_membership/${
      approve ? "approve" : "reject"
    }/${requestId}/`;
    try {
      await apiRequest({
        method: "post",
        url: url,
        locale: locale,
        headers: {
          Authorization: `Token ${token}`,
        },
        payload: {},
      });
      showFeedbackMessage({
        message: texts.no_permission,
        success: true,
      });
      // Now notify parent list to update current list
      // of requesters to immediately
      // show the updated state in the UI.
      handleUpdateRequesters();
    } catch (e) {
      if (e.response.status === 401) {
        showFeedbackMessage({
          message: texts.no_permission,
          error: true,
        });
      }
      console.log(e);
    }
  }

  const handleMessageBackRequest = () => {
    const urlPostfix = "/api/start_private_chat/";
    const payload: any = {};
    payload.profile_url_slug = requester?.user?.url_slug;
    apiRequest({
      method: "post",
      url: urlPostfix,
      payload: payload,
      token: token,
      locale: locale,
    })
    .then(async function (response) {
      Router.push("/chat/" + response.data.chat_uuid + "/");
    })
    .catch(function (error) {
      console.log(error.response.data.message);
      // TODO: Show error message that user cant connect
    });
  }

  return (
    <>
      <Link
        className={classes.user}
        href={getLocalePrefix(locale) + "/profiles/" + requester.user.url_slug}
        underline="hover"
      >
        <Avatar
          className={classes.avatar}
          src={getImageUrl(requester.user.image)}
          alt={requester.user.first_name + " " + requester.user.last_name}
          sx={{ width: 24, height: 24 }}
        />
        <Typography component="span" color="secondary" className={classes.username}>
          {requester.user.first_name + " " + requester.user.last_name}
        </Typography>
      </Link>
      <Typography component="div" color="secondary" className={classes.dialogMessage}>
        {requester.message}
      </Typography>
      <div className={classes.dialogButtonContainer}>
        <Button
          className={classes.dialogButton}
          variant="contained"
          color="primary"
          href={"#"}
          onClick={() => handleMessageBackRequest()}
        >
          {texts.message_back}
        </Button>
        <Button
          className={classes.dialogButton}
          variant="outlined"
          color="primary"
          href={"#"}
          onClick={() => handleRequest(false)}
        >
          {texts.ignore}
        </Button>
        <Button
          className={classes.dialogButton}
          variant="contained"
          color="primary"
          href={"#"}
          onClick={() => handleRequest(true)}
        >
          {texts.accept}
        </Button>
      </div>
    </>
  );
};
