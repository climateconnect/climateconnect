import React, { useContext } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import { Theme } from "@mui/material/styles";
import makeStyles from "@mui/styles/makeStyles";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CloseIcon from "@mui/icons-material/Close";

import getTexts from "../../../public/texts/texts";
import { RegistrationField, RegistrationFieldAnswer } from "../../types";
import UserContext from "../context/UserContext";

const useStyles = makeStyles((theme: Theme) => ({
  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  closeButton: {
    color: theme.palette.grey[500],
  },
  fieldBlock: {
    marginBottom: theme.spacing(3),
    "&:last-child": {
      marginBottom: 0,
    },
  },
  checkboxRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: theme.spacing(1.5),
  },
  checkboxIconChecked: {
    color: theme.palette.primary.main,
    marginTop: 2,
  },
  checkboxIconUnchecked: {
    color: theme.palette.action.disabled,
    marginTop: 2,
  },
  descriptionHtml: {
    flex: 1,
    "& a": {
      color: theme.palette.primary.main,
    },
    "& p": {
      margin: 0,
    },
  },
  optionFieldTitle: {
    marginBottom: theme.spacing(0.5),
  },
  optionAnswer: {
    color: theme.palette.text.secondary,
  },
  emptyState: {
    fontStyle: "italic",
    color: theme.palette.text.secondary,
  },
  cancelledNotice: {
    marginBottom: theme.spacing(2),
  },
}));

export type ViewRegistrationAnswersModalRegistration = {
  user_first_name: string;
  user_last_name: string;
  cancelled_at: string | null;
  field_answers: RegistrationFieldAnswer[];
};

type Props = {
  open: boolean;
  onClose: () => void;
  /** Registration row whose answers should be displayed (null = closed). */
  registration: ViewRegistrationAnswersModalRegistration | null;
  /**
   * Field definitions from ``eventRegistration.fields`` — used to resolve
   * titles, descriptions, options and field order for the answers.
   */
  fields: RegistrationField[];
};

/**
 * Read-only display of a registrant's custom-field answers.
 *
 * Renders answers in the same visual style as the registration form:
 *   - Checkbox fields show the (sanitized) description with a checked /
 *     unchecked icon — not interactive.
 *   - Option-select fields show the field title and the selected option as
 *     plain text.
 *
 * Field labels and option titles are resolved client-side from the supplied
 * ``fields`` definitions; the API only returns answer IDs.
 */
export default function ViewRegistrationAnswersModal({
  open,
  onClose,
  registration,
  fields,
}: Props) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale });

  if (!registration) {
    return null;
  }

  const sortedFields = [...fields].sort((a, b) => a.order - b.order);
  const answersByFieldId = new Map<number, RegistrationFieldAnswer>();
  for (const answer of registration.field_answers) {
    answersByFieldId.set(answer.field, answer);
  }

  const fullName = `${registration.user_first_name} ${registration.user_last_name}`.trim();
  const title = (texts.registration_answers_modal_title as string).replace("{name}", fullName);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" scroll="paper">
      <DialogTitle className={classes.titleRow}>
        <IconButton
          aria-label={texts.close as string}
          className={classes.closeButton}
          onClick={onClose}
          size="small"
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" component="span">
          {title}
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        {registration.cancelled_at && (
          <Alert severity="warning" className={classes.cancelledNotice}>
            {texts.registration_answers_cancelled_notice}
          </Alert>
        )}

        {sortedFields.length === 0 || registration.field_answers.length === 0 ? (
          <Typography variant="body2" className={classes.emptyState}>
            {texts.no_registration_answers}
          </Typography>
        ) : (
          sortedFields.map((field) => {
            if (field.id == null) return null;
            const answer = answersByFieldId.get(field.id);
            if (!answer) return null;

            if (field.field_type === "checkbox") {
              const checked = answer.value_boolean === true;
              const description = field.settings.description ?? "";
              const stateLabel = checked
                ? (texts.registration_answer_checked as string)
                : (texts.registration_answer_unchecked as string);

              return (
                <Box key={field.id} className={classes.fieldBlock}>
                  <Box className={classes.checkboxRow}>
                    {checked ? (
                      <CheckBoxIcon
                        className={classes.checkboxIconChecked}
                        fontSize="small"
                        aria-label={stateLabel}
                      />
                    ) : (
                      <CheckBoxOutlineBlankIcon
                        className={classes.checkboxIconUnchecked}
                        fontSize="small"
                        aria-label={stateLabel}
                      />
                    )}
                    <Typography variant="body2" component="div" className={classes.descriptionHtml}>
                      {/* Description was sanitized on organiser write. */}
                      <div dangerouslySetInnerHTML={{ __html: description }} />
                    </Typography>
                  </Box>
                </Box>
              );
            }

            if (field.field_type === "option_select") {
              const fieldTitle = field.settings.title ?? "";
              const selectedOption = (field.options ?? []).find(
                (opt) => opt.id != null && opt.id === answer.value_option
              );
              const answerText =
                selectedOption?.title ?? (texts.registration_answer_no_selection as string);

              return (
                <Box key={field.id} className={classes.fieldBlock}>
                  <Typography variant="body2" className={classes.optionFieldTitle}>
                    {fieldTitle}
                  </Typography>
                  <Typography variant="body2" className={classes.optionAnswer}>
                    {answerText}
                  </Typography>
                </Box>
              );
            }

            return null;
          })
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center" }}>
        <Button onClick={onClose} color="primary" variant="contained">
          {texts.close as string}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
