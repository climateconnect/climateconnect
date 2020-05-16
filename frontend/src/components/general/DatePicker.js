import React from "react";
import "date-fns";
import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider, KeyboardDatePicker } from "@material-ui/pickers";

export default function DatePicker({
  label,
  date,
  handleChange,
  className,
  minDate,
  maxDate,
  required
}) {
  const handleDateChange = selectedDate => {
    handleChange(selectedDate);
  };
  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <KeyboardDatePicker
        className={className}
        disableToolbar
        variant="inline"
        format="MM/dd/yyyy"
        margin="normal"
        label={label}
        value={date ? date : null}
        onChange={handleDateChange}
        KeyboardButtonProps={{
          "aria-label": "change date"
        }}
        maxDate={maxDate && maxDate}
        minDate={minDate && minDate}
        autoOk
        required={required}
      />
    </MuiPickersUtilsProvider>
  );
}
