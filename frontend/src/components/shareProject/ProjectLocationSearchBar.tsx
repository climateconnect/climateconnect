import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import { parseLocation } from "../../../public/lib/locationOperations";
import getTexts from "../../../public/texts/texts";
import { Project } from "../../types";
import UserContext from "../context/UserContext";
import LocationSearchBar from "../search/LocationSearchBar";

type Args = {
  projectData: Project;
  handleSetProjectData: Function;
  className?: any;
  hideHelperText?: boolean;
  locationInputRef?: any;
  locationOptionsOpen?: boolean;
  handleSetLocationOptionsOpen?: Function;
  onChangeLocation?: Function; //Set this if you want the component to be controlled
};

export default function ProjectLocationSearchBar({
  projectData,
  handleSetProjectData,
  className,
  hideHelperText,
  locationInputRef,
  locationOptionsOpen,
  handleSetLocationOptionsOpen,
  onChangeLocation,
}: Args) {
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale: locale });
  const PROJECT_TYPES_WITH_ADD_INFO = ["event"];

  const handleChangeLocationString = (newLocationString) => {
    handleSetProjectData({
      ...projectData,
      loc: newLocationString,
    });
  };

  const handleChangeLocation = (location) => {
    if (onChangeLocation) {
      onChangeLocation(location);
    } else {
      handleSetProjectData({
        ...projectData,
        loc: location,
      });
    }
  };

  const handleChangeAdditionalInfoText = (additionalInfo) => {
    handleSetProjectData({
      ...projectData,
      additional_loc_info: additionalInfo,
    });
  };

  const propsByProjectType = {
    event: {
      label: texts.event_location,
      helperText: texts.event_location_helper_text,
    },
    idea: {
      label: texts.location,
      helperText: "",
    },
    project: {
      label: texts.location,
      helperText: "",
    },
  };

  const additionalProps: any = {};

  //If these props are set the components "open" state is controlled.
  if (locationOptionsOpen && handleSetLocationOptionsOpen) {
    (additionalProps.open = locationOptionsOpen),
      (additionalProps.handleSetOpen = handleSetLocationOptionsOpen);
  }

  return (
    <LocationSearchBar
      className={className}
      label={propsByProjectType[projectData.project_type.type_id]?.label}
      helperText={
        hideHelperText ? null : propsByProjectType[projectData.project_type.type_id]?.helperText
      }
      enableExactLocation
      value={projectData.loc}
      onChange={handleChangeLocationString}
      onSelect={handleChangeLocation}
      required
      additionalInfoText={projectData.additional_loc_info}
      onChangeAdditionalInfoText={handleChangeAdditionalInfoText}
      enableAdditionalInfo={PROJECT_TYPES_WITH_ADD_INFO.includes(projectData.project_type.type_id)}
      hideHelperText={hideHelperText}
      locationInputRef={locationInputRef}
      {...additionalProps}
    />
  );
}
