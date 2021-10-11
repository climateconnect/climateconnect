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
import React, { useContext } from "react";
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

  // See https://github.com/climateconnect/climateconnect/issues/672
  async function handleApproveRequest() {
    const cookies = new Cookies();
    const token = cookies.get("token");

    const response = await apiRequest({
      method: "post",
      // TODO(piper): fix with correct request ID
      url: `/api/projects/${project.url_slug}/request_membership/approve/TODO-REQUEST-ID`,
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    if (!resp?.data?.results) {
      // TODO: error appropriately here
    } else {
      console.log("Approved!");
    }
  }

  // See https://github.com/climateconnect/climateconnect/issues/672
  async function handleDenyRequest() {
    const cookies = new Cookies();
    const token = cookies.get("token");

    const response = await apiRequest({
      method: "post",
      // TODO(piper): fix with correct request ID
      url: `/api/projects/${project.url_slug}/request_membership/deny/TODO-REQUEST-ID`,
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    if (!resp?.data?.results) {
      // TODO: error appropriately here
    } else {
      console.log("Denied request.");
    }
  }

  const handleClose = () => {
    onClose();
  };

  return (
    <GenericDialog onClose={handleClose} open={open} title={"Members requested to join project"}>
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
            onApproveRequest={handleApproveRequest}
            onClose={onClose}
            onDenyRequest={handleDenyRequest}
            requesters={requesters}
            texts={texts}
          />
        ) : (
          <Typography>{texts.this_project_does_not_have_any_requesters_yet}</Typography>
        )}
      </>
    </GenericDialog>
  );
}

const ProjectRequesters = ({
  locale,
  onApproveRequest,
  onClose,
  onDenyRequest,
  requesters,
  texts,
}) => {
  const classes = useStyles();

  return (
    <>
      <Divider />
      <Table>
        <TableBody>
          {requesters.map((requester, index) => {
            return (
              <TableRow key={index} className={classes.requester}>
                <TableCell>
                  <Link
                    className={classes.user}
                    href={getLocalePrefix(locale) + "/profiles/" + requester.user_profile.url_slug}
                  >
                    <Avatar
                      className={classes.avatar}
                      src={getImageUrl(requester.user_profile.image)}
                      alt={
                        requester.user_profile.first_name + " " + requester.user_profile.last_name
                      }
                    />
                    <Typography component="span" color="secondary" className={classes.username}>
                      {requester.user_profile.first_name + " " + requester.user_profile.last_name}
                    </Typography>
                  </Link>
                </TableCell>

                <TableCell>
                  <Tooltip title="Approve">
                    <IconButton
                      aria-label="approve project request"
                      color="primary"
                      disableRipple
                      onClick={onApproveRequest}
                    >
                      <CheckIcon />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Deny">
                    <IconButton
                      aria-label="deny project request"
                      disableRipple
                      onClick={onDenyRequest}
                      tooltipText="whoa"
                    >
                      <BlockIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
};
