import React, { useContext } from "react";
import { Box, FormControlLabel, Switch, TextField, Typography } from "@mui/material";
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

  const handleNotifyAdminsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleSetProjectData({ notify_admins: e.target.checked });
  };

  return (
    <>
      <Typography component="h2" variant="subtitle2" color="primary" className={classes.subHeader}>
        {texts.registration_settings}
      </Typography>
      <Box sx={{ display: "flex", flexWrap: { xs: "wrap", md: "nowrap" }, gap: 2 }}>
        <Box sx={{ width: { xs: "100%", md: 240 } }}>
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
        </Box>
        <Box sx={{ width: { xs: "100%", md: 240 } }}>
          <DatePicker
            required
            className={classes.datePicker}
            label={texts.registration_end_date}
            enableTime={true}
            handleChange={handleRegistrationEndDateChange}
            date={
              projectData.registration_end_date ? dayjs(projectData.registration_end_date) : null
            }
            maxDate={projectData.end_date ? dayjs(projectData.end_date) : undefined}
            error={errors.registration_end_date as any}
          />
        </Box>
      </Box>
      <Box sx={{ width: "100%", mt: 1 }}>
        <FormControlLabel
          control={
            <Switch
              checked={projectData.notify_admins !== false}
              onChange={handleNotifyAdminsChange}
              color="primary"
              aria-label={texts.notify_admins_on_registration}
            />
          }
          label={texts.notify_admins_on_registration}
        />
      </Box>
    </>
  );
}
