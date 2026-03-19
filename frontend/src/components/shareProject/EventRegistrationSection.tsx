import React, { useContext } from "react";
import { TextField, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/styles";
import dayjs, { Dayjs } from "dayjs";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import DatePicker from "../general/DatePicker";
import { getBackgroundContrastColor } from "../../../public/lib/themeOperations";
import { Project } from "../../types";

const useStyles = makeStyles((theme) => ({
  subHeader: {
    marginBottom: theme.spacing(2),
    fontSize: 20,
    color: theme.palette.background.default_contrastText,
  },
  datePicker: {
    marginTop: 0,
    display: "block",
    width: "100%",
    marginBottom: theme.spacing(2),
  },
  field: {
    marginBottom: theme.spacing(2),
  },
}));

type RegistrationErrors = {
  max_participants?: string;
  registration_end_date?: string;
};

type Props = {
  projectData: Project;
  handleSetProjectData: Function;
  errors: RegistrationErrors;
};

export default function EventRegistrationSection({
  projectData,
  handleSetProjectData,
  errors,
}: Props) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale });
  const theme = useTheme();
  const backgroundContrastColor = getBackgroundContrastColor(theme);

  const handleMaxParticipantsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === "" ? null : Number(e.target.value);
    handleSetProjectData({ max_participants: value });
  };

  const handleRegistrationEndDateChange = (value: Dayjs) => {
    handleSetProjectData({ registration_end_date: value });
  };

  return (
    <>
      <Typography component="h2" variant="subtitle2" color="primary" className={classes.subHeader}>
        {texts.registration_settings}
      </Typography>
      <div className={classes.field}>
        <TextField
          variant="outlined"
          color={backgroundContrastColor}
          type="number"
          label={texts.max_participants}
          value={projectData.max_participants ?? ""}
          onChange={handleMaxParticipantsChange}
          inputProps={{ min: 1 }}
          error={!!errors.max_participants}
          helperText={errors.max_participants}
          required
        />
      </div>
      <DatePicker
        className={classes.datePicker}
        label={texts.registration_end_date}
        enableTime={true}
        handleChange={handleRegistrationEndDateChange}
        date={projectData.registration_end_date ? dayjs(projectData.registration_end_date) : null}
        maxDate={projectData.end_date ? dayjs(projectData.end_date) : undefined}
        error={errors.registration_end_date as any}
      />
    </>
  );
}
