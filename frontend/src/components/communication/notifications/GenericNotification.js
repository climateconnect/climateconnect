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

import CloseIcon from '@material-ui/icons/Close';
import Cookies from "universal-cookie";

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
  notification
}) {
  const token = new Cookies().get("auth_token");
  const { locale } = useContext(UserContext);
  const classes = useStyles()
  const {setNotificationsRead, refreshNotifications } = useContext(UserContext);
  const deleteNotification =  async () => {
    const notificationAsArr = [notification];
    await setNotificationsRead(token, notificationAsArr, locale)
    await refreshNotifications()
  }


  return (
      <StyledMenuItem >      
        {avatar ? (
          <ListItemAvatar>
            <Avatar alt={avatar.alt} src={getImageUrl(avatar.image)} />
          </ListItemAvatar>
        ) : (
          <ListItemIcon>
            <notificationIcon.icon />
          </ListItemIcon>
        )}
         <Link href={getLocalePrefix(locale) + link} underline="none">
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
         </Link>
         <IconButton onClick={deleteNotification} >
          <CloseIcon></CloseIcon>
         </IconButton>
        
      </StyledMenuItem>
     
  );
}
