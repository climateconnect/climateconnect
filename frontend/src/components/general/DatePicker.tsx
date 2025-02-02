import React, { useContext } from "react";
import "date-fns";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import "dayjs/locale/de";
import "dayjs/locale/en";
import { Dayjs } from "dayjs";

import { DatePicker as DatePickerComponent } from "@mui/x-date-pickers/DatePicker";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import UserContext from "../context/UserContext";
import { ThemeProvider } from "@mui/material";
import { useTheme } from "@mui/styles";

type Props = {
  label?: string;
  date?: Date | null | Dayjs;
  handleChange: Function;
  className?: string;
  minDate?: Date | Dayjs | null;
  maxDate?: Date | Dayjs | null;
  enableTime?: boolean;
  error?: "string";
};
export default function DatePicker({
  label,
  date,
  handleChange,
  className,
  minDate,
  maxDate,
  enableTime,
  error,
}: Props) {
  const { locale } = useContext(UserContext);
  const theme = useTheme();
  const handleDateChange = (value) => {
    handleChange(value);
  };

  const args = {
    className: className,
    label: label,
    value: date ? date : null,
    onChange: handleDateChange,
    maxDate: maxDate && maxDate,
    minDate: minDate && minDate,
    slotProps: {
      textField: {
        helperText: error,
        error: !!error,
      },
    },
  };

  const helperTheme = {
    ...theme,
    palette: {
      ...theme.palette,
      primary: {
        ...theme.palette.primary,
        main: theme.palette.background.default_contrastText,
      },
    },
  };

  //Using helper theme because date picker component always uses primary color
  return (
    <LocalizationProvider adapterLocale={locale} dateAdapter={AdapterDayjs}>
      <ThemeProvider theme={helperTheme}>
        {enableTime ? (
          <DateTimePicker {...args} minDateTime={minDate && minDate} />
        ) : (
          <DatePickerComponent {...args} />
        )}
      </ThemeProvider>
    </LocalizationProvider>
  );
}
