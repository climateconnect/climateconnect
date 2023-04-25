import React from "react";
import "date-fns";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

import { DatePicker as DatePickerComponent } from "@mui/x-date-pickers/DatePicker";

type Props = {
  label?: any;
  date?: any;
  handleChange?: any;
  className?: any;
  minDate?: any;
  maxDate?: any;
  required?: any;
};
export default function DatePicker({
  label,
  date,
  handleChange,
  className,
  minDate,
  maxDate,
  required,
}: Props) {
  const handleDateChange = (selectedDate) => {
    handleChange(selectedDate);
  };
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePickerComponent
        className={className}
        // disableToolbar
        // variant="inline"
        format="MM/dd/yyyy"
        // margin="normal"
        label={label}
        value={date ? date : null}
        onChange={handleDateChange}
        // KeyboardButtonProps={{
        //   "aria-label": "change date",
        // }}
        maxDate={maxDate && maxDate}
        minDate={minDate && minDate}
        // autoOk
        // required={required}
      />
    </LocalizationProvider>
  );
}
