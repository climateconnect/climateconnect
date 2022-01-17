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
  likedText: {
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
export default function LikesDialog({
  open,
  onClose,
  likes,
  loading,
  url,
  pleaseLogInText,
  titleText,
  noLikesYetText,
}) {
  const classes = useStyles();
  const { user, locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale: locale });
  const handleClose = () => {
    onClose();
  };
  return (
    <GenericDialog onClose={handleClose} open={open} title={titleText}>
      <div>
        {loading ? (
          <LinearProgress />
        ) : !user ? (
          <>
            <Typography>{pleaseLogInText}</Typography>
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
        ) : likes && likes.length > 0 ? (
          <Likes likes={likes} texts={texts} locale={locale} />
        ) : (
          <Typography>{noLikesYetText}</Typography>
        )}
      </div>
    </GenericDialog>
  );
}
const Likes = ({ likes, texts, locale }) => {
  const classes = useStyles();
  return (
    <>
      <Divider />
      <Table>
        <TableBody>
          {likes.map((l, index) => {
            return (
              <TableRow key={index}>
                <TableCell>
                  <Link
                    className={classes.user}
                    href={getLocalePrefix(locale) + "/profiles/" + l.user_profile.url_slug}
                  >
                    <Avatar
                      className={classes.avatar}
                      src={getImageUrl(l.user_profile.image)}
                      alt={l.user_profile.first_name + " " + l.user_profile.last_name}
                    />
                    <Typography component="span" color="secondary" className={classes.username}>
                      {l.user_profile.first_name + " " + l.user_profile.last_name}
                    </Typography>
                  </Link>
                </TableCell>
                <TableCell>
                  <Typography className={classes.likedText}>
                    {texts.liking_since} <ReactTimeago date={l.created_at} />
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
