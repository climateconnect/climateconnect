import React from "react";
import { Container, Avatar, Chip, Button, TextField, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import AddAPhotoIcon from "@material-ui/icons/AddAPhoto";
import ControlPointIcon from "@material-ui/icons/ControlPoint";
import UploadImageDialog from "./../dialogs/UploadImageDialog";
import EnterTextDialog from "./../dialogs/EnterTextDialog";
import ConfirmDialog from "./../dialogs/ConfirmDialog";
import SelectField from "./../general/SelectField";
import SelectDialog from "./../dialogs/SelectDialog";

const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg"];
const DEFAULT_AVATAR_IMAGE = "/images/background1.jpg";
const DEFAULT_BACKGROUND_IMAGE = "/images/background1.jpg";

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
  backgroundImage: props => ({
    backgroundImage: `url(${props.background_image})`,
    backgroundPosition: "center",
    backgroundSize: "cover"
  }),
  backgroundColor: {
    backgroundColor: "#e0e0e0"
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
  backgroundLabel: {
    width: "100%",
    height: "100%",
    display: "block",
    cursor: "pointer"
  },
  avatarPhotoIconContainer: {
    position: "absolute",
    left: "calc(50% - 20px)",
    top: "calc(50% - 20px)"
  },
  avatarButtonContainer: {
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: "translate(-50%,-50%)"
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
  infoElement: {
    marginBottom: theme.spacing(1)
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
  noPadding: {
    padding: 0
  },
  infoContainer: {
    [theme.breakpoints.up("sm")]: {
      display: "flex"
    },
    position: "relative"
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
  },
  selectOption: {
    width: 250
  },
  dialogWidth: {
    width: 400
  },
  centerText: {
    textAlign: "center"
  }
}));

export default function EditAccountPage({
  account,
  possibleAccountTypes,
  maxAccountTypes,
  infoMetadata,
  children,
  handleSubmit,
  submitMessage,
  handleCancel,
  errorMessage
}) {
  const [editedAccount, setEditedAccount] = React.useState(account);
  const classes = useStyles(editedAccount);
  //used for previewing images in UploadImageDialog
  const [tempImages, setTempImages] = React.useState({
    image: editedAccount.image ? editedAccount.image : DEFAULT_AVATAR_IMAGE,
    background_image: editedAccount.background_image
      ? editedAccount.background_image
      : DEFAULT_BACKGROUND_IMAGE
  });

  const [open, setOpen] = React.useState({
    backgroundDialog: false,
    avatarDialog: false,
    addTypeDialog: false,
    confirmExitDialog: false
  });

  const handleDialogClickOpen = dialogKey => {
    setOpen({ ...open, [dialogKey]: true });
  };

  const handleBackgroundClose = image => {
    setOpen({ ...open, backgroundDialog: false });
    if (image && image instanceof HTMLCanvasElement)
      setEditedAccount({ ...editedAccount, background_image: image.toDataURL() });
  };

  const handleAvatarClose = image => {
    setOpen({ ...open, avatarDialog: false });
    if (image && image instanceof HTMLCanvasElement) {
      setEditedAccount({ ...editedAccount, image: image.toDataURL() });
    }
  };

  const handleAddTypeClose = (type, additionalInfo) => {
    setOpen({ ...open, addTypeDialog: false });
    const tempAccount = editedAccount;
    if (additionalInfo) {
      for (const info of additionalInfo) {
        tempAccount.info[info.key] = info.value;
      }
    }
    tempAccount.types = [...tempAccount.types, type];
    setEditedAccount(tempAccount);
  };

  const handleConfirmExitClose = exit => {
    setOpen({ ...open, confirmExitDialog: false });
    if (exit) handleCancel();
  };

  const deleteFromInfoArray = (key, entry) => {
    setEditedAccount({
      ...editedAccount,
      info: {
        ...editedAccount.info,
        [key]: editedAccount.info[key].filter(val => val !== entry)
      }
    });
  };

  const displayInfoArrayData = (key, infoEl) => {
    const [arrayDialogOpen, setArrayDialogOpen] = React.useState(false);

    const handleTextDialogClose = element => {
      setArrayDialogOpen(false);
      if (element && element.length > 0) {
        setEditedAccount({
          ...editedAccount,
          info: { ...editedAccount.info, [key]: [...editedAccount.info[key], element] }
        });
      }
    };

    const handleArrayDialogClickOpen = () => setArrayDialogOpen(true);
    return (
      <div key={key} className={classes.infoElement}>
        <div className={classes.subtitle}>{infoEl.name}:</div>
        <div className={classes.chipArray}>
          {infoEl.value.map(entry => (
            <Chip
              size="medium"
              label={entry}
              key={entry}
              className={classes.chip}
              onDelete={() => deleteFromInfoArray(key, entry)}
            />
          ))}
          {editedAccount.info[key].length < infoEl.maxEntries && (
            <Chip
              label="Add"
              icon={<ControlPointIcon />}
              className={classes.chip}
              onClick={handleArrayDialogClickOpen}
            />
          )}
          <EnterTextDialog
            onClose={handleTextDialogClose}
            open={arrayDialogOpen}
            arrayName={infoEl.name}
            title={"Add skill"}
            inputLabel={"Skill"}
            applyText={"Add"}
            maxLength={30}
            className={classes.dialogWidth}
          />
        </div>
      </div>
    );
  };

  const displayAccountInfo = info =>
    Object.keys(info).map(key => {
      const handleChange = event => {
        if (event.target.type === "select-one") {
          const value = event.target.options[event.target.options.selectedIndex].getAttribute(
            "data-key"
          );
          setEditedAccount({
            ...editedAccount,
            info: { ...editedAccount.info, [key]: value }
          });
        } else {
          setEditedAccount({
            ...editedAccount,
            info: { ...editedAccount.info, [key]: event.target.value }
          });
        }
      };
      const i = getFullInfoElement(infoMetadata, key, info[key]);
      if (i.type === "array") {
        return displayInfoArrayData(key, i);
      } else if (i.type === "select") {
        return (
          <div key={key} className={classes.infoElement}>
            <SelectField
              className={classes.selectOption}
              values={i.options}
              label={i.name}
              defaultValue={i.value}
              onChange={handleChange}
            />
          </div>
        );
      } else {
        return (
          <div key={key} className={classes.infoElement}>
            <div className={classes.subtitle}>{i.name}:</div>
            <TextField fullWidth defaultValue={i.value} multiline onChange={handleChange} />
          </div>
        );
      }
    });

  const onBackgroundChange = backgroundEvent => {
    const file = backgroundEvent.target.files[0];
    if (!file || !file.type || !ACCEPTED_IMAGE_TYPES.includes(file.type))
      alert("Please upload either a png or a jpg file.");

    setTempImages(() => {
      return {
        ...tempImages,
        background_image: URL.createObjectURL(file)
      };
    });
    handleDialogClickOpen("backgroundDialog");
  };

  const onAvatarChange = avatarEvent => {
    const file = avatarEvent.target.files[0];
    if (!file || !file.type || !ACCEPTED_IMAGE_TYPES.includes(file.type))
      alert("Please upload either a png or a jpg file.");

    setTempImages(() => {
      return { ...tempImages, image: file };
    });
    handleDialogClickOpen("avatarDialog");
  };

  const handleTypeDelete = typeToDelete => {
    const tempEditedAccount = { ...editedAccount };
    const fullType = getTypes(possibleAccountTypes, infoMetadata).filter(
      t => t.key === typeToDelete
    )[0];
    //The additional info that has to be provided for that type isn't necessary anymore, so we delete it
    if (fullType.additionalInfo) {
      for (const info of fullType.additionalInfo) {
        delete tempEditedAccount.info[info.key];
      }
    }
    tempEditedAccount.types = tempEditedAccount.types.filter(t => t !== typeToDelete);
    setEditedAccount(tempEditedAccount);
  };

  return (
    <Container maxWidth="lg" className={classes.noPadding}>
      <Typography color="error" className={classes.centerText}>
        {errorMessage}
      </Typography>
      <div
        className={`${classes.backgroundContainer} ${
          editedAccount.background_image ? classes.backgroundImage : classes.backgroundColor
        }`}
      >
        <label htmlFor="backgroundPhoto" className={classes.backgroundLabel}>
          <input
            type="file"
            name="backgroundPhoto"
            id="backgroundPhoto"
            style={{ display: "none" }}
            onChange={onBackgroundChange}
            accept=".png,.jpeg,.jpg"
          />
          {editedAccount.background_image ? (
            <div className={classes.backgroundPhotoIconContainer}>
              <AddAPhotoIcon className={`${classes.photoIcon} ${classes.backgroundPhotoIcon}`} />
            </div>
          ) : (
            <div className={classes.avatarButtonContainer}>
              <Chip color="primary" label="Add background image" icon={<ControlPointIcon />} />
            </div>
          )}
        </label>
      </div>
      <Container className={classes.infoContainer}>
        <Button
          className={`${classes.saveButton} ${classes.actionButton}`}
          color="primary"
          variant="contained"
          onClick={() => handleSubmit(event, editedAccount)}
        >
          {submitMessage ? submitMessage : "Save Changes"}
        </Button>
        <Button
          className={`${classes.cancelButton} ${classes.actionButton}`}
          color="secondary"
          variant="contained"
          onClick={() => handleDialogClickOpen("confirmExitDialog")}
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
                accept=".png,.jpeg,.jpg"
              />
              <Avatar
                alt={editedAccount.name}
                component="div"
                size="large"
                src={editedAccount.image}
                className={classes.avatar}
              />

              {editedAccount.image ? (
                <div className={classes.avatarPhotoIconContainer}>
                  <AddAPhotoIcon className={`${classes.photoIcon} ${classes.avatarPhotoIcon}`} />
                </div>
              ) : (
                <div className={classes.avatarButtonContainer}>
                  <Chip
                    label="Add Image"
                    color="primary"
                    icon={<ControlPointIcon />}
                    onClick={() => handleDialogClickOpen("addTypeDialog")}
                  />
                </div>
              )}
            </label>
          </div>

          <TextField
            className={classes.name}
            fullWidth
            defaultValue={editedAccount.name}
            multiline
          />
          {editedAccount.types && (
            <Container className={classes.noPadding}>
              {getTypesOfAccount(editedAccount, possibleAccountTypes, infoMetadata).map(
                typeObject => (
                  <Chip
                    label={typeObject.name}
                    key={typeObject.key}
                    className={classes.chip}
                    onDelete={() => handleTypeDelete(typeObject.key)}
                  />
                )
              )}
              {getTypesOfAccount(editedAccount, possibleAccountTypes, infoMetadata).length <
                maxAccountTypes && (
                <Chip
                  label="Add Type"
                  color={editedAccount.types && editedAccount.types.length ? "default" : "primary"}
                  icon={<ControlPointIcon />}
                  onClick={() => handleDialogClickOpen("addTypeDialog")}
                />
              )}
            </Container>
          )}
        </Container>
        <Container className={classes.accountInfo}>
          {displayAccountInfo(editedAccount.info)}
        </Container>
      </Container>
      {children}
      <UploadImageDialog
        onClose={handleBackgroundClose}
        open={open.backgroundDialog}
        imageUrl={tempImages.background_image}
        height={200}
        mobileHeight={80}
        mediumHeight={120}
        ratio={3}
      />
      <UploadImageDialog
        onClose={handleAvatarClose}
        open={open.avatarDialog}
        imageUrl={tempImages.image}
        borderRadius={10000}
        height={300}
        ratio={1}
      />
      <SelectDialog
        onClose={handleAddTypeClose}
        open={open.addTypeDialog}
        title="Add Type"
        values={getTypes(possibleAccountTypes, infoMetadata).filter(
          type => editedAccount.types && !editedAccount.types.includes(type.key)
        )}
        label={"Choose type"}
        supportAdditionalInfo={true}
        className={classes.dialogWidth}
      />
      <ConfirmDialog
        open={open.confirmExitDialog}
        onClose={handleConfirmExitClose}
        title="Exit"
        text="Do you really want to exit without saving?"
        cancelText="No"
        confirmText="Yes"
      />
    </Container>
  );
}

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
