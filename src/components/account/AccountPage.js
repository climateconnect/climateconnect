import React from "react";
import { Container, Avatar, Typography, Chip, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  avatar: {
    height: theme.spacing(20),
    width: theme.spacing(20),
    margin: "0 auto",
    marginTop: theme.spacing(-11),
    fontSize: 50,
    backgroundcolor: "white",
    "& img": {
      objectFit: "contain",
      backgroundColor: "white"
    },
    border: `1px solid ${theme.palette.grey[300]}`
  },
  avatarWithInfo: {
    textAlign: "center",
    width: theme.spacing(40),
    margin: "0 auto",
    [theme.breakpoints.up("sm")]: {
      margin: 0,
      display: "inline-block",
      width: "auto"
    }
  },
  accountInfo: {
    padding: 0,
    marginTop: theme.spacing(1),
    [theme.breakpoints.up("sm")]: {
      paddingRight: theme.spacing(15)
    }
  },
  name: {
    fontWeight: "bold",
    padding: theme.spacing(1),
    paddingLeft: 0,
    paddingRight: 0
  },
  subtitle: {
    color: `${theme.palette.secondary.main}`
  },
  content: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    color: `${theme.palette.secondary.main}`,
    fontWeight: "bold"
  },
  noPadding: {
    padding: 0
  },
  infoContainer: {
    [theme.breakpoints.up("sm")]: {
      display: "flex"
    },
    position: "relative"
  },
  noprofile: {
    textAlign: "center",
    padding: theme.spacing(5)
  },
  marginTop: {
    marginTop: theme.spacing(1)
  },
  chip: {
    marginBottom: theme.spacing(1),
    marginRight: theme.spacing(1)
  },
  editButton: {
    position: "absolute",
    right: theme.spacing(1),
    width: theme.spacing(16),
    top: theme.spacing(12),
    [theme.breakpoints.up("sm")]: {
      top: theme.spacing(1)
    },
    [theme.breakpoints.down("xs")]: {
      width: theme.spacing(14),
      textAlign: "center"
    }
  }
}));

export default function AccountPage({ account, default_background, editHref, children }) {
  const classes = useStyles();

  const displayAccountInfo = info =>
    info.map(i => {
      const value = Array.isArray(i.value) ? i.value.join(", ") : i.value;
      const additionalText = i.additionalText ? i.additionalText : "";
      return (
        <div key={i.key}>
          <div className={classes.subtitle}>{i.name}:</div>
          <div className={classes.content}>{value + additionalText}</div>
        </div>
      );
    });

  return (
    <Container maxWidth="lg" className={classes.noPadding}>
      <div
        style={{
          background: `url(${
            account.background_image ? account.background_image : default_background
          })`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          width: "100%",
          height: 305
        }}
      />
      <Container className={classes.infoContainer}>
        <Button className={classes.editButton} color="primary" variant="contained" href={editHref}>
          Edit Profile
        </Button>
        <Container className={classes.avatarWithInfo}>
          <Avatar
            alt={account.name}
            component="div"
            size="large"
            src={"/images/" + account.image}
            className={classes.avatar}
          />
          <Typography variant="h5" className={classes.name}>
            {account.name}
          </Typography>
          <Container className={classes.noPadding}>
            {account.types &&
              account.types.map(type => <Chip label={type} key={type} className={classes.chip} />)}
          </Container>
        </Container>
        <Container className={classes.accountInfo}>{displayAccountInfo(account.info)}</Container>
      </Container>
      {children}
    </Container>
  );
}
