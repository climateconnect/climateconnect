import { Avatar, Button, Card, CardHeader, Collapse, Fade, Typography } from "@material-ui/core";
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
    height: 40,
    width: 200,
    zIndex: 1,
  },
  smallAvatar: {
    height: theme.spacing(3),
    width: theme.spacing(3),
  },
  slideInCard: {
    display: "flex",
    justifyContent: "center",
    backgroundColor: "#F8F8F8",
    cursor: "pointer",
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
  buttonWithCollapseContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
  },
  contactButton: {
    width: 200,
    "&:hover": {
      background: theme.palette.primary.main,
    },
  },
  helperText: (props) => ({
    position: "absolute",
    fontSize: 13,
    textAlign: "center",
    cursor: "pointer",
    background: props.explanationBackground ? props.explanationBackground : "auto",
  }),
  detailledInfoMaxWidth: {
    width: 200,
  },
  largeButton: {
    display: "flex",
    flexDirection: "column",
    width: 300,
  },
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
}) {
  const classes = useStyles({ explanationBackground: explanationBackground });
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

  if (small) {
    return (
      <Button
        variant="contained"
        color="primary"
        startIcon={<SendIcon />}
        endIcon={<Avatar src={creatorImageURL} className={classes.smallAvatar} />}
        onClick={handleClickContact}
        className={className}
      >
        {buttonText}
      </Button>
    );
  } else if (tiny) {
    return (
      <Button
        variant="contained"
        color="primary"
        onClick={handleClickContact}
        className={className}
      >
        {buttonText}
      </Button>
    );
  } else if (large) {
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
        className={`${classes.root} ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClickContact}
      >
        <div className={classes.buttonWithCollapseContainer}>
          <Collapse in={hoveringButton} timeout={550}>
            <DetailledContactCreatorInfo
              className={classes.detailledInfoMaxWidth}
              creatorName={creatorName}
              creatorImageURL={creatorImageURL}
              creatorsRoleInProject={creatorsRoleInProject}
            />
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
