import React, { useContext } from "react";
import { Project } from "../../types";
import DatePicker from "../general/DatePicker";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import makeStyles from "@mui/styles/makeStyles";
import { Dayjs } from "dayjs";
import ProjectLocationSearchBar from "./ProjectLocationSearchBar";

const useStyles = makeStyles((theme) => {
  return {
    root: {
      [theme.breakpoints.up("md")]: {
        display: "flex",
        justifyContent: "space-between",
      }
    },
    datePicker: {
      marginBottom: theme.spacing(2),
      display: "block",
      width: "100%",
    },
    datePickerContainer: {
      width: "50%",
      paddingRight: theme.spacing(2),
      [theme.breakpoints.down("sm")]: {
        width: "100%",
        paddingRight: 0
      }
    },
  };
});

type Args = {
  projectData: Project;
  handleSetProjectData: Function;
};

export default function ProjectTimeAndPlaceSection({ projectData, handleSetProjectData }: Args) {
  const { locale } = useContext(UserContext);
  const texts = getTexts({ locale: locale, page: "project" });
  const classes = useStyles();

  const dateOptions = {
    project: {
      startDateLabel: texts.start_date,
      enableTime: false,
    },
    event: {
      enableTime: true,
      startDateLabel: texts.event_start_date,
      endDateLabel: texts.event_finish_date,
    },
  };

  type DateChangeProp = "start_date" | "end_date";
  //TODO: Make sure end date is after start date (in both frontend and backend)
  const handleDateChange = (value: Dayjs, prop: DateChangeProp) => {
    const noEndDateSet = prop === "start_date" && !isNaN(value.$d) && !projectData.end_date;
    const endDateBeforeStartDate =
      prop === "start_date" && projectData.end_date && projectData.end_date < value;
    if (noEndDateSet || endDateBeforeStartDate) {
      const endDateSuggestion = value.add(1, "h");
      handleSetProjectData({
        start_date: value,
        end_date: endDateSuggestion,
      });
    } else {
      handleSetProjectData({
        [prop || "start_date"]: value,
      });
    }
  };

  return (
    <div className={classes.root}>
      {
        //Don't display a date for ideas. We'll assume the person sharing just had the idea
        projectData.type !== "idea" && (
          <div className={classes.datePickerContainer}>
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
                minDate={projectData.start_date || null}
                date={projectData.end_date}
              />
            )}
          </div>
        )
      }
      <ProjectLocationSearchBar
        projectData={projectData}
        handleSetProjectData={handleSetProjectData}
      />
    </div>
  );
}
