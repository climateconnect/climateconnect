import { Button, TextField, Typography, Dialog, DialogTitle, IconButton } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React, { useState, useContext } from "react";
import CloseIcon from "@material-ui/icons/Close";
import { useMediaQuery } from "@material-ui/core";
import Router from "next/router";
import UserContext from "../context/UserContext";
import getTexts from "../../../public/texts/texts";
import { getLocalePrefix } from "../../../public/lib/apiOperations";

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    display: "flex",
    flexDirection: "row",
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
     
    },
  },
  dialog: { 
    maxWidth: "750px" ,
    borderRadius: 20,
    [theme.breakpoints.down("sm")]: {
      minWidth: "375px",
      maxWidth: "500px",
    },
  },

  closeButtonRight: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    [theme.breakpoints.down("sm")]: {
      top: theme.spacing(2.5),
      right: theme.spacing(2.5),
    },
  },
  imageContainer: (props) =>  ({
   
    background: `url('${props.image}')`,
    backgroundSize: "cover",
    backgroundPositionX: "-110px",
    position: "relative",
    width: "30%",
    
    [theme.breakpoints.down("sm")]: {
      width: "100%",
      backgroundPositionX: "0px",
      },
  }),

  infoContainer: {
    width: "70%",
    //backgroundColor: "#000000",
    marginLeft: theme.spacing(3),
    marginRight: theme.spacing(3), // this isnt applying to small screen, uncomment color to see 
    [theme.breakpoints.down("sm")]: {
      width: "87%",   // using custom width here to have same margin/similar on right as left
      
    },
  },
  buttonsContainer: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    textAlign: "right",
    [theme.breakpoints.down("sm")]: {
      textAlign: "center", // button is not centered because above right margin isnt applying
      marginBottom: theme.spacing(5),
    },
  },
  title: {
    marginLeft: theme.spacing(-3),
    fontSize: 24,
    fontWeight: "bold",
    color: "#707070",
  },
  subtitle: {
    color: "#707070",
    fontSize: 18,
    fontWeight: 600,
    marginBottom: theme.spacing(2),
  },
  text: {
    color: "#707070",
    fontWeight: 400,
  },
  emailInput: {
    width: "100%",
    
    
  },
  img: {
    visibility: "hidden",
    width: "100%",
    
  },
  logo: {
    position: "absolute",
    left: "50%",
    transform: "translate(-50%, -25%)",
    top: "25%",
    
    width:"65%",
    height:"65%",
    [theme.breakpoints.down("sm")]: {
      
      transform: "translate(-50%, -55%)",
      top: "25%",
    },

  },
  textWithIcon: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing(2),
  },
  icon: {
    height:"50px",
    marginRight: theme.spacing(1.5),
  },
}));

export default function SignUpPromptDialog({
  buttonText,
  image,
  infoTextOne,
  infoTextTwo,
  onClose,
  open,
  subTitle,
  title,
}) {
  const classes = useStyles({ image: image });
  const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const [emailForSignUp, setEmailForSignUp] = useState("");
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "general", locale: locale });

  const applySubmit = () => {
    Router.push({
      pathname: getLocalePrefix(locale) + "/signup",
      query: { email: emailForSignUp },
    });
  };

  const handleEmailChange = (event) => {
    setEmailForSignUp(event.target.value);
  };
  return (
    <Dialog open={open}  onClose={onClose} classes={{ paper: classes.dialog}}>
      <div className={classes.mainContainer}>
        {isSmallScreen ? (
          <>
            <InfoContainer
              applySubmit={applySubmit}
              buttonText={buttonText}
              handleEmailChange={handleEmailChange}
              infoTextOne={infoTextOne}
              infoTextTwo={infoTextTwo}
              onClose={onClose}
              subTitle={subTitle}
              texts={texts}
              title={title}
            />
            <ImageContainer image={image} />
          </>
        ) : (
          <>
            <ImageContainer image={image} />
            <InfoContainer
              applySubmit={applySubmit}
              buttonText={buttonText}
              handleEmailChange={handleEmailChange}
              infoTextOne={infoTextOne}
              infoTextTwo={infoTextTwo}
              onClose={onClose}
              subTitle={subTitle}
              texts={texts}
              title={title}
            />
          </>
        )}
      </div>
    </Dialog>
  );
}

function ImageContainer({ image }) {
  const classes = useStyles({image: image});
  return (
    <div className={classes.imageContainer}>
      <img src={image} className={classes.img} />
      <img src={"/images/climate_connect_logo.svg"} className={classes.logo} />
    </div>
  );
}

function InfoContainer({
  applySubmit,
  buttonText,
  handleEmailChange,
  infoTextOne,
  infoTextTwo,
  onClose,
  subTitle,
  texts,
  title,
}) {
  const classes = useStyles();
  return (
    <div className={classes.infoContainer}>
      <DialogTitle>
        <Typography className={classes.title}>{title}</Typography>
        <IconButton
          aria-label="close"
          className={classes.closeButtonRight}
          onClick={onClose}
          size={"small"}
        >
          <CloseIcon color="primary" />
        </IconButton>
      </DialogTitle>
      <Typography className={classes.subtitle}>{subTitle}</Typography>
      <TextWithIcon
        icon="/images/like_icon_with_background.svg"
        text={infoTextOne}
      />
      <TextWithIcon
        icon= "/images/mail_icon_with_background.svg"
        text={infoTextTwo}
      />

      <TextField
        className={classes.emailInput}
        label={texts.email}
        onChange={(e) => handleEmailChange(e)}
        type="text"
        variant="outlined"
      />

      <div className={classes.buttonsContainer}>
        <Button variant="contained" color="primary" onClick={applySubmit}>
          {buttonText}
        </Button>
      </div>
    </div>
  );
}

function TextWithIcon({ text, icon }) {
  const classes = useStyles();
  return (
    <span className={classes.textWithIcon}>
      <img src={icon} className={classes.icon} />
      <Typography className={classes.text}>{text}</Typography>
    </span>
  );
}
