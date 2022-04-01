import {
  Avatar,
  Button,
  Checkbox,
  Chip,
  Container,
  IconButton,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import AddAPhotoIcon from "@material-ui/icons/AddAPhoto";
import ControlPointIcon from "@material-ui/icons/ControlPoint";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import InfoOutlinedIcon from "@material-ui/icons/InfoOutlined";
import GroupAddIcon from "@material-ui/icons/GroupAdd";
import Alert from "@material-ui/lab/Alert";
import React, { useContext } from "react";
import {
  getCompressedJPG,
  getImageDialogHeight,
  getResizedImage,
  whitenTransparentPixels,
} from "../../../public/lib/imageOperations";
import { getLocalePrefix } from "../../../public/lib/apiOperations";
import { parseLocation } from "../../../public/lib/locationOperations";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import MultiLevelSelectDialog from "../dialogs/MultiLevelSelectDialog";
import ButtonLoader from "../general/ButtonLoader";
import ActiveHubsSelect from "../hub/ActiveHubsSelect";
import MiniOrganizationPreview from "../organization/MiniOrganizationPreview";
import AutoCompleteSearchBar from "../search/AutoCompleteSearchBar";
import LocationSearchBar from "../search/LocationSearchBar";
import ConfirmDialog from "./../dialogs/ConfirmDialog";
import SelectDialog from "./../dialogs/SelectDialog";
import UploadImageDialog from "./../dialogs/UploadImageDialog";
import SelectField from "./../general/SelectField";
import DetailledDescriptionInput from "./DetailledDescriptionInput";

const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg"];
const DEFAULT_AVATAR_IMAGE = "/images/background1.jpg";
const DEFAULT_BACKGROUND_IMAGE = "/images/background1.jpg";

const useStyles = makeStyles((theme) => ({
  backgroundContainer: {
    width: "100%",
    height: 305,
    position: "relative",
    cursor: "pointer",
  },
  photoIcon: {
    position: "absolute",
    left: "-50%",
    top: "-50%",
    cursor: "pointer",
  },
  backgroundImage: (props) => ({
    backgroundImage: `url(${props.background_image})`,
    backgroundPosition: "center",
    backgroundSize: "cover",
  }),
  backgroundColor: {
    backgroundColor: "#e0e0e0",
  },
  backgroundPhotoIcon: {
    fontSize: 80,
  },
  avatarPhotoIcon: {
    fontSize: 40,
  },
  backgroundPhotoIconContainer: {
    position: "absolute",
    left: "calc(50% - 40px)",
    top: "calc(50% - 40px)",
  },
  backgroundLabel: {
    width: "100%",
    height: "100%",
    display: "block",
    cursor: "pointer",
  },
  avatarPhotoIconContainer: {
    position: "absolute",
    left: "calc(50% - 20px)",
    top: "calc(50% - 20px)",
  },
  avatarButtonContainer: {
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: "translate(-50%,-50%)",
  },
  avatarWithInfo: {
    textAlign: "center",
    width: theme.spacing(40),
    margin: "0 auto",
    [theme.breakpoints.up("md")]: {
      margin: 0,
      display: "inline-block",
      width: "auto",
    },
  },
  avatarContainer: {
    height: theme.spacing(20),
    width: theme.spacing(20),
    margin: "0 auto",
    marginTop: theme.spacing(-11),
    position: "relative",
    borderRadius: 100,
    cursor: "pointer",
  },
  avatar: {
    height: "100%",
    width: "100%",
    fontSize: 50,
    backgroundColor: "white",
    "& img": {
      objectFit: "contain",
      opacity: 0.5,
      cursor: "pointer",
    },
    border: `1px solid ${theme.palette.grey[300]}`,
  },
  accountInfo: {
    padding: 0,
    marginTop: theme.spacing(1),
    [theme.breakpoints.up("md")]: {
      paddingRight: theme.spacing(17),
    },
  },
  infoElement: {
    marginBottom: theme.spacing(1),
  },
  name: {
    fontWeight: "bold",
    padding: theme.spacing(1),
    paddingLeft: 0,
    paddingRight: 0,
  },
  subtitle: {
    color: `${theme.palette.secondary.main}`,
    fontWeight: "bold",
  },
  noPadding: {
    padding: 0,
  },
  infoContainer: {
    [theme.breakpoints.up("md")]: {
      display: "flex",
    },
    position: "relative",
  },
  marginTop: {
    marginTop: theme.spacing(1),
  },
  chip: {
    margin: theme.spacing(0.5),
  },
  actionButton: {
    position: "absolute",
    right: theme.spacing(1),
    width: theme.spacing(18),
    [theme.breakpoints.down("sm")]: {
      width: theme.spacing(14),
      fontSize: 10,
      textAlign: "center",
    },
  },
  saveButton: {
    top: theme.spacing(11.5),
    [theme.breakpoints.up("md")]: {
      top: theme.spacing(1),
    },
  },
  cancelButton: {
    top: theme.spacing(16.5),
    [theme.breakpoints.up("md")]: {
      top: theme.spacing(6.5),
    },
  },
  chipArray: {
    display: "flex",
    flexWrap: "wrap",
    padding: theme.spacing(0.5),
  },
  selectOption: {
    width: 250,
  },
  dialogWidth: {
    width: 400,
  },
  alert: {
    textAlign: "center",
    maxWidth: 1280,
    margin: "0 auto",
  },
  cursorPointer: {
    cursor: "pointer",
  },
  helpIcon: {
    fontSize: 20,
    marginTop: -2,
  },
  deleteMessage: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: theme.spacing(10),
  },
  checkTranslationsButtonAndManageMembersButtonContainer: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: theme.spacing(5),
  },
  detailledDescriptionContainer: {
    marginTop: theme.spacing(5),
  },
}));

//Generic page for editing your personal profile or organization profile
export default function EditAccountPage({
  account,
  possibleAccountTypes,
  maxAccountTypes,
  /*
  object with properties that can be changed and their types (e.g. "summary" is a "text" type)
    E.g. for organizations this is generated by the function in public/data/organization_info_metadata.js
  */
  infoMetadata,
  children,
  handleSubmit,
  submitMessage,
  handleCancel,
  errorMessage,
  skillsOptions,
  splitName,
  deleteEmail,
  loadingSubmit,
  onClickCheckTranslations,
  allHubs,
  type,
}) {
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "account", locale: locale });
  const [selectedFiles, setSelectedFiles] = React.useState({ avatar: "", background: "" });
  const [editedAccount, setEditedAccount] = React.useState({ ...account });
  const isNarrowScreen = useMediaQuery((theme) => theme.breakpoints.down("md"));
  const legacyModeEnabled = process.env.ENABLE_LEGACY_LOCATION_FORMAT === "true";
  const classes = useStyles(editedAccount);
  const isOrganization = type === "organization";
  //used for previewing images in UploadImageDialog
  const [tempImages, setTempImages] = React.useState({
    image: editedAccount.image ? editedAccount.image : DEFAULT_AVATAR_IMAGE,
    background_image: editedAccount.background_image
      ? editedAccount.background_image
      : DEFAULT_BACKGROUND_IMAGE,
  });

  const [open, setOpen] = React.useState({
    backgroundDialog: false,
    avatarDialog: false,
    addTypeDialog: false,
    confirmExitDialog: false,
  });

  const handleDialogClickOpen = (dialogKey) => {
    setOpen({ ...open, [dialogKey]: true });
  };

  const handleBackgroundClose = (image) => {
    setOpen({ ...open, backgroundDialog: false });
    if (image && image instanceof HTMLCanvasElement) {
      if (image && image instanceof HTMLCanvasElement) {
        whitenTransparentPixels(image);
        image.toBlob(async function (blob) {
          const resizedBlob = URL.createObjectURL(blob);
          setEditedAccount({ ...editedAccount, background_image: resizedBlob });
        }, "image/jpeg");
      }
    }
  };

  const handleAvatarClose = async (image) => {
    setOpen({ ...open, avatarDialog: false });
    if (image && image instanceof HTMLCanvasElement) {
      whitenTransparentPixels(image);
      image.toBlob(async function (blob) {
        const resizedBlob = URL.createObjectURL(blob);
        const thumbnailBlob = await getResizedImage(
          URL.createObjectURL(blob),
          120,
          120,
          "image/jpeg"
        );
        setEditedAccount({ ...editedAccount, image: resizedBlob, thumbnail_image: thumbnailBlob });
      }, "image/jpeg");
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
    if (additionalInfo && additionalInfo !== undefined) {
      for (const info of additionalInfo) {
        tempAccount.info[info.key] = info.value;
      }
      tempAccount.types = [...tempAccount.types, type];
      setEditedAccount(tempAccount);
    }
  };

  const handleConfirmExitClose = (exit) => {
    setOpen({ ...open, confirmExitDialog: false });
    if (exit) handleCancel();
  };

  const deleteFromInfoArray = (key, entry) => {
    setEditedAccount({
      ...editedAccount,
      info: {
        ...editedAccount.info,
        [key]: editedAccount.info[key].filter((val) => val !== entry),
      },
    });
  };

  const displayInfoArrayData = (key, infoEl) => {
    const [skillsDialogOpen, setSkillsDialogOpen] = React.useState(false);
    const [selectedItems, setSelectedItems] = React.useState(
      editedAccount.info.skills ? [...editedAccount.info.skills] : []
    );

    const handleSkillsDialogClose = (skills) => {
      setSkillsDialogOpen(false);
      if (skills)
        setEditedAccount({
          ...editedAccount,
          info: { ...editedAccount.info, skills: skills },
        });
    };

    const handleDeleteFromInfoArray = (key, entry) => {
      deleteFromInfoArray(key, entry);
      setSelectedItems([...selectedItems.filter((item) => item !== entry)]);
    };

    const handleSkillsDialogClickOpen = () => setSkillsDialogOpen(true);
    return (
      <div key={key} className={classes.infoElement}>
        <div className={classes.subtitle}>{infoEl.name}:</div>
        <div className={classes.chipArray}>
          {infoEl.value.map((entry) => (
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
            options={skillsOptions}
            items={editedAccount.info.skills}
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
          />
        </div>
      </div>
    );
  };

  /*Generates all the possible info a user can put about their account e.g. website, location, summary, bio, ...*/
  /* Since this component is generic and is used for both personal profiles and organizations 
    we pass an info element to it. 
  */
  const displayAccountInfo = (info) => {
    //For each info object we want to return the correct input so users can change this info
    return Object.keys(info).map((key) => {
      const i = getFullInfoElement(infoMetadata, key, info[key]);

      const handleChange = (event) => {
        let newValue = event.target.value;
        if (i.type === "select") {
          //On select fields, use the key as the new value since the text can have multiple languages
          newValue = i.options.find((o) => o.name === event.target.value).key;
        }
        setEditedAccount({
          ...editedAccount,
          info: { ...editedAccount.info, [key]: newValue },
        });
      };

      const handleChangeLocationString = (newLocationString) => {
        setEditedAccount({
          ...editedAccount,
          info: { ...editedAccount.info, [key]: newLocationString },
        });
      };

      //set account.info.location to object when user selects a location
      const handleChangeLocation = (location) => {
        setEditedAccount({
          ...editedAccount,
          info: {
            ...editedAccount.info,
            [key]: parseLocation(location),
          },
        });
      };

      const handleChangeLegacyLocation = (key, event) => {
        setEditedAccount({
          ...editedAccount,
          info: {
            ...editedAccount.info,
            location: {
              ...editedAccount.info.location,
              [key]: event.target.value,
            },
          },
        });
      };

      const handleSetParentOrganization = (newOrg) => {
        setEditedAccount({
          ...editedAccount,
          info: {
            ...editedAccount.info,
            parent_organization: newOrg,
            has_parent_organization: !!newOrg,
          },
        });
      };
      //Iterate through potential types of info and display the corresponding input
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
              onChange={(e) => handleChange({ target: { value: e.target.checked } })}
            />
            <label htmlFor={"checkbox" + i.key}>{i.label}</label>
          </div>
        );
      } else if (
        i.type === "auto_complete_searchbar" &&
        i.key === "parent_organization" &&
        (!i.show_if_ticked || editedAccount.info[i.show_if_ticked] === true)
      ) {
        const renderSearchOption = (option) => {
          return <React.Fragment>{option.name}</React.Fragment>;
        };
        return (
          <div className={classes.infoElement}>
            {i.value && (
              <>
                <Typography className={`${classes.subtitle} ${classes.infoElement}`}>
                  {texts.parent_organization}:
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
              getOptionLabel={(option) => option.name}
              helperText={i.helperText}
            />
          </div>
        );
      } else if (i.type === "location") {
        //return legacy field options (city, country) instead of the location field when location legacy mode is enabled
        if (legacyModeEnabled) {
          return (
            <>
              {Object.keys(i.legacy).map((k) => {
                const field = i.legacy[k];
                return (
                  <div key={field.key} className={classes.infoElement}>
                    <TextField
                      label={field.name}
                      variant="outlined"
                      required
                      onChange={(event) => handleChangeLegacyLocation(field.key, event)}
                      value={editedAccount?.info?.location[field.key]}
                    />
                  </div>
                );
              })}
            </>
          );
        }
        return (
          <div className={classes.infoElement} key={i.key}>
            <LocationSearchBar
              label={i.name}
              required
              value={editedAccount.info.location}
              onChange={handleChangeLocationString}
              onSelect={handleChangeLocation}
              handleSetOpen={i.setLocationOptionsOpen}
              open={i.locationOptionsOpen}
              locationInputRef={i.locationInputRef}
            />
          </div>
        );
      } else if (i.type === "hubs") {
        const onSelectNewHub = (event) => {
          event.preventDefault();
          const hub = allHubs.find((h) => h.name === event.target.value);
          if (editedAccount?.info?.hubs?.filter((h) => h.url_slug === hub.url_slug)?.length === 0) {
            setEditedAccount({
              ...editedAccount,
              info: {
                ...editedAccount.info,
                hubs: [...editedAccount.info.hubs, hub],
              },
            });
          }
        };
        const onClickRemoveHub = (hub) => {
          const hubsAfterRemoval = editedAccount?.info?.hubs.filter(
            (h) => h.url_slug !== hub.url_slug
          );
          setEditedAccount({
            ...editedAccount,
            info: {
              ...editedAccount.info,
              hubs: hubsAfterRemoval,
            },
          });
        };
        return (
          <ActiveHubsSelect
            info={i}
            hubsToSelectFrom={allHubs.filter(
              (h) =>
                editedAccount?.info?.hubs.filter((addedHub) => addedHub.url_slug === h.url_slug)
                  .length === 0
            )}
            onClickRemoveHub={onClickRemoveHub}
            selectedHubs={editedAccount.info.hubs}
            onSelectNewHub={onSelectNewHub}
          />
        );
      } else if (key != "parent_organization" && ["text", "bio"].includes(i.type)) {
        //This is the fallback for normal textfields
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
  };

  const onBackgroundChange = async (backgroundEvent) => {
    const file = backgroundEvent.target.files[0];
    if (!file || !file.type || !ACCEPTED_IMAGE_TYPES.includes(file.type))
      alert(texts.please_upload_either_a_png_or_a_jpg_file);

    try {
      const compressedImage = await getCompressedJPG(file, 1);

      setTempImages(() => {
        return {
          ...tempImages,
          background_image: compressedImage,
        };
      });
      handleDialogClickOpen("backgroundDialog");
    } catch (error) {
      console.log(error);
    }
  };

  const onAvatarChange = async (avatarEvent) => {
    const file = avatarEvent.target.files[0];
    if (!file || !file.type || !ACCEPTED_IMAGE_TYPES.includes(file.type))
      alert(texts.please_upload_either_a_png_or_a_jpg_file);

    try {
      const compressedImage = await getCompressedJPG(file, 0.5);
      setTempImages(() => {
        return {
          ...tempImages,
          image: compressedImage,
        };
      });
      handleDialogClickOpen("avatarDialog");
    } catch (error) {
      console.log(error);
    }
  };

  const handleTypeDelete = (typeToDelete) => {
    const tempEditedAccount = { ...editedAccount };
    const fullType = getTypes(possibleAccountTypes, infoMetadata).filter(
      (t) => t.key === typeToDelete
    )[0];
    //The additional info that has to be provided for that type isn't necessary anymore, so we delete it
    if (fullType.additionalInfo) {
      for (const info of fullType.additionalInfo) {
        delete tempEditedAccount.info[info.key];
      }
    }
    tempEditedAccount.types = tempEditedAccount.types.filter((t) => t !== typeToDelete);
    setEditedAccount(tempEditedAccount);
  };

  const handleFileInputClick = (type) => {
    setSelectedFiles({ ...selectedFiles, [type]: "" });
  };

  const handleFileSubmit = (event, type) => {
    console.log(event.target.value);
    console.log(type);
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    handleSubmit(editedAccount);
  };

  const getDetailledDescription = () => {
    const detailled_description_obj = Object.keys(editedAccount.info).filter((i) => {
      const el = getFullInfoElement(infoMetadata, i, editedAccount.info[i]);
      return el.type === "detailled_description";
    });
    if (detailled_description_obj.length > 0) {
      const key = detailled_description_obj[0];
      return getFullInfoElement(infoMetadata, key, editedAccount.info[key]);
    } else return null;
  };
  const detailledDescription = getDetailledDescription();

  const handleValueChange = (event, key) => {
    setEditedAccount({
      ...editedAccount,
      info: { ...editedAccount.info, [key]: event.target.value },
    });
  };

  return (
    <Container maxWidth="lg" className={classes.noPadding}>
      <form onSubmit={handleFormSubmit}>
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
                <Chip
                  color="primary"
                  label={texts.add_background_image}
                  icon={<ControlPointIcon />}
                />
              </div>
            )}
          </label>
        </div>
        <Container className={classes.infoContainer}>
          <Button
            className={`${classes.saveButton} ${classes.actionButton}`}
            color="primary"
            variant="contained"
            type="submit"
          >
            {loadingSubmit ? <ButtonLoader /> : submitMessage ? submitMessage : "Save"}
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
                  onSubmit={(event) => handleFileSubmit(event, "avatar")}
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
                      label={texts.add_image}
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
                  onChange={(event) => handleTextFieldChange("first_name", event.target.value)}
                  multiline
                  required
                  label={texts.first_name}
                />
                <TextField
                  className={classes.name}
                  fullWidth
                  value={editedAccount.last_name}
                  onChange={(event) => handleTextFieldChange("last_name", event.target.value)}
                  multiline
                  required
                  label={texts.last_name}
                />
              </>
            ) : (
              <TextField
                className={classes.name}
                fullWidth
                value={editedAccount.name}
                onChange={(event) => handleTextFieldChange("name", event.target.value)}
                multiline
                required
              />
            )}

            {editedAccount.types && (
              <Container className={classes.noPadding}>
                {possibleAccountTypes &&
                  getTypesOfAccount(
                    editedAccount,
                    possibleAccountTypes,
                    infoMetadata
                  ).map((typeObject) => (
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
                      label={texts.add_type}
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
            {/*Contains all the possible info a user can put about their account e.g. website, location, summary, bio, ...*/}
            {displayAccountInfo(editedAccount.info)}
            <div className={classes.checkTranslationsButtonAndManageMembersButtonContainer}>
              {onClickCheckTranslations && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => onClickCheckTranslations(editedAccount)}
                >
                  {texts.check_translations}
                </Button>
              )}
              {isOrganization &&
                (isNarrowScreen ? (
                  <IconButton
                    className={classes.editButton}
                    variant="contained"
                    color="primary"
                    href={
                      getLocalePrefix(locale) + "/manageOrganizationMembers/" + account.url_slug
                    }
                  >
                    <GroupAddIcon />
                  </IconButton>
                ) : (
                  <Button
                    className={classes.editButton}
                    variant="contained"
                    color="primary"
                    href={
                      getLocalePrefix(locale) + "/manageOrganizationMembers/" + account.url_slug
                    }
                  >
                    {texts.manage_members}
                  </Button>
                ))}
            </div>
          </Container>
        </Container>
        <Container className={classes.detailledDescriptionContainer}>
          {detailledDescription && (
            <DetailledDescriptionInput
              title={detailledDescription.name}
              helpText={detailledDescription.helptext}
              value={detailledDescription.value}
              onChange={handleValueChange}
              infoKey={detailledDescription.key}
            />
          )}
        </Container>
        {children}
        {deleteEmail && (
          <Typography variant="subtitle2" className={classes.deleteMessage}>
            <InfoOutlinedIcon />
            {texts.if_you_wish_to_delete} {deleteEmail}
          </Typography>
        )}
      </form>
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
          title={texts.add_type}
          values={getTypes(possibleAccountTypes, infoMetadata).filter(
            (type) => editedAccount.types && !editedAccount.types.includes(type.key)
          )}
          label={texts.choose_type}
          supportAdditionalInfo={true}
          className={classes.dialogWidth}
        />
      )}
      <ConfirmDialog
        open={open.confirmExitDialog}
        onClose={handleConfirmExitClose}
        title={texts.exit}
        text={texts.do_you_really_want_to_exit_without_saving}
        cancelText={texts.no}
        confirmText={texts.yes}
      />
    </Container>
  );
}

const getTypes = (possibleAccountTypes, infoMetadata) => {
  return possibleAccountTypes.map((type) => {
    return {
      ...type,
      additionalInfo: type.additionalInfo.map((info) => {
        return { ...infoMetadata[info], key: info };
      }),
    };
  });
};

const getTypesOfAccount = (account, possibleAccountTypes, infoMetadata) => {
  return getTypes(possibleAccountTypes, infoMetadata).filter((type) =>
    account.types.includes(type.key)
  );
};

const getFullInfoElement = (infoMetadata, key, value) => {
  return { ...infoMetadata[key], value: value };
};
