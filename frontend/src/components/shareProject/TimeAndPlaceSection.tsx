import React, { useContext } from "react";
import { Project } from "../../types";
import DatePicker from "../general/DatePicker";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import makeStyles from "@mui/styles/makeStyles";
import { Dayjs } from "dayjs";
import ProjectLocationSearchBar from "./ProjectLocationSearchBar";
import { Theme } from "@mui/material";
import { getProjectTypeDateOptions } from "../../../public/data/projectTypeOptions";

const useStyles = makeStyles<Theme, { displayDate?: boolean }>((theme) => {
  return {
    root: {
      [theme.breakpoints.up("md")]: {
        display: "flex",
        justifyContent: "space-between",
      },
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
        paddingRight: 0,
      },
    },
    locationSearchBar: (props) => ({
      [theme.breakpoints.up("sm")]: {
        width: "50%",
        paddingLeft: props.displayDate ? theme.spacing(2) : 0,
        paddingRight: props.displayDate ? 0 : theme.spacing(2),
      },
    }),
  };
});

type Args = {
  projectData: Project;
  handleSetProjectData: Function;
  errors: any;
};

export default function ProjectTimeAndPlaceSection({
  projectData,
  handleSetProjectData,
  errors,
}: Args) {
  const { locale } = useContext(UserContext);
  const texts = getTexts({ locale: locale, page: "project" });
  const classes = useStyles({ displayDate: projectData.project_type !== "idea" });
  const PROJECT_TYPE_DATE_OPTIONS = getProjectTypeDateOptions(texts);

  type DateChangeProp = "start_date" | "end_date";
  //TODO: Make sure end date is after start date (in both frontend and backend)
  const handleDateChange = (value: Dayjs, prop: DateChangeProp) => {
    const noEndDateSet = prop === "start_date" && !isNaN(value?.$d) && !projectData.end_date;
    const endDateBeforeStartDate =
      prop === "start_date" && projectData.end_date && projectData.end_date < value;
    if (
      PROJECT_TYPE_DATE_OPTIONS[projectData.project_type.type_id].enableEndDate &&
      (noEndDateSet || endDateBeforeStartDate)
    ) {
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
        PROJECT_TYPE_DATE_OPTIONS[projectData.project_type.type_id].enableStartDate && (
          <div className={classes.datePickerContainer}>
            <DatePicker
              className={classes.datePicker}
              label={PROJECT_TYPE_DATE_OPTIONS[projectData.project_type.type_id].startDateLabel}
              enableTime={PROJECT_TYPE_DATE_OPTIONS[projectData.project_type.type_id].enableTime}
              handleChange={(newDate) => handleDateChange(newDate, "start_date")}
              date={projectData.start_date}
              error={errors.start_date}
            />
            {PROJECT_TYPE_DATE_OPTIONS[projectData.project_type.type_id].enableEndDate && (
              <DatePicker
                className={classes.datePicker}
                label={PROJECT_TYPE_DATE_OPTIONS[projectData.project_type.type_id].endDateLabel}
                enableTime={PROJECT_TYPE_DATE_OPTIONS[projectData.project_type.type_id].enableTime}
                handleChange={(newDate) => handleDateChange(newDate, "end_date")}
                minDate={projectData.start_date || null}
                date={projectData.end_date}
                error={errors.end_date}
              />
            )}
          </div>
        )
      }
      <ProjectLocationSearchBar
        projectData={projectData}
        handleSetProjectData={handleSetProjectData}
        className={classes.locationSearchBar}
      />
    </div>
  );
}
