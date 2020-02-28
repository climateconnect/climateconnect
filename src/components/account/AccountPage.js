import React from "react";
import { Container, Avatar, Typography, Chip, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import profile_info_metadata from "./../../../public/data/profile_info_metadata.json";
import organization_info_metadata from "./../../../public/data/organization_info_metadata.json";
import profile_types from "./../../../public/data/profile_types.json";
import organization_types from "./../../../public/data/organization_types.json";

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

export default function AccountPage({ type, account, default_background, editHref, children }) {
  const classes = useStyles();

  const displayInfoArrayData = (key, infoEl) => {
    return (
      <div key={key} className={classes.infoElement}>
        <div className={classes.subtitle}>{infoEl.name}:</div>
        <div className={classes.chipArray}>
          {infoEl.value.map(entry => (
            <Chip size="medium" label={entry} key={entry} className={classes.chip} />
          ))}
        </div>
      </div>
    );
  };

  const displayAccountInfo = info =>
    Object.keys(info).map(key => {
      const i = getFullInfoElement(key, info[key], type);
      const value = Array.isArray(i.value) ? i.value.join(", ") : i.value;
      const additionalText = i.additionalText ? i.additionalText : "";
      if (i.type === "array") {
        return displayInfoArrayData(key, i);
      } else {
        return (
          <div key={key}>
            <div className={classes.subtitle}>{i.name}:</div>
            <div className={classes.content}>{value + additionalText}</div>
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
        <Button className={classes.editButton} color="primary" variant="contained" href={editHref}>
          Edit Profile
        </Button>
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
          <Container className={classes.noPadding}>
            {account.types &&
              getTypesOfAccount(type, account).map(type => (
                <Chip label={type.name} key={type.key} className={classes.chip} />
              ))}
          </Container>
        </Container>
        <Container className={classes.accountInfo}>{displayAccountInfo(account.info)}</Container>
      </Container>
      {children}
    </Container>
  );
}

//below functions will be replaced with db call later --> potentially retrieve these props directly on the page instead of on the component
const getInfoMetadata = accountType => {
  if (accountType !== "profile" && accountType != "organization")
    throw new Error('accountType has to be "profile" or "organization".');
  return accountType === "profile" ? profile_info_metadata : organization_info_metadata;
};

const getFullInfoElement = (key, value, type) => {
  if (type === "profile") return { ...profile_info_metadata[key], value: value };
  if (type === "organization") return { ...organization_info_metadata[key], value: value };
};

const getTypes = accountType => {
  if (accountType !== "profile" && accountType != "organization")
    throw new Error('accountType has to be "profile" or "organization".');
  const types =
    accountType === "profile" ? profile_types.profile_types : organization_types.organization_types;
  return types.map(type => {
    return {
      ...type,
      additionalInfo: type.additionalInfo.map(info => {
        return { ...getInfoMetadata(accountType)[info], key: info };
      })
    };
  });
};

const getTypesOfAccount = (type, account) => {
  if (type !== "profile" && type != "organization")
    throw new Error('type has to be "profile" or "organization".');
  return getTypes(type).filter(type => account.types.includes(type.key));
};
