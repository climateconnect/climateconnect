import { Avatar, Button, Card, CardHeader, Collapse } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import SendIcon from "@material-ui/icons/Send";
import React, { useContext, useState } from "react";
import { getImageUrl } from "../../../../public/lib/imageOperations";
import getTexts from "../../../../public/texts/texts";
import theme from "../../../themes/theme";
import UserContext from "../../context/UserContext";

const useStyles = makeStyles({
  root: {
    position: "relative",
  },
  smallAvatar: {
    height: theme.spacing(3),
    width: theme.spacing(3),
  },
  slideInCard: {
    width: 200,
    display: "flex",
    justifyContent: "center",
    backgroundColor: "#F8F8F8",
  },
  slideInRoot: {
    textAlign: "left",
  },
  slideInSubheader: {
    color: "black",
  },
  slideInTitle: {
    fontWeight: "bold",
  },
  contactButton: {
    width: 200,
    "&:hover": {
      background: theme.palette.primary.main,
    },
  },
});
export default function ContactCreatorButton({
  className,
  projectAdmin,
  contactProjectCreatorButtonRef,
  handleClickContact,
  smallScreen,
  tinyScreen,
}) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale: locale });
  const [hoveringButton, setHoveringButton] = useState(false);

  const handleMouseEnter = () => {
    setHoveringButton(true);
  };
  const handleMouseLeave = () => {
    setHoveringButton(false);
  };

  const creatorImageURL = getImageUrl(projectAdmin.thumbnail_image);
  const creatorName = projectAdmin.name;
  const creatorRole = projectAdmin.role;
  const buttonText = texts.contact;

  if (smallScreen) {
    return (
      <Button
        variant="contained"
        color="primary"
        startIcon={<SendIcon />}
        endIcon={<Avatar src={creatorImageURL} className={classes.smallAvatar} />}
        onClick={handleClickContact}
      >
        {buttonText}
      </Button>
    );
  } else if (tinyScreen) {
    return (
      <Button variant="contained" color="primary" onClick={handleClickContact}>
        {buttonText}
      </Button>
    );
  } else {
    return (
      <div
        className={`${classes.root} ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClickContact}
      >
        <Collapse in={hoveringButton} timeout={550}>
          <Card className={classes.slideInCard} variant="outlined">
            <CardHeader
              classes={{
                root: classes.slideInRoot,
                subheader: classes.slideInSubheader,
                title: classes.slideInTitle,
              }}
              avatar={<Avatar src={creatorImageURL} />}
              title={creatorName}
              subheader={creatorRole}
            />
          </Card>
        </Collapse>
        <Button
          className={classes.contactButton}
          variant="contained"
          color="primary"
          startIcon={<SendIcon />}
          endIcon={<Avatar src={creatorImageURL} className={classes.smallAvatar} />}
          ref={contactProjectCreatorButtonRef}
        >
          {buttonText}
        </Button>
      </div>
    );
  }
}
