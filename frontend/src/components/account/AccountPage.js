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
  possibleAccountTypes,
  account,
  default_background,
  editHref,
  infoMetadata,
  children,
  isOwnAccount
}) {
  const classes = useStyles();
  const displayInfoArrayData = (key, infoEl) => {
    return (
      <div key={key} className={classes.infoElement}>
        <div className={classes.subtitle}>{infoEl.name}:</div>
        <div className={classes.chipArray}>
          {infoEl && infoEl.length > 0 ? (
            infoEl.value.map(entry => (
              <Chip size="medium" label={entry} key={entry} className={classes.chip} />
            ))
          ) : (
            <div className={classes.content}>{infoEl.missingMessage}</div>
          )}
        </div>
      </div>
    );
  };

  const displayAccountInfo = info =>
    Object.keys(info).map(key => {
      const i = getFullInfoElement(infoMetadata, key, info[key]);
      const value = Array.isArray(i.value) ? i.value.join(", ") : i.value;
      const additionalText = i.additionalText ? i.additionalText : "";
      if (i.type === "array") {
        return displayInfoArrayData(key, i);
      } else if (value) {
        return (
          <div key={key}>
            <div className={classes.subtitle}>{i.name}:</div>
            <div className={classes.content}>
              {value ? value + additionalText : i.missingMessage}
            </div>
          </div>
        );
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
            Edit Profile
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
              {getTypesOfAccount(account, possibleAccountTypes, infoMetadata).map(type => (
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

const getTypes = (possibleAccountTypes, infoMetadata) => {
  return possibleAccountTypes.map(type => {
    return {
      ...type,
      additionalInfo: type.additionalInfo.map(info => {
        return { ...infoMetadata[info], key: info };
      })
    };
  });
};

const getTypesOfAccount = (account, possibleAccountTypes, infoMetadata) => {
  return getTypes(possibleAccountTypes, infoMetadata).filter(type =>
    account.types.includes(type.key)
  );
};
