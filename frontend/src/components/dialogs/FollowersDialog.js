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

export default function FollowersDialog({
  open,
  onClose,
  object,
  followers,
  loading,
  user,
  url,
  titleText,
  pleaseLogInText,
  toSeeFollowerText,
  logInText,
  noFollowersText,
  followingSinceText,
}) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const handleClose = () => {
    onClose();
  };
  return (
    <GenericDialog onClose={handleClose} open={open} title={titleText + " " + object.name}>
      <div>
        {loading ? (
          <LinearProgress />
        ) : !user ? (
          <>
            <Typography>{pleaseLogInText + " " + toSeeFollowerText + "!"}</Typography>
            <Container className={classes.loginButtonContainer}>
              <Button
                className={classes.loginButton}
                variant="contained"
                color="primary"
                href={getLocalePrefix(locale) + "/signin?redirect=" + encodeURIComponent(url)}
              >
                {logInText}
              </Button>
            </Container>
          </>
        ) : followers && followers.length > 0 ? (
          <ProjectFollowers
            followers={followers}
            followingSinceText={followingSinceText}
            locale={locale}
          />
        ) : (
          <Typography>{noFollowersText}</Typography>
        )}
      </div>
    </GenericDialog>
  );
}

const ProjectFollowers = ({ followers, followingSinceText, locale }) => {
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
                      src={getImageUrl(f.user_profile.thumbnail_image)}
                      alt={f.user_profile.first_name + " " + f.user_profile.last_name}
                    />
                    <Typography component="span" color="secondary" className={classes.username}>
                      {f.user_profile.first_name + " " + f.user_profile.last_name}
                    </Typography>
                  </Link>
                </TableCell>
                <TableCell>
                  <Typography className={classes.followedText}>
                    {followingSinceText} <ReactTimeago date={f.created_at} />
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
