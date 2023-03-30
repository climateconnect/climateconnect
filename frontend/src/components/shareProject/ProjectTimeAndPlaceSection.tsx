import React, { useContext } from "react";
import { Project } from "../../types";
import DatePicker from "../general/DatePicker";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";

type Args = {
  projectData: Project;
  handleSetProjectData: Function;
};

export default function ProjectTimeAndPlaceSection({projectData, handleSetProjectData}: Args) {
  console.log(projectData.type)
  const { locale } = useContext(UserContext)
  const texts = getTexts({locale: locale, page: "project"})

  const ProjectDateAndTimePicker = () => {
    return (
      <div>  
        <DatePicker required label={texts.start_date} variant="outlined"/>
      </div>
    )
  }

  const ProjectLocationSearchBar = () => {
    return <div></div>
  }

  return <div>
    {
      //Don't display a date for ideas. We'll assume the person sharing just had the idea
      projectData.type !== "idea" && (
        <ProjectDateAndTimePicker/>
      )
    }
    <ProjectLocationSearchBar/>
  </div>
}