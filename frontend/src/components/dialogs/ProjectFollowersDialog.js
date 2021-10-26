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
  Typography
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

export default function ProjectFollowersDialog({
  open,
  onClose,
  project,
  followers,
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
      title={texts.followers_of + " " + project.name}
    >
      <div>
        {loading ? (
          <LinearProgress />
        ) : !user ? (
          <>
            <Typography>
              {texts.please_log_in + " " + texts.to_see_this_projects_followers + "!"}
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
        ) : followers && followers.length > 0 ? (
          <ProjectFollowers followers={followers} texts={texts} locale={locale} />
        ) : (
          <Typography>{texts.this_project_does_not_have_any_followers_yet}</Typography>
        )}
      </div>
    </GenericDialog>
  );
}

const ProjectFollowers = ({ followers, texts, locale }) => {
  const classes = useStyles();
  return (
    <>
      <Divider />
      <Table>
        <TableBody>
          {followers.map((f, index) => {
            return (
              <TableRow key={index} className={classes.follower}>
                <TableCell>
                  <Link
                    className={classes.user}
                    href={getLocalePrefix(locale) + "/profiles/" + f.user_profile.url_slug}
                  >
                    <Avatar
                      className={classes.avatar}
                      src={getImageUrl(f.user_profile.image)}
                      alt={f.user_profile.first_name + " " + f.user_profile.last_name}
                    />
                    <Typography component="span" color="secondary" className={classes.username}>
                      {f.user_profile.first_name + " " + f.user_profile.last_name}
                    </Typography>
                  </Link>
                </TableCell>
                <TableCell>
                  <Typography className={classes.followedText}>
                    {texts.following_since} <ReactTimeago date={f.created_at} />
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
