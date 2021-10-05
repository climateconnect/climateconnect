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
  Typography,
} from "@material-ui/core";
import BlockIcon from "@material-ui/icons/Block";
import CheckIcon from "@material-ui/icons/Check";
import React, { useContext } from "react";

// Relative imports
import { getLocalePrefix } from "../../../public/lib/apiOperations";
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
            onClose={onClose}
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

const ProjectRequesters = ({ requesters, texts, onClose, locale }) => {
  const classes = useStyles();

  // TODO(piper): make appropriate API calls here to approve/reject
  // See https://github.com/climateconnect/climateconnect/issues/672
  const handleApproveRequester = () => {
    console.log("Approved!");
    onClose();
  };

  const handleDenyRequester = () => {
    console.log("Denied!");
    onClose();
  };

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

                {/* TODO(Piper): need to finish implementing approve / reject UI */}
                <TableCell>
                  <IconButton
                    aria-label="approve project request"
                    color="primary"
                    disableRipple
                    onClick={handleApproveRequester}
                  >
                    <CheckIcon />
                  </IconButton>
                  <IconButton
                    aria-label="reject project request"
                    disableRipple
                    onClick={handleDenyRequester}
                  >
                    <BlockIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
};
