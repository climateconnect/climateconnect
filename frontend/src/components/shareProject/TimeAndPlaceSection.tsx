import React, { useContext } from "react";
import { Project } from "../../types";
import DatePicker from "../general/DatePicker";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import makeStyles from "@mui/styles/makeStyles";
import dayjs, { Dayjs } from "dayjs"

const useStyles = makeStyles((theme) => {
  return {
    datePicker: {
      marginBottom: theme.spacing(2),
      display: "block",
      [theme.breakpoints.down("sm")]: {
        width: "100%",
      }
    }
  }
})

type Args = {
  projectData: Project;
  handleSetProjectData: Function;
};

export default function ProjectTimeAndPlaceSection({ projectData, handleSetProjectData }: Args) {
  const { locale } = useContext(UserContext);
  const texts = getTexts({ locale: locale, page: "project" });
  const classes = useStyles()
  const [date, setDate] = React.useState();

  const dateOptions = {
    project: {
      startDateLabel: texts.start_date,
      enableTime: false
    },
    event: {
      enableTime: true,
      startDateLabel: texts.event_start_date,
      endDateLabel: texts.event_finish_date
    }
  }

  type DateChangeProp = "start_date" | "end_date"
  //TODO: Make sure end date is after start date (in both frontend and backend)
  const handleDateChange = (value: Dayjs, prop: DateChangeProp) => {
    if(prop === "start_date" && !isNaN(value.$d) && !projectData.end_date) {
      const endDateSuggestion = value.add(1, 'h')
      handleSetProjectData({
        start_date: value,
        end_date: endDateSuggestion
      })
    } else {
      handleSetProjectData({
        [prop || "start_date"]: value
      })
    }
  }

  const ProjectLocationSearchBar = () => {
    return <div></div>;
  };

  return (
    <div>
      {
        //Don't display a date for ideas. We'll assume the person sharing just had the idea
        projectData.type !== "idea" && (
          <div>
            <DatePicker 
              className={classes.datePicker}
              label={dateOptions[projectData.type].startDateLabel} 
              enableTime={dateOptions[projectData.type].enableTime} 
              handleChange={(newDate) => handleDateChange(newDate, "start_date")}
              date={projectData.start_date}
            />
            {projectData.type === "event" && (
              <DatePicker
                className={classes.datePicker}
                label={dateOptions[projectData.type].endDateLabel} 
                enableTime={dateOptions[projectData.type].enableTime} 
                handleChange={(newDate) => handleDateChange(newDate, "end_date")}
                date={projectData.end_date}
              />
            )}
          </div>
        )
      }
      <ProjectLocationSearchBar />
    </div>
  );
}
