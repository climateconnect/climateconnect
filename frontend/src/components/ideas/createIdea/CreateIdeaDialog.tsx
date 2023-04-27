import { Theme } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext, useRef, useState } from "react";
import Cookies from "universal-cookie";
import { apiRequest, redirect } from "../../../../public/lib/apiOperations";
import { blobFromObjectUrl } from "../../../../public/lib/imageOperations";
import { indicateWrongLocation, isLocationValid } from "../../../../public/lib/locationOperations";
import getTexts from "../../../../public/texts/texts";
import UserContext from "../../context/UserContext";
import GenericDialog from "../../dialogs/GenericDialog";
import LoadingSpinner from "../../general/LoadingSpinner";
import IdeaCreationLoadingScreen from "./IdeaCreationLoadingScreen";
import IdeaInfoStep from "./IdeaInfoStep";
import IdeaMetadataStep from "./IdeaMetadataStep";

const useStyles = makeStyles<Theme, { userOrganizations?: any }>((theme) => ({
  root: {
    border: `3px solid ${theme.palette.primary.main}`,
    borderRadius: theme.spacing(2),
  },
  titleText: {
    fontWeight: 600,
    color: theme.palette.secondary.main,
    [theme.breakpoints.down("sm")]: {
      fontSize: 18,
    },
  },
  dialogContentClass: {
    paddingTop: 0,
  },
  content: (props) => ({
    visibility: props.userOrganizations === null ? "hidden" : undefined,
  }),
}));

const getTypeFromLocation = (location) => {
  if (location?.multi_polygon) return "Polygon";
  else return "Point";
};

export default function CreateIdeaDialog({
  open,
  onClose,
  allHubs,
  userOrganizations,
  hubLocation,
  hubData,
  resetTabsWhereFiltersWereApplied,
}) {
  const [waitingForCreation, setWaitingForCreation] = useState(false);
  const classes = useStyles({ userOrganizations });
  const token = new Cookies().get("auth_token");
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "idea", locale: locale });
  const [idea, setIdea] = useState({
    name: "",
    short_description: "",
    image: "",
    thumbnail_image: "",
    hub: "",
    is_organizations_idea: false,
    parent_organization: null,
    hub_shared_in: hubData?.url_slug,
    location: hubLocation && {
      ...hubLocation,
      type: getTypeFromLocation(hubLocation),
      lon: parseFloat(hubLocation.centre_point.replace("SRID=4326;POINT (", "").split(" ")[0]),
      lat: parseFloat(
        hubLocation.centre_point.replace("SRID=4326;POINT (", "").split(" ")[1].replace(")", "")
      ),
    },
  });
  const STEPS = ["idea_info", "idea_metadata"];
  const [step, setStep] = useState(STEPS[0]);
  const [errorMessage, setErrorMessage] = useState(null as string | null);
  const [locationOptionsOpen, setLocationOptionsOpen] = useState(false);
  const locationInputRef = useRef(null);

  const handleClose = (e) => {
    if (!waitingForCreation) onClose(e);
  };

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

  const onSubmitIdea = async (e) => {
    e.preventDefault();
    if (!isLocationValid(idea.location)) {
      indicateWrongLocation(locationInputRef, setLocationOptionsOpen, setErrorMessage, texts);
      return;
    }
    try {
      setWaitingForCreation(true);
      const payload = await parseIdeaForCreateRequest(idea, locale);
      const response = await apiRequest({
        method: "post",
        url: "/api/create_idea/",
        payload: payload,
        token: token,
        locale: locale,
      });
      const url_slug = response.data;

      //TODO: link idea!
      resetTabsWhereFiltersWereApplied();
      redirect(
        window.location.pathname,
        {
          message: texts.idea_has_been_created,
          idea: url_slug,
        },
        window.location.hash
      );

      setWaitingForCreation(false);
    } catch (e: any) {
      console.log("there has been an error :,(");
      setWaitingForCreation(false);
      setErrorMessage(
        "There has been an error while creating your idea. Please contact contact@climateconnect.earth"
      );
      console.log(e);
      console.log(e.response);
    }
  };

  return (
    <GenericDialog
      open={open}
      onClose={handleClose}
      title={waitingForCreation ? texts.your_idea_is_being_created : texts.share_your_idea}
      paperClassName={classes.root}
      closeButtonRightSide
      closeButtonSmall
      titleTextClassName={classes.titleText}
      dialogContentClass={classes.dialogContentClass}
    >
      {userOrganizations === null ? (
        <LoadingSpinner className={classes.loadingSpinner} isLoading={userOrganizations === null} />
      ) : waitingForCreation ? (
        <IdeaCreationLoadingScreen />
      ) : (
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
              /*TODO(undefined) hubLocation={hubLocation} */
            />
          )}
        </div>
      )}
    </GenericDialog>
  );
}

const parseIdeaForCreateRequest = async (idea, locale) => {
  const parsedIdea = {
    ...idea,
    hub: idea.hub.url_slug,
    source_language: locale,
  };

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
