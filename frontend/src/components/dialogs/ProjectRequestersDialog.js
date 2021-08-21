import {
  Avatar,
  Button,
  Container,
  Divider,
  LinearProgress,
  Link,
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@material-ui/core";
import React, { useContext } from "react";
import ReactTimeago from "react-timeago";
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
  open,
  onClose,
  project,
  requesters,
  loading,
  user,
  url,
}) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale: locale });
  const handleClose = () => {
    onClose();
  };
  return (
    <GenericDialog
      onClose={handleClose}
      open={open}
      title={texts.requesters_of + " " + project.name}
      //   title={"Users who have requested to follow"}
    >
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
        ) : requesters && requesters.length > 0 ? (
          <ProjectRequesters requesters={requesters} texts={texts} locale={locale} />
        ) : (
          <Typography>{texts.this_project_does_not_have_any_requesters_yet}</Typography>
        )}
      </>
    </GenericDialog>
  );
}

const ProjectRequesters = ({ requesters, texts, locale }) => {
  const classes = useStyles();
  console.log(requesters);

  const fakeRequesters = [
    {
      user_profile: {
        image: "test",
      },
    },
    {
      user_profile: {
        image: "test2",
      },
    },
  ];

  return (
    <>
      <Divider />
      <Table>
        {/* TODO: fix requestesrs */}
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
                  <Typography className={classes.followedText}>
                    {texts.following_since} <ReactTimeago date={requester.created_at} />
                  </Typography>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
};
