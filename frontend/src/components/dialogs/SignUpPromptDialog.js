import { Button, TextField, Typography, Dialog, DialogTitle, IconButton } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React, {useState} from "react";
import CloseIcon from "@material-ui/icons/Close";
import { useMediaQuery } from "@material-ui/core";
import Cookies from "universal-cookie";
import Router from "next/router";

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    overflow: "hidden",
    display: "flex",
    flexDirection: "row",
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
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
  imageContainer: {
    display: "flex",
    width: "30%",
    [theme.breakpoints.down("sm")]: {
      width: "100%",
    },
  },

  infoContainer: {
    width: "70%",
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
      width: "100%",
      display: "flex",
      flexDirection: "column",
    },
  },
  buttonsContainer: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    textAlign: "right",
    [theme.breakpoints.down("sm")]: {
      textAlign: "center",
    },
  },
  title: {
    marginLeft: theme.spacing(-3),
    fontSize: 24,
    fontWeight: 700,
    color: theme.palette.grey[700],
  },
  subtitle: {
    color: theme.palette.grey[600],
    fontSize: 18,
    fontWeight: 600,
    marginBottom: theme.spacing(2),
  },
  text: {
    color: theme.palette.grey[600],
    fontWeight: 400,
  },
  emailInput: {
    width: "100%",
    [theme.breakpoints.down("sm")]: {
      width: "90%",
    },
  },
  img: {
    width: "100%",
    height: "100%",
  },
  textWithIcon: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing(2),
  },
  icon: {
    marginRight: theme.spacing(1.5),
  },
}));

export default function SignUpPromptDialog({
  image,
  infoTextOne,
  infoTextTwo,
  onClose,
  open,
  submitEmail,
  subTitle,
  title,
  buttonText,
}) {
  const classes = useStyles({ image: image });
  const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const [emailForSignUp, setEmailForSignUp] = useState("");
  const cookies = new Cookies();
  const applySubmit = () => {
   
    console.log("clicked");
    Router.push({
        pathname: '/signup',
        query: { email: emailForSignUp }
    })
    
  };

  const handleEmailChange = (event) => {
    setEmailForSignUp(event.target.value);
  }
  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ style: { borderRadius: 20 } }}>
      <form onSubmit={applySubmit}>
        <div className={classes.mainContainer}>
          {isSmallScreen ? (
            <>
              <InfoContainer
                title={title}
                subTitle={subTitle}
                handleEmailChange={handleEmailChange}
                infoTextOne={infoTextOne}
                infoTextTwo={infoTextTwo}
                buttonText={buttonText}
                onClose={onClose}
              />
              <ImageContainer image={image} />
            </>
          ) : (
            <>
              <ImageContainer image={image} />
              <InfoContainer
                title={title}
                subTitle={subTitle}
                handleEmailChange={handleEmailChange}
                infoTextOne={infoTextOne}
                infoTextTwo={infoTextTwo}
                buttonText={buttonText}
                onClose={onClose}
              />
            </>
          )}
        </div>
      </form>
    </Dialog>
  );
}

function ImageContainer({ image }) {
  const classes = useStyles();
  return (
    <div className={classes.imageContainer}>
      <img src={image} className={classes.img} />
    </div>
  );
}

function InfoContainer({
  buttonText,
  onClose,
  title,
  subTitle,
  infoTextOne,
  infoTextTwo,
  handleEmailChange
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
        icon={{
          icon: CloseIcon,
        }}
        text={infoTextOne}
      />
      <TextWithIcon
        icon={{
          icon: CloseIcon,
        }}
        text={infoTextTwo}
      />

      <TextField  onChange={(e) => handleEmailChange(e)} type="text" label={"E-mail"} variant="outlined" className={classes.emailInput} />

      <div className={classes.buttonsContainer}>
        <Button variant="contained" color="primary"  type="submit">
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
      <icon.icon className={classes.icon} />
      <Typography className={classes.text}>{text}</Typography>
    </span>
  );
}
