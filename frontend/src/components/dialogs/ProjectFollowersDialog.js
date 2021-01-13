import React from "react";
import {
  makeStyles,
  Avatar,
  Typography,
  Link,
  TableRow,
  Table,
  TableCell,
  Divider,
  LinearProgress,
  Button,
  Container,
  TableBody,
} from "@material-ui/core";
import GenericDialog from "./GenericDialog";
import ReactTimeago from "react-timeago";
import { getImageUrl } from "../../../public/lib/imageOperations";

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
  const handleClose = () => {
    onClose();
  };
  return (
    <GenericDialog onClose={handleClose} open={open} title={"Followers of " + project.name}>
      <div>
        {loading ? (
          <LinearProgress />
        ) : !user ? (
          <>
            <Typography>{"Please log in to see this project's followers!"}</Typography>
            <Container className={classes.loginButtonContainer}>
              <Button
                className={classes.loginButton}
                variant="contained"
                color="primary"
                href={"/signin?redirect=" + encodeURIComponent(url)}
              >
                Log in
              </Button>
            </Container>
          </>
        ) : followers && followers.length > 0 ? (
          <ProjectFollowers followers={followers} />
        ) : (
          <Typography>This project does not have any followers yet.</Typography>
        )}
      </div>
    </GenericDialog>
  );
}

const ProjectFollowers = ({ followers }) => {
  const classes = useStyles();
  console.log(followers);
  return (
    <>
      <Divider />
      <Table>
        <TableBody>
          {followers.map((f, index) => {
            return (
              <TableRow key={index} className={classes.follower}>
                <TableCell>
                  <Link className={classes.user} href={"/profiles/" + f.user_profile.url_slug}>
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
                    Followed <ReactTimeago date={f.created_at} />
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
