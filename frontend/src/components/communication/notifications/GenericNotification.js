import {
  Avatar,
  IconButton,
  Link,
  ListItemAvatar,
  ListItemIcon,
  ListItemText,
  makeStyles,
} from "@material-ui/core";
import React, { useContext } from "react";
import { getLocalePrefix } from "../../../../public/lib/apiOperations";
import { getImageUrl } from "../../../../public/lib/imageOperations";
import UserContext from "../../context/UserContext";
import { StyledMenuItem } from "./Notification";
import CloseIcon from "@material-ui/icons/Close";
import Cookies from "universal-cookie";

const useStyles = makeStyles((theme) => {
  return {
    messageSender: {
      fontWeight: 600,
      width: "90%",
      whiteSpace: "normal",
      overflow: "hidden",
      WebkitBoxOrient: "vertical",
      display: "-webkit-box",
      wordBreak: "break-word",
    },
    listItemText: {
      whiteSpace: "normal",
    },
    goToInboxText: {
      textAlign: "center",
      display: "block",
      marginTop: theme.spacing(1),
    },
    notificationText: {
      width: "90%",
      whiteSpace: "normal",
      overflow: "hidden",
      WebkitBoxOrient: "vertical",
      display: "-webkit-box",
      WebkitLineClamp: "1",
      wordBreak: "break-word",
    },
    deleteIcon: {
      position: "absolute",
      right: 0,
    },
    content: {
      display: "flex",
      alignItems: "center"
    }
  };
});

export default function GenericNotification({
  link,
  primaryText,
  secondaryText,
  notificationIcon,
  avatar,
  notification,
}) {
  const token = new Cookies().get("auth_token");
  const { locale, setNotificationsRead, refreshNotifications, hideNotification } = useContext(
    UserContext
  );
  const classes = useStyles();

  const deleteNotification = async () => {
    hideNotification(notification.id);
    await setNotificationsRead(token, [notification], locale);
    await refreshNotifications();
  };

  return (
    <StyledMenuItem>
      <Link href={getLocalePrefix(locale) + link} underline="none">
        <div className={classes.content}>
          {avatar ? (
            <ListItemAvatar>
              <Avatar alt={avatar.alt} src={getImageUrl(avatar.image)} />
            </ListItemAvatar>
          ) : (
            <ListItemIcon>
              <notificationIcon.icon />
            </ListItemIcon>
          )}
          <ListItemText
            primary={primaryText}
            secondary={secondaryText}
            primaryTypographyProps={{
              className: classes.messageSender,
            }}
            secondaryTypographyProps={{
              className: classes.notificationText,
            }}
          />
        </div>
      </Link>
      <IconButton onClick={deleteNotification} className={classes.deleteIcon}>
        <CloseIcon />
      </IconButton>
    </StyledMenuItem>
  );
}
