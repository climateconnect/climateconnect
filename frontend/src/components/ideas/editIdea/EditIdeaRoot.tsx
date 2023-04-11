import { Button, IconButton, TextField, Tooltip, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import React, { useContext, useRef, useState } from "react";
import Cookies from "universal-cookie";
import { apiRequest } from "../../../../public/lib/apiOperations";
import { blobFromObjectUrl } from "../../../../public/lib/imageOperations";
import { parseLocation } from "../../../../public/lib/locationOperations";
import getTexts from "../../../../public/texts/texts";
import UserContext from "../../context/UserContext";
import ConfirmDialog from "../../dialogs/ConfirmDialog";
import LoadingContainer from "../../general/LoadingContainer";
import SelectField from "../../general/SelectField";
import Switcher from "../../general/Switcher";
import LocationSearchBar from "../../search/LocationSearchBar";
import UploadImageField from "../UploadImageField";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(1),
    background: "white",
  },
  backIcon: {
    float: "left",
  },
  mainHeadline: {
    fontWeight: 700,
    fontSize: 20,
    textAlign: "center",
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(1),
  },
  textField: {
    width: "100%",
    marginBottom: theme.spacing(2),
  },
  headline: {
    fontWeight: 600,
    fontSize: 17,
    marginBottom: theme.spacing(0.5),
  },
  buttonBar: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(1),
  },
  publishButton: {
    float: "right",
  },
  uploadImageField: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));

export default function EditIdeaRoot({ idea, cancelEdit, userOrganizations, allHubs }) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const [waitingForRequest, setWaitingForRequest] = useState(false);
  const texts = getTexts({ page: "idea", locale: locale });
  const [editedIdea, setEditedIdea] = useState(idea);
  const locationInputRef = useRef(null);
  const [locationOptionsOpen, setLocationOptionsOpen] = useState(false);
  const token = new Cookies().get("auth_token");
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

  const handleValueChange = (newValue, key) => {
    setEditedIdea({ ...editedIdea, [key]: newValue });
  };

  const updateImages = ({ thumbnail_image, image }) => {
    setEditedIdea({ ...editedIdea, thumbnail_image: thumbnail_image, image: image });
  };

  const handleIsOrganizationsIdeaChange = () => {
    setEditedIdea({ ...editedIdea, is_organizations_idea: !editedIdea.is_organizations_idea });
  };

  const onClickCancel = (e) => {
    e.preventDefault();
    const changes = getChanges(idea, editedIdea);
    if (changes && Object.keys(changes).length !== 0) {
      setConfirmCancelOpen(true);
    } else {
      cancelEdit();
    }
  };

  const checkIfIdeaIsValid = () => {
    //TODO: validate location!!
    return true;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (checkIfIdeaIsValid()) {
      setWaitingForRequest(true);
      const changes = getChanges(idea, editedIdea);
      if (Object.keys(changes).length === 0) {
        cancelEdit();
      } else {
        const payload = await parseIdeaForEditRequest(changes, locale);
        try {
          await apiRequest({
            method: "patch",
            url: `/api/ideas/${idea.url_slug}/`,
            payload: payload,
            token: token,
            locale: locale,
          });
          window.location.reload();
        } catch (e: any) {
          setWaitingForRequest(false);
          console.log(e);
          console.log(e.response);
        }
      }
    }
  };

  const onConfirmCancelClose = (confirmed) => {
    if (confirmed) {
      cancelEdit();
    }
    setConfirmCancelOpen(false);
  };

  const handleSetLocationOptionsOpen = (newState) => setLocationOptionsOpen(newState);
  return (
    <>
      {waitingForRequest ? (
        <LoadingContainer headerHeight={113} footerHeight={80} />
      ) : (
        <>
          <form className={classes.root} onSubmit={onSubmit}>
            <Tooltip title={texts.cancel}>
              <IconButton className={classes.backIcon} onClick={onClickCancel} size="large">
                <KeyboardArrowLeftIcon />
              </IconButton>
            </Tooltip>
            <Typography component="h2" className={classes.mainHeadline}>
              {texts.edit_your_idee}
            </Typography>
            <div /*TODO(undefined) className={classes.chooseIsOrganizationsProject} */>
              <Switcher
                trueLabel={texts.organizations_idea}
                falseLabel={texts.personal_idea}
                value={editedIdea.is_organizations_idea}
                handleChangeValue={handleIsOrganizationsIdeaChange}
              />
              {editedIdea.is_organizations_idea && (
                <SelectField
                  size="small"
                  label={texts.choose_your_organization}
                  /*TODO(undefined) className={classes.chooseOrganizationField} */
                  options={userOrganizations}
                  controlled
                  required
                  onChange={(e) =>
                    handleValueChange(
                      userOrganizations.find((o) => o.name === e.target.value),
                      "parent_organization"
                    )
                  }
                  controlledValue={editedIdea.parentOrganization}
                />
              )}
            </div>
            <Typography className={classes.headline}>{texts.title}*</Typography>
            <TextField
              className={classes.textField}
              placeholder={texts.give_your_idea_a_meaningful_title}
              variant="outlined"
              required
              id="titleInput"
              onChange={(e) => handleValueChange(e.target.value, "name")}
              value={editedIdea.name}
            />
            <Typography className={classes.headline}>{texts.image_optional}</Typography>
            <UploadImageField
              className={classes.uploadImageField}
              updateImages={updateImages}
              image={editedIdea.image}
            />
            <Typography className={classes.headline}>{texts.description}*</Typography>
            <TextField
              className={classes.textField}
              variant="outlined"
              placeholder={texts.describe_idea_placeholder}
              required
              size="small"
              multiline
              rows={9}
              onChange={(e) => handleValueChange(e.target.value, "short_description")}
              value={editedIdea.short_description}
            />
            <Typography className={classes.headline}>{texts.location}*</Typography>
            <LocationSearchBar
              required
              label={texts.choose_a_location}
              className={classes.textField}
              value={editedIdea.location}
              onChange={(newValue) => handleValueChange(newValue, "location")}
              onSelect={(location) => handleValueChange(parseLocation(location), "location")}
              handleSetOpen={handleSetLocationOptionsOpen}
              open={locationOptionsOpen}
              locationInputRef={locationInputRef}
              smallInput
              helperText={texts.create_idea_location_helper_text}
              disabled
            />
            <Typography className={classes.headline}>Hub*</Typography>
            <SelectField
              size="small"
              label={texts.choose_a_category}
              options={allHubs}
              required
              controlled
              onChange={(e) =>
                handleValueChange(
                  allHubs.find((h) => h.name === e.target.value),
                  "hub"
                )
              }
              controlledValue={editedIdea.hub}
            />
            <div className={classes.buttonBar}>
              <Button variant="contained" onClick={onClickCancel} disabled={waitingForRequest}>
                {texts.cancel}
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                className={classes.publishButton}
                disabled={waitingForRequest}
              >
                {texts.save}
              </Button>
            </div>
          </form>
          <ConfirmDialog
            open={confirmCancelOpen}
            onClose={onConfirmCancelClose}
            title={texts.do_you_really_want_to_go_back}
            text={texts.if_you_go_back_you_will_lose_your_unsaved_changes}
            confirmText={texts.yes}
            cancelText={texts.no}
          />
        </>
      )}
    </>
  );
}

const getChanges = (idea, editedIdea) => {
  const propertiesToExclude = ["comments", "created_at", "id", "index", "rating", "url_slug"];
  return Object.keys(editedIdea).reduce((obj, key) => {
    if (!propertiesToExclude.includes(key) && editedIdea[key] !== idea[key]) {
      obj[key] = editedIdea[key];
    }
    return obj;
  }, {});
};

const parseIdeaForEditRequest = async (idea, locale) => {
  const parsedIdea = {
    ...idea,
    source_language: locale,
  };

  if (idea.hub) parsedIdea.hub = idea.hub.url_slug;

  if (idea.parent_organization && idea.is_organizations_idea) {
    parsedIdea.parent_organization = idea.parent_organization.id;
  } else {
    delete parsedIdea.parent_organization;
  }
  if (idea.image) parsedIdea.image = await blobFromObjectUrl(idea.image);
  else delete parsedIdea.image;

  if (idea.thumbnail_image)
    parsedIdea.thumbnail_image = await blobFromObjectUrl(idea.thumbnail_image);
  else delete parsedIdea.thumbnail_image;

  return parsedIdea;
};
