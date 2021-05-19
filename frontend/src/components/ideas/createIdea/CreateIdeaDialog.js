import { makeStyles } from "@material-ui/core";
import React, { useContext, useRef, useState } from "react";
import { indicateWrongLocation, isLocationValid } from "../../../../public/lib/locationOperations";
import getTexts from "../../../../public/texts/texts";
import UserContext from "../../context/UserContext";
import GenericDialog from "../../dialogs/GenericDialog";
import LoadingSpinner from "../../general/LoadingSpinner";
import IdeaInfoStep from "./IdeaInfoStep";
import IdeaMetadataStep from "./IdeaMetadataStep";

const useStyles = makeStyles((theme) => ({
  root: {
    border: `3px solid ${theme.palette.primary.main}`,
    borderRadius: theme.spacing(2),
  },
  titleText: {
    fontWeight: "600",
    color: theme.palette.secondary.main,
  },
  dialogContentClass: {
    paddingTop: 0,
  },
  content: (props) => ({
    visibility: props.userOrganizations === null ? "hidden" : "default",
  }),
}));

export default function CreateIdeaDialog({ open, onClose, allHubs, userOrganizations }) {
  const classes = useStyles({ userOrganzations: userOrganizations });
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "idea", locale: locale });
  const [idea, setIdea] = useState({
    name: "",
    short_description: "",
    image: "",
    thumbnail_image: "",
    hub: "",
    location: "",
    is_organizations_idea: false,
    parent_organization: null,
  });
  const STEPS = ["idea_info", "idea_metadata"];
  const [step, setStep] = useState(STEPS[0]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [locationOptionsOpen, setLocationOptionsOpen] = useState(false);
  const locationInputRef = useRef(null);

  const handleStepForward = () => {
    setStep(STEPS[STEPS.indexOf(step) + 1]);
  };

  const handleSetLocationOptionsOpen = (newState) => setLocationOptionsOpen(newState);

  const handleValueChange = (newValue, key) => {
    setIdea({ ...idea, [key]: newValue });
  };

  const handleStepBackwards = () => {
    setStep(STEPS[STEPS.indexOf(step) - 1]);
  };

  const updateImages = ({ thumbnail_image, image }) => {
    setIdea({ ...idea, thumbnail_image: thumbnail_image, image: image });
  };

  const handleIsOrganizationsIdeaChange = () => {
    setIdea({ ...idea, is_organizations_idea: !idea.is_organizations_idea });
  };

  const onSubmitIdea = (e) => {
    e.preventDefault();
    if (!isLocationValid(idea.location)) {
      indicateWrongLocation(locationInputRef, setLocationOptionsOpen, setErrorMessage, texts);
      return;
    }
  };

  return (
    <GenericDialog
      open={open}
      onClose={onClose}
      title={texts.share_your_idea}
      paperClassName={classes.root}
      closeButtonRightSide
      closeButtonSmall
      titleTextClassName={classes.titleText}
      dialogContentClass={classes.dialogContentClass}
    >
      <LoadingSpinner className={classes.loadingSpinner} isLoading={userOrganizations === null} />
      <div className={classes.content}>
        {step === "idea_info" && (
          <IdeaInfoStep
            idea={idea}
            handleValueChange={handleValueChange}
            updateImages={updateImages}
            goToNextStep={handleStepForward}
          />
        )}
        {step === "idea_metadata" && (
          <IdeaMetadataStep
            idea={idea}
            handleValueChange={handleValueChange}
            handleIsOrganizationsIdeaChange={handleIsOrganizationsIdeaChange}
            locationOptionsOpen={locationOptionsOpen}
            locationInputRef={locationInputRef}
            handleSetLocationOptionsOpen={handleSetLocationOptionsOpen}
            userOrganizations={userOrganizations}
            allHubs={allHubs}
            onSubmitIdea={onSubmitIdea}
            goBack={handleStepBackwards}
            errorMessage={errorMessage}
          />
        )}
      </div>
    </GenericDialog>
  );
}
