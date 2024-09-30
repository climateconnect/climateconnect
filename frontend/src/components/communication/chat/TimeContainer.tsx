import React, {useContext} from "react";
import UserContext from "../../context/UserContext";
import makeStyles from "@mui/styles/makeStyles";
import { CircularProgress, Link, Tooltip, Typography } from "@mui/material";
import getTexts from "../../../../public/texts/texts";

const useStyles = makeStyles((theme)=>({
  time: {
    fontSize: 10,
    float: "right",
    marginRight: theme.spacing(-3),
    color: theme.palette.secondary.main,
  },
  clearfix: {
    "&::after": {
      content: '""',
      display: "table",
      clear: "both",
    },
  },
  timeContainer: {
    paddingLeft: theme.spacing(4),
  },
  sentTime: {
     color: "white"
  },
  receivedText: {
    color: "#484848",
  },
  loader: {
    display: "inline-block",
    marginRight: theme.spacing(0.25),
  }
}));

const TimeContainer = ({received, unconfirmed, sentDate}) => {
  const classes = useStyles();
  const { user, locale } = useContext(UserContext);
  const texts = getTexts({ page: "chat", locale: locale });

  return (
    <div className={`${classes.timeContainer} ${classes.clearfix} `}>
      <div className={`${classes.time} ${received ? classes.receivedText : classes.sentTime }`}>
        {unconfirmed && (
          <Tooltip title={texts.sending_message + "..."}>
            <CircularProgress size={10} color="inherit" className={classes.loader} />
          </Tooltip>
        )}
        {sentDate}
      </div>
    </div>
  );
};

export default TimeContainer;
