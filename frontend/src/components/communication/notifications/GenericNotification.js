import {
  Avatar,
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

const useStyles = makeStyles((theme) => {
  return {
    messageSender: {
      fontWeight: 600,
      whiteSpace: "normal",
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
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
  };
});

export default function GenericNotification({
  link,
  primaryText,
  secondaryText,
  notificationIcon,
  avatar,
}) {
  const { locale } = useContext(UserContext);
  const classes = useStyles();
  return (
    <Link href={getLocalePrefix(locale) + link} underline="none">
      <StyledMenuItem>
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
      </StyledMenuItem>
    </Link>
  );
}
