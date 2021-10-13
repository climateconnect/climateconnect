import { Card, Avatar, Button, Container, CardHeader, Collapse, Slide } from "@material-ui/core";
import SendIcon from "@material-ui/icons/Send";
import { makeStyles } from "@material-ui/core/styles";
import React, { useContext, useState } from "react";
import { getImageUrl } from "../../../public/lib/imageOperations";
import theme from "../../themes/theme";
import UserContext from "../context/UserContext";
import getTexts from "../../../public/texts/texts";

const useStyles = makeStyles({
  root: {
    position: "relative",
  },
  floatingElement: {
    position: "absolute",
    bottom: 0,
    right: 0,
  },
  smallAvatar: {
    height: theme.spacing(3),
    width: theme.spacing(3),
  },
  rootCardHeader: {
    textAlign: "left",
  },
  slideInCard: {
    display: "flex",
    justifyContent: "center",
    backgroundColor: "#F8F8F8",
  },
  slideInSubheader: {
    color: "black",
  },
  slideInTitle: {
    fontWeight: "bold",
  },
  sendMessageButton: {
    width: 200,
    overflow: "hidden",
    "&:hover": {
      background: theme.palette.primary.main,
    },
  },
});
export default function FloatingMessageButton({
  className,
  projectAdmin,
  contactProjectCreatorButtonRef,
  handleClickContact,
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

  return (
    <Container className={`${classes.root} ${className}`}>
      <div className={classes.floatingElement}>
        <Collapse in={hoveringButton} timeout={550}>
          <Card className={classes.slideInCard} variant="outlined">
            <CardHeader
              classes={{
                root: classes.rootCardHeader,
                subheader: classes.slideInSubheader,
                title: classes.slideInTitle,
              }}
              avatar={<Avatar src={getImageUrl(projectAdmin.thumbnail_image)} />}
              title={projectAdmin.name}
              subheader={texts.project_manager}
            />
          </Card>
        </Collapse>
        <Button
          className={classes.sendMessageButton}
          variant="contained"
          color="primary"
          startIcon={<SendIcon />}
          endIcon={
            <Slide in={!hoveringButton} direction="left" unmountOnExit>
              <Avatar
                src={getImageUrl(projectAdmin.thumbnail_image)}
                className={classes.smallAvatar}
              />
            </Slide>
          }
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleClickContact}
          ref={contactProjectCreatorButtonRef}
        >
          {texts.contact}
        </Button>
      </div>
    </Container>
  );
}
