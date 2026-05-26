import React, { useContext } from "react";
import { Box, FormHelperText, TextField, Typography } from "@mui/material";
import { Theme } from "@mui/material/styles";
import makeStyles from "@mui/styles/makeStyles";
import { RegistrationField } from "../../types";
import UserContext from "../context/UserContext";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginBottom: theme.spacing(2),
    paddingLeft: 0,
  },
  label: {
    fontWeight: 500,
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(1),
  },
  required: {
    color: theme.palette.error.main,
    marginLeft: theme.spacing(0.5),
  },
  description: {
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1),
    fontSize: "0.875rem",
  },
  errorText: {
    color: theme.palette.error.main,
  },
}));

function formatTimeRange(startIso: string, endIso: string, locale: string): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const dateFmt = new Intl.DateTimeFormat(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const timeFmt = new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
  });

  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();

  if (sameDay) {
    return `${dateFmt.format(start)}, ${timeFmt.format(start)} – ${timeFmt.format(end)}`;
  }
  return `${dateFmt.format(start)}, ${timeFmt.format(start)} – ${dateFmt.format(
    end
  )}, ${timeFmt.format(end)}`;
}

type Props = {
  field: RegistrationField;
  optionId: number | undefined;
  onChange: (_optionId: number) => void;
  error?: string;
  texts: {
    please_select_time_slot: string;
    seats_available: string;
  };
};

export default function RegistrationTimeSlotField({
  field,
  optionId,
  onChange,
  error,
  texts,
}: Props) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const title = field.settings.title ?? "";
  const description = field.settings.description ?? "";
  const sortedOptions = [...(field.options ?? [])].sort((a, b) => a.order - b.order);

  const handleSelectChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = event.target.value;
    if (val === "") return;
    onChange(Number(val));
  };

  return (
    <Box className={classes.root}>
      <Typography component="div" variant="body2" className={classes.label}>
        {title}
        {field.is_required && (
          <span className={classes.required} aria-hidden="true">
            {" *"}
          </span>
        )}
      </Typography>
      {description && (
        <Typography variant="body2" className={classes.description}>
          {description}
        </Typography>
      )}
      <TextField
        select
        fullWidth
        size="small"
        value={optionId ?? ""}
        onChange={handleSelectChange}
        required={field.is_required}
        SelectProps={{ native: true }}
      >
        <option value="">{texts.please_select_time_slot}</option>
        {sortedOptions.map((opt) => {
          const isDisabled = opt.remaining_amount === 0;
          const hasStartEnd = opt.start_time && opt.end_time;
          const timeLabel = hasStartEnd
            ? formatTimeRange(opt.start_time!, opt.end_time!, locale)
            : opt.title;
          const capacityLabel =
            opt.remaining_amount != null
              ? ` (${opt.remaining_amount} ${texts.seats_available})`
              : "";
          return (
            <option key={opt.id} value={opt.id} disabled={isDisabled}>
              {timeLabel}
              {hasStartEnd ? capacityLabel : ""}
            </option>
          );
        })}
      </TextField>
      {error && <FormHelperText className={classes.errorText}>{error}</FormHelperText>}
    </Box>
  );
}
