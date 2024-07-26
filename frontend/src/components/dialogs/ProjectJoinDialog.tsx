import {
  Avatar,
  Button,
  Container,
  Link,
  Divider,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import ReactTimeago from "react-timeago";
import { getLocalePrefix } from "../../../public/lib/apiOperations";
import { getImageUrl } from "../../../public/lib/imageOperations";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import GenericDialog from "./GenericDialog";
import ProfileBadge from "../profile/ProfileBadge";

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
  likedText: {
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
  dialogTitle: {
    color: "#207178"
  },
  adminAvatar: {
    height: 20,
    width: 20,
    display: "inline-block",
    textAlign: "center",
    verticalAlign: "middle"
  },
}));
export default function ProjectJoinDialog({ open, projectAdmin }) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale: locale });
  const avatarProps = {
    className: classes.adminAvatar,
    src: getImageUrl(projectAdmin.image),
    alt: projectAdmin.name,
  };
  return (
    <GenericDialog 
      maxWidth="sm" 
      open={open} 
      title={texts.thrilled_to_join_the_project + "!"} 
      titleTextClassName={classes.dialogTitle}
    >
      <div>
          <>
            <Typography>
              {texts.please_share_with + " "}
              <Link
              href={"/profiles/" + projectAdmin.url_slug} underline="hover"
              >
                {projectAdmin?.badges?.length > 0 ? (
                  <ProfileBadge
                    badge={projectAdmin?.badges[0]}
                    size="medium"
                  >
                    <Avatar {...avatarProps} />
                  </ProfileBadge>
                  ) : (
                    <Avatar {...avatarProps} />
                  )}
                {" [" + projectAdmin.name + "] "}
              </Link>
                { texts.project_admin + ", " + texts.what_inspires_you_to_be_part_of_this_team + "!"}
            </Typography>
            <Container className={classes.loginButtonContainer}>
              <Button
                className={classes.loginButton}
                variant="contained"
                color="primary"
                href={ "#" }
              >
                {texts.send_request}
              </Button>
            </Container>
          </>
      </div>
    </GenericDialog>
  );
}
