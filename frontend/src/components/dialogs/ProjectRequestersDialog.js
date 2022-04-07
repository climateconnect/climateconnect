import {
  Avatar,
  Button,
  Container,
  Divider,
  IconButton,
  LinearProgress,
  Link,
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
} from "@material-ui/core";
import BlockIcon from "@material-ui/icons/Block";
import CheckIcon from "@material-ui/icons/Check";
import React, { useContext, useState } from "react";
import Cookies from "universal-cookie";

// Relative imports
import { apiRequest, getLocalePrefix } from "../../../public/lib/apiOperations";
import { getImageUrl } from "../../../public/lib/imageOperations";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import GenericDialog from "./GenericDialog";

const useStyles = makeStyles((theme) => ({
  user: {
    display: "flex",
    alignItems: "center",
  },
  avatar: {
    marginRight: theme.spacing(1),
  },
  username: {
    fontWeight: 600,
  },
  followedText: {
    [theme.breakpoints.down("xs")]: {
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
}));

export default function ProjectRequestersDialog({
  loading,
  onClose,
  open,
  project,
  requesters,
  url,
  user,
}) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale: locale });

  const handleClose = () => {
    onClose();
  };

  return (
    <GenericDialog onClose={handleClose} open={open} title={texts.project_requesters_dialog_title}>
      <>
        {loading ? (
          <LinearProgress />
        ) : !user ? (
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
        ) : // If we have some users requesting to join, then render them
        requesters && requesters.length > 0 ? (
          <ProjectRequesters
            locale={locale}
            onClose={onClose}
            project={project}
            initialRequesters={requesters}
            texts={texts}
          />
        ) : (
          <Typography className={classes.noOpenRequestsText}>
            {texts.no_open_project_join_requests}
          </Typography>
        )}
      </>
    </GenericDialog>
  );
}

const ProjectRequesters = ({ locale, initialRequesters, project }) => {
  const classes = useStyles();

  const [requesters, setRequesters] = useState(initialRequesters);

  /**
   * After any update is made to approve
   * or reject, we call the backend to update the
   * current list.
   */
  async function handleUpdateRequesters() {
    const resp = await apiRequest({
      method: "get",
      url: `/api/projects/${project.url_slug}/requesters/`,
    });

    if (!resp?.data?.results) {
      // TODO: error appropriately here
    }

    const newRequesters = resp.data.results;
    setRequesters(newRequesters);
  }

  return (
    <>
      <Divider />
      <Table>
        <TableBody>
          {requesters.map((requester, index) => {
            return (
              <TableRow key={index} className={classes.requester}>
                <Requester
                  project={project}
                  locale={locale}
                  requester={requester}
                  requestId={requester.requestId}
                  handleUpdateRequesters={handleUpdateRequesters}
                />
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
};

/**
 * Separate cohesive component that encapsulates
 * all the requester state and functionality together.
 */
const Requester = ({ handleUpdateRequesters, locale, project, requester, requestId }) => {
  const classes = useStyles();

  /**
   * Sends a POST to the backend to approve
   * the membership request into the organizations_membershiprequests
   * table. The API expects 2 dynamic parameters: the current project
   * URL slug, and the ID of the original request, which is generated
   * and returned to the client during the initial request.
   *
   * See https://github.com/climateconnect/climateconnect/issues/672
   */
  async function handleApproveRequest() {
    const cookies = new Cookies();
    const token = cookies.get("token");

    const response = await apiRequest({
      method: "post",
      url: `/api/projects/${project.url_slug}/request_membership/approve/${requestId}/`,
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    if (!response?.data?.results) {
      // TODO: error appropriately here
    } else {
      console.log("Approved!");
    }

    // Now notify parent list to update current list
    // of requesters to immediately
    // show the updated state in the UI.
    handleUpdateRequesters();
  }

  // See https://github.com/climateconnect/climateconnect/issues/672
  async function handleRejectRequest() {
    const cookies = new Cookies();
    const token = cookies.get("token");

    const response = await apiRequest({
      method: "post",
      url: `/api/projects/${project.url_slug}/request_membership/reject/${requestId}/`,
      token: token,
    });

    if (!response?.data?.results) {
      // TODO: error appropriately here
    } else {
      console.log("Denied request.");
    }

    // Now notify parent list to update current list
    // of requesters to immediately
    // show the updated state in the UI.
    handleUpdateRequesters();
  }

  return (
    <>
      <TableCell>
        <Link
          className={classes.user}
          href={getLocalePrefix(locale) + "/profiles/" + requester.user.url_slug}
        >
          <Avatar
            className={classes.avatar}
            src={getImageUrl(requester.user.image)}
            alt={requester.user.first_name + " " + requester.user.last_name}
          />
          <Typography component="span" color="secondary" className={classes.username}>
            {requester.user.first_name + " " + requester.user.last_name}
          </Typography>
        </Link>
      </TableCell>

      <TableCell>
        <Tooltip title="Approve">
          <IconButton
            aria-label="approve project request"
            color="primary"
            disableRipple
            onClick={handleApproveRequest}
          >
            <CheckIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Deny">
          <IconButton aria-label="deny project request" disableRipple onClick={handleRejectRequest}>
            <BlockIcon />
          </IconButton>
        </Tooltip>
      </TableCell>
    </>
  );
};
