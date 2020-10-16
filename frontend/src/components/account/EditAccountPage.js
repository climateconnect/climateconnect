import React from "react";
import {
  Container,
  Avatar,
  Chip,
  Button,
  TextField,
  Typography,
  Tooltip,
  IconButton,
  useMediaQuery,
  Checkbox
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import AddAPhotoIcon from "@material-ui/icons/AddAPhoto";
import ControlPointIcon from "@material-ui/icons/ControlPoint";
import UploadImageDialog from "./../dialogs/UploadImageDialog";
import ConfirmDialog from "./../dialogs/ConfirmDialog";
import SelectField from "./../general/SelectField";
import SelectDialog from "./../dialogs/SelectDialog";
import MultiLevelSelectDialog from "../dialogs/MultiLevelSelectDialog";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import imageCompression from "browser-image-compression";
import { getImageDialogHeight } from "../../../public/lib/imageOperations";
import InfoOutlinedIcon from "@material-ui/icons/InfoOutlined";
import AutoCompleteSearchBar from "../general/AutoCompleteSearchBar";
import MiniOrganizationPreview from "../organization/MiniOrganizationPreview";
import Alert from "@material-ui/lab/Alert";

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
  alert: {
    textAlign: "center",
    maxWidth: 1280,
    margin: "0 auto"
  },
  cursorPointer: {
    cursor: "pointer"
  },
  helpIcon: {
    fontSize: 20,
    marginTop: -2
  },
  deleteMessage: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: theme.spacing(10)
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
  errorMessage,
  skillsOptions,
  splitName,
  deleteEmail
}) {
  const [selectedFiles, setSelectedFiles] = React.useState({ avatar: "", background: "" });
  const [editedAccount, setEditedAccount] = React.useState({ ...account });
  const isNarrowScreen = useMediaQuery(theme => theme.breakpoints.down("sm"));
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

  const handleTextFieldChange = (key, newValue, isInfoElement) => {
    if (isInfoElement)
      setEditedAccount({ ...editedAccount, info: { ...editedAccount.info, [key]: newValue } });
    setEditedAccount({ ...editedAccount, [key]: newValue });
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
    const [skillsDialogOpen, setSkillsDialogOpen] = React.useState(false);
    const [selectedItems, setSelectedItems] = React.useState(
      editedAccount.info.skills ? [...editedAccount.info.skills] : []
    );

    const handleSkillsDialogClose = skills => {
      setSkillsDialogOpen(false);
      if (skills)
        setEditedAccount({
          ...editedAccount,
          info: { ...editedAccount.info, skills: skills }
        });
    };

    const handleDeleteFromInfoArray = (key, entry) => {
      deleteFromInfoArray(key, entry);
      setSelectedItems([...selectedItems.filter(item => item !== entry)]);
    };

    const handleSkillsDialogClickOpen = () => setSkillsDialogOpen(true);
    return (
      <div key={key} className={classes.infoElement}>
        <div className={classes.subtitle}>{infoEl.name}:</div>
        <div className={classes.chipArray}>
          {infoEl.value.map(entry => (
            <Chip
              size="medium"
              label={entry.name}
              key={entry.key}
              className={classes.chip}
              onDelete={() => handleDeleteFromInfoArray(key, entry)}
            />
          ))}
          {editedAccount.info[key].length < infoEl.maxEntries && (
            <Chip
              label="Add"
              icon={<ControlPointIcon />}
              className={classes.chip}
              onClick={handleSkillsDialogClickOpen}
            />
          )}
          <MultiLevelSelectDialog
            open={skillsDialogOpen}
            onClose={handleSkillsDialogClose}
            type="skills"
            itemsToChooseFrom={skillsOptions}
            items={editedAccount.info.skills}
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
          />
        </div>
      </div>
    );
  };

  const displayAccountInfo = info =>
    Object.keys(info).map(key => {
      const handleChange = event => {
        setEditedAccount({
          ...editedAccount,
          info: { ...editedAccount.info, [key]: event.target.value }
        });
      };

      const handleSetParentOrganization = newOrg => {
        setEditedAccount({
          ...editedAccount,
          info: {
            ...editedAccount.info,
            parent_organization: newOrg,
            has_parent_organization: !!newOrg
          }
        });
      };

      const i = getFullInfoElement(infoMetadata, key, info[key]);

      if (i.type === "array") {
        return displayInfoArrayData(key, i);
      } else if (i.type === "select") {
        return (
          <div key={key} className={classes.infoElement}>
            <SelectField
              className={classes.selectOption}
              options={i.options}
              label={i.name}
              defaultValue={{ name: i.value, key: i.value }}
              onChange={handleChange}
            />
          </div>
        );
      } else if (i.type === "checkbox") {
        return (
          <div className={classes.checkbox} key={i.key}>
            <Checkbox
              id={"checkbox" + i.key}
              checked={i.value}
              className={classes.inlineBlockElement}
              color="primary"
              size="small"
              onChange={e => handleChange({ target: { value: e.target.checked } })}
            />
            <label htmlFor={"checkbox" + i.key}>{i.label}</label>
          </div>
        );
      } else if (
        i.type === "auto_complete_searchbar" &&
        i.key === "parent_organization" &&
        (!i.show_if_ticked || editedAccount.info[i.show_if_ticked] === true)
      ) {
        const renderSearchOption = option => {
          return <React.Fragment>{option.name}</React.Fragment>;
        };
        return (
          <>
            <div className={classes.infoElement}>
              {i.value && (
                <>
                  <Typography className={`${classes.subtitle} ${classes.infoElement}`}>
                    Parent organization:
                  </Typography>
                  <MiniOrganizationPreview
                    organization={i.value}
                    size="small"
                    className={classes.infoElement}
                    onDelete={() => handleSetParentOrganization(null)}
                  />
                </>
              )}
              <AutoCompleteSearchBar
                label={i.label}
                className={`${classes.marginTop} ${classes.block}`}
                baseUrl={process.env.API_URL + i.baseUrl}
                freeSolo
                clearOnSelect
                onSelect={handleSetParentOrganization}
                renderOption={renderSearchOption}
                getOptionLabel={option => option.name}
                helperText={i.helperText}
              />
            </div>
          </>
        );
      } else if (key != "parent_organization") {
        return (
          <div key={key} className={classes.infoElement}>
            <Typography className={classes.subtitle}>
              {i.name}
              {i.helptext && (
                <Tooltip title={i.helptext}>
                  <IconButton>
                    <HelpOutlineIcon className={classes.helpIcon} />
                  </IconButton>
                </Tooltip>
              )}
            </Typography>
            <TextField fullWidth value={i.value} multiline onChange={handleChange} />
          </div>
        );
      }
    });

  const onBackgroundChange = async backgroundEvent => {
    const file = backgroundEvent.target.files[0];
    if (!file || !file.type || !ACCEPTED_IMAGE_TYPES.includes(file.type))
      alert("Please upload either a png or a jpg file.");
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1280,
      useWebWorker: true
    };

    try {
      const compressedFile = await imageCompression(file, options);

      setTempImages(() => {
        return {
          ...tempImages,
          background_image: URL.createObjectURL(compressedFile)
        };
      });
      handleDialogClickOpen("backgroundDialog");
    } catch (error) {
      console.log(error);
    }
  };

  const onAvatarChange = async avatarEvent => {
    const file = avatarEvent.target.files[0];
    if (!file || !file.type || !ACCEPTED_IMAGE_TYPES.includes(file.type))
      alert("Please upload either a png or a jpg file.");
    const options = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 600,
      useWebWorker: true
    };

    try {
      const compressedFile = await imageCompression(file, options);
      setTempImages(() => {
        return {
          ...tempImages,
          image: URL.createObjectURL(compressedFile)
        };
      });
      handleDialogClickOpen("avatarDialog");
    } catch (error) {
      console.log(error);
    }
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

  const handleFileInputClick = type => {
    setSelectedFiles({ ...selectedFiles, [type]: "" });
  };

  const handleFileSubmit = (event, type) => {
    console.log(event.target.value);
    console.log(type);
  };

  return (
    <Container maxWidth="lg" className={classes.noPadding}>
      {errorMessage && (
        <Alert severity="error" className={classes.alert}>
          {errorMessage}
        </Alert>
      )}
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
            value={selectedFiles.background}
            onClick={() => handleFileInputClick("background")}
            onSubmit={() => handleFileSubmit(event, "background")}
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
          {submitMessage ? submitMessage : "Save"}
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
                value={selectedFiles["avatar"]}
                onClick={() => handleFileInputClick("avatar")}
                onSubmit={() => handleFileSubmit(event, "avatar")}
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
                    className={classes.cursorPointer}
                  />
                </div>
              )}
            </label>
          </div>

          {splitName ? (
            <>
              <TextField
                className={classes.name}
                fullWidth
                value={editedAccount.first_name}
                onChange={event => handleTextFieldChange("first_name", event.target.value)}
                multiline
                label={"First name"}
              />
              <TextField
                className={classes.name}
                fullWidth
                value={editedAccount.last_name}
                onChange={event => handleTextFieldChange("last_name", event.target.value)}
                multiline
                label={"Last name"}
              />
            </>
          ) : (
            <TextField
              className={classes.name}
              fullWidth
              value={editedAccount.name}
              onChange={event => handleTextFieldChange("name", event.target.value)}
              multiline
            />
          )}

          {editedAccount.types && (
            <Container className={classes.noPadding}>
              {possibleAccountTypes &&
                getTypesOfAccount(
                  editedAccount,
                  possibleAccountTypes,
                  infoMetadata
                ).map(typeObject => (
                  <Chip
                    label={typeObject.name}
                    key={typeObject.key}
                    className={classes.chip}
                    onDelete={() => handleTypeDelete(typeObject.key)}
                  />
                ))}
              {possibleAccountTypes &&
                getTypesOfAccount(editedAccount, possibleAccountTypes, infoMetadata).length <
                  maxAccountTypes && (
                  <Chip
                    label="Add Type"
                    color={
                      editedAccount.types && editedAccount.types.length ? "default" : "primary"
                    }
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
      {deleteEmail && (
        <Typography variant="subtitle2" className={classes.deleteMessage}>
          <InfoOutlinedIcon />
          If you wish to delete this account, send an E-Mail to {deleteEmail}
        </Typography>
      )}
      <UploadImageDialog
        onClose={handleBackgroundClose}
        open={open.backgroundDialog}
        imageUrl={tempImages.background_image}
        height={isNarrowScreen ? getImageDialogHeight(window.innerWidth) : 200}
        mobileHeight={80}
        mediumHeight={120}
        ratio={3}
      />
      <UploadImageDialog
        onClose={handleAvatarClose}
        open={open.avatarDialog}
        imageUrl={tempImages.image}
        borderRadius={10000}
        height={isNarrowScreen ? getImageDialogHeight(window.innerWidth) : 200}
        ratio={1}
      />
      {possibleAccountTypes && (
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
      )}
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
