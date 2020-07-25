import React from "react";
import { Container, Avatar, Typography, Chip, Button, Link } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import MiniOrganizationPreview from "../organization/MiniOrganizationPreview";
import Linkify from "react-linkify";

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
    }
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

export default function AccountPage({
  account,
  default_background,
  editHref,
  infoMetadata,
  children,
  isOwnAccount,
  editText
}) {
  const classes = useStyles();

  const componentDecorator = (href, text, key) => (
    <Link
      color="primary"
      underline="always"
      href={href}
      key={key}
      target="_blank"
      rel="noopener noreferrer"
    >
      {text}
    </Link>
  );

  const displayAccountInfo = info =>
    Object.keys(info).map((key, index) => {
      if (info[key]) {
        const i = getFullInfoElement(infoMetadata, key, info[key]);
        const value = Array.isArray(i.value) ? i.value.join(", ") : i.value;
        const additionalText = i.additionalText ? i.additionalText : "";
        if (key === "parent_organization") {
          if (value.name)
            return (
              <div key={index} className={classes.subtitle}>
                {account.name} is a suborganization of{" "}
                <Link color="inherit" href={"/organizations/" + value.url_slug} target="_blank">
                  <MiniOrganizationPreview organization={value} size="small" />
                </Link>
              </div>
            );
        } else if (i.type === "array") {
          return (
            <div key={index} className={classes.infoElement}>
              <div className={classes.subtitle}>{i.name}:</div>
              <div className={classes.chipArray}>
                {i && i.value && i.value.length > 0
                  ? i.value.map(entry => (
                      <Chip size="medium" label={entry} key={entry} className={classes.chip} />
                    ))
                  : i.missingMessage && <div className={classes.content}>{i.missingMessage}</div>}
              </div>
            </div>
          );
        } else if (i.linkify && value) {
          return (
            <>
              <div className={classes.subtitle}>{i.name}:</div>
              <Linkify componentDecorator={componentDecorator} key={index}>
                <div className={classes.content}>{value}</div>
              </Linkify>
            </>
          );
        } else if (value) {
          return (
            <div key={index}>
              <div className={classes.subtitle}>{i.name}:</div>
              <div className={classes.content}>
                {value ? value + additionalText : i.missingMessage}
              </div>
            </div>
          );
        }
      }
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
        {isOwnAccount && (
          <Button
            className={classes.editButton}
            color="primary"
            variant="contained"
            href={editHref}
          >
            {editText ? editText : "Edit Profile"}
          </Button>
        )}
        <Container className={classes.avatarWithInfo}>
          <Avatar
            alt={account.name}
            component="div"
            size="large"
            src={account.image}
            className={classes.avatar}
          />
          <Typography variant="h5" className={classes.name}>
            {account.name}
          </Typography>
          {account.types && (
            <Container className={classes.noPadding}>
              {account.types.map(type => (
                <Chip label={type.name} key={type.key} className={classes.chip} />
              ))}
            </Container>
          )}
        </Container>
        <Container className={classes.accountInfo}>{displayAccountInfo(account.info)}</Container>
      </Container>
      {children}
    </Container>
  );
}

//below functions will be replaced with db call later --> potentially retrieve these props directly on the page instead of on the component

const getFullInfoElement = (infoMetadata, key, value) => {
  return { ...infoMetadata[key], value: value };
};
