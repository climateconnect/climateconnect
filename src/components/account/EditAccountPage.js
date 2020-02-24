import React from "react";
import { Container, Avatar, Chip, Button, TextField } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import AddAPhotoIcon from "@material-ui/icons/AddAPhoto";
import DoneIcon from "@material-ui/icons/Done";
import UploadImageDialog from "./../dialogs/UploadImageDialog";

const useStyles = makeStyles(theme => ({
  backgroundContainer: {
    width: "100%",
    height: 305,
    position: "relative",
    cursor: "pointer"
  },
  photoIcon: {
    position: "absolute",
    left: "-50%",
    top: "-50%",
    cursor: "pointer"
  },
  backgroundPhotoIcon: {
    fontSize: 80
  },
  avatarPhotoIcon: {
    fontSize: 40
  },
  backgroundPhotoIconContainer: {
    position: "absolute",
    left: "calc(50% - 40px)",
    top: "calc(50% - 40px)"
  },
  avatarPhotoIconContainer: {
    position: "absolute",
    left: "calc(50% - 20px)",
    top: "calc(50% - 20px)"
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
  avatarContainer: {
    height: theme.spacing(20),
    width: theme.spacing(20),
    margin: "0 auto",
    marginTop: theme.spacing(-11),
    position: "relative",
    borderRadius: 100,
    cursor: "pointer"
  },
  avatar: {
    height: "100%",
    width: "100%",
    fontSize: 50,
    backgroundColor: "white",
    "& img": {
      objectFit: "contain",
      opacity: 0.5,
      cursor: "pointer"
    },
    border: `1px solid ${theme.palette.grey[300]}`
  },
  accountInfo: {
    padding: 0,
    marginTop: theme.spacing(1),
    [theme.breakpoints.up("sm")]: {
      paddingRight: theme.spacing(17)
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
    margin: theme.spacing(0.5)
  },
  actionButton: {
    position: "absolute",
    right: theme.spacing(1),
    width: theme.spacing(18),
    [theme.breakpoints.down("xs")]: {
      width: theme.spacing(14),
      fontSize: 10,
      textAlign: "center"
    }
  },
  saveButton: {
    top: theme.spacing(11.5),
    [theme.breakpoints.up("sm")]: {
      top: theme.spacing(1)
    }
  },
  cancelButton: {
    top: theme.spacing(16.5),
    [theme.breakpoints.up("sm")]: {
      top: theme.spacing(6.5)
    }
  },
  chipArray: {
    display: "flex",
    flexWrap: "wrap",
    padding: theme.spacing(0.5)
  }
}));

export default function EditAccountPage({ account, children }) {
  const classes = useStyles();
  const [editedAccount, setEditedAccount] = React.useState(account);
  //used for previwing images in UploadImageDialog
  const [tempImages, setTempImages] = React.useState({
    image: account.image,
    background_image: account.background_image
  });
  const [backgroundDialogOpen, setBackgroundDialogOpen] = React.useState(false);
  const [avatarDialogOpen, setAvatarDialogOpen] = React.useState(false);

  const handleBackgroundClickOpen = () => {
    setBackgroundDialogOpen(true);
  };

  const handleAvatarClickOpen = () => {
    setAvatarDialogOpen(true);
  };

  const handleBackgroundClose = image => {
    setBackgroundDialogOpen(false);
    console.log(image);
    console.log(image instanceof HTMLImageElement);
    if (image && image instanceof HTMLImageElement)
      setEditedAccount({ ...editedAccount, background_image: image.toDataURL() });
    console.log(editedAccount);
  };

  const handleAvatarClose = image => {
    setAvatarDialogOpen(false);
    if (image && image instanceof HTMLImageElement)
      setEditedAccount({ ...editedAccount, image: image.toDataURL() });
  };

  console.log(account);
  const displayArrayData = array => {
    return (
      <div key={array.key}>
        <div className={classes.subtitle}>{array.name}:</div>
        <div className={classes.chipArray}>
          {array.value.map(entry => (
            <Chip
              size="medium"
              label={entry}
              key={array.value.indexOf(entry)}
              /*onClick={handleClick}
            onDelete={handleDelete}*/
              className={classes.chip}
              deleteIcon={<DoneIcon />}
            />
          ))}
        </div>
      </div>
    );
  };

  const displayAccountInfo = info =>
    info.map((i, index) => {
      const handleChange = event => {
        setEditedAccount(() => {
          console.log(editedAccount);
          const ret = editedAccount;
          ret.info[index].value = event.target.value;
          return ret;
        });
      };
      const additionalText = i.additionalText ? i.additionalText : "";
      if (Array.isArray(i.value)) {
        return displayArrayData(i);
      } else {
        return (
          <div key={i.key}>
            <div className={classes.subtitle}>{i.name}:</div>
            <TextField fullWidth defaultValue={i.value} multiline onChange={handleChange} />
            {additionalText && <div>{additionalText}</div>}
          </div>
        );
      }
    });

  const onBackgroundChange = backgroundEvent => {
    setTempImages(() => {
      return {
        ...tempImages,
        background_image: URL.createObjectURL(backgroundEvent.target.files[0])
      };
    });
    handleBackgroundClickOpen();
    /*setEditedAccount(() => {
      return {...editedAccount, background_image:URL.createObjectURL(backgroundEvent.target.files[0])};
    })*/
  };

  const onAvatarChange = avatarEvent => {
    setTempImages(() => {
      return { ...tempImages, image: URL.createObjectURL(avatarEvent.target.files[0]) };
    });
    handleAvatarClickOpen();
    /*setEditedAccount(() => {
      return {...editedAccount, image:URL.createObjectURL(avatarEvent.target.files[0])};
    })*/
  };

  return (
    <Container maxWidth="lg" className={classes.noPadding}>
      <div className={classes.backgroundContainer}>
        <label htmlFor="backgroundPhoto">
          <input
            type="file"
            name="backgroundPhoto"
            id="backgroundPhoto"
            style={{ display: "none" }}
            onChange={onBackgroundChange}
          />
          <img src={editedAccount.background_image} />
          <div className={classes.backgroundPhotoIconContainer}>
            <AddAPhotoIcon className={`${classes.photoIcon} ${classes.backgroundPhotoIcon}`} />
          </div>
        </label>
      </div>
      <Container className={classes.infoContainer}>
        <Button
          className={`${classes.saveButton} ${classes.actionButton}`}
          color="primary"
          variant="contained"
          href={"/"}
        >
          Save Changes
        </Button>
        <Button
          className={`${classes.cancelButton} ${classes.actionButton}`}
          color="secondary"
          variant="contained"
          href={"/"}
        >
          Cancel
        </Button>
        <Container className={classes.avatarWithInfo}>
          <div className={classes.avatarContainer}>
            <label htmlFor="avatarPhoto">
              <input
                type="file"
                name="avatarPhoto"
                id="avatarPhoto"
                style={{ display: "none" }}
                onChange={onAvatarChange}
              />
              <Avatar
                alt={account.name}
                component="div"
                size="large"
                src={editedAccount.image}
                className={classes.avatar}
              />

              <div className={classes.avatarPhotoIconContainer}>
                <AddAPhotoIcon className={`${classes.photoIcon} ${classes.avatarPhotoIcon}`} />
              </div>
            </label>
          </div>

          <TextField className={classes.name} fullWidth defaultValue={account.name} multiline />
          {account.types && (
            <Container className={classes.noPadding}>
              {account.types.map(type => (
                <Chip label={type} key={type} className={classes.chip} />
              ))}
            </Container>
          )}
        </Container>
        <Container className={classes.accountInfo}>{displayAccountInfo(account.info)}</Container>
      </Container>
      {children}
      <UploadImageDialog
        onClose={handleBackgroundClose}
        open={backgroundDialogOpen}
        image={tempImages.background_image}
        height={200}
        mobileHeight={80}
        mediumHeight={120}
        ratio={3}
      />
      <UploadImageDialog
        onClose={handleAvatarClose}
        open={avatarDialogOpen}
        image={tempImages.image}
        borderRadius={10000}
        height={300}
        ratio={1}
      />
    </Container>
  );
}
