import { Avatar, Button, Card, CardHeader, Collapse, Fade, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import SendIcon from "@material-ui/icons/Send";
import React, { useContext, useState } from "react";
import { getImageUrl } from "../../../../public/lib/imageOperations";
import getTexts from "../../../../public/texts/texts";
import theme from "../../../themes/theme";
import UserContext from "../../context/UserContext";

const useStyles = makeStyles({
  root: (props) => ({
    position: "relative",
    height: 40,
    width: props.customWidth ? props.customWidth : "auto",
    zIndex: 1,
  }),
  smallAvatar: {
    height: theme.spacing(3),
    width: theme.spacing(3),
  },
  slideInCard: (props) => ({
    display: "flex",
    justifyContent: "center",
    backgroundColor: "#F8F8F8",
    cursor: "pointer",
    width: props.customWidth ? props.customWidth : "auto",
  }),
  slideInRoot: {
    textAlign: "left",
  },
  slideInSubheader: {
    color: "black",
  },
  slideInTitle: {
    fontWeight: "bold",
  },
  buttonWithCollapseContainer: (props) => ({
    width: props.customWidth ? props.customWidth : "auto",
    position: "absolute",
    bottom: 0,
    right: 0,
  }),
  contactButton: (props) => ({
    display: "flex",
    flexDirection: "column",
    width: props.customWidth ? props.customWidth : "auto",
    "&:hover": {
      background: theme.palette.primary.main,
    },
  }),
  helperText: (props) => ({
    position: "absolute",
    fontSize: 13,
    textAlign: "center",
    cursor: "pointer",
    background: props.explanationBackground ? props.explanationBackground : "auto",
  }),
  largeButton: (props) => ({
    display: "flex",
    flexDirection: "column",
    width: props.customWidth ? props.customWidth : "auto",
  }),
  avatar: {
    height: 50,
    width: 50,
  },
});
export default function ContactCreatorButton({
  className,
  creator,
  contactProjectCreatorButtonRef,
  handleClickContact,
  tiny,
  small,
  isFixed,
  large,
  contentType,
  explanationBackground,
  withStartIcon,
  withAvatar,
  customWidth,
  withCard,
}) {
  const classes = useStyles({ explanationBackground: explanationBackground, customWidth: customWidth });
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale: locale, creator: creator });
  const [hoveringButton, setHoveringButton] = useState(false);

  const handleMouseEnter = () => {
    setHoveringButton(true);
  };
  const handleMouseLeave = () => {
    setHoveringButton(false);
  };

  const creatorImageURL = getImageUrl(creator?.thumbnail_image);
  const creatorName = creator?.name;
  const creatorsRoleInProject = creator?.role
    ? creator?.role
    : contentType === "idea"
    ? texts.responsible_person_idea
    : contentType === "organization"
    ? texts.responsible_person_org
    : texts.responsible_person_project;
  const buttonText = texts.contact;

  if (large) {
    return (
      <div className={`${classes.largeButton} ${className}`} onClick={handleClickContact}>
        <DetailledContactCreatorInfo
          creatorName={creatorName}
          creatorImageURL={creatorImageURL}
          creatorsRoleInProject={creatorsRoleInProject}
        />
        <Button variant="contained" color="primary">
          {buttonText}
        </Button>
      </div>
    );
  } else {
    return (
      <div
        className={withCard ? `${classes.root} ${className}` : null}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClickContact}
      >
        <div className={withCard ? classes.buttonWithCollapseContainer : null}>
          {withCard && (
          <Collapse in={hoveringButton} timeout={550}>
            <DetailledContactCreatorInfo
              creatorName={creatorName}
              creatorImageURL={creatorImageURL}
              creatorsRoleInProject={creatorsRoleInProject}
            />
          </Collapse>)}
          <Button
            className={withCard ? classes.contactButton : className}
            variant="contained"
            color="primary"
            startIcon={withStartIcon ? <SendIcon /> : null}
            endIcon={withAvatar ? <Avatar src={creatorImageURL} className={classes.smallAvatar} /> : null}
            ref={contactProjectCreatorButtonRef}
          >
            {buttonText}
          </Button>
          {!isFixed && (
            <Fade in={hoveringButton}>
              <Typography className={classes.helperText}>
                {
                  texts[
                    `contact_creator_to_know_more_about_${contentType ? contentType : "project"}`
                  ]
                }
              </Typography>
            </Fade>
          )}
        </div>
      </div>
    );
  }
}

const DetailledContactCreatorInfo = ({ creatorName, creatorImageURL, creatorsRoleInProject }) => {
  const classes = useStyles();

  return (
    <Card className={classes.slideInCard} variant="outlined">
      <CardHeader
        classes={{
          root: classes.slideInRoot,
          subheader: classes.slideInSubheader,
          title: classes.slideInTitle,
        }}
        avatar={<Avatar src={creatorImageURL} className={classes.avatar} />}
        title={creatorName}
        subheader={creatorsRoleInProject}
      />
    </Card>
  );
};
