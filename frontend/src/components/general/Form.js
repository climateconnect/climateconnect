import React from "react";
import Link from "next/link";
import {
  TextField,
  Button,
  Container,
  LinearProgress,
  Typography,
  IconButton,
  Checkbox
} from "@material-ui/core";
import SelectField from "./SelectField";
import { makeStyles } from "@material-ui/core/styles";
import KeyboardBackspaceIcon from "@material-ui/icons/KeyboardBackspace";
import AutoCompleteSearchBar from "./AutoCompleteSearchBar";

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(4),
    maxWidth: 700,
    margin: "0 auto"
  },
  blockElement: {
    display: "block",
    maxWidth: 700,
    height: 56,
    margin: "0 auto",
    marginTop: theme.spacing(2)
  },
  checkbox: {
    display: "block",
    margin: "0 auto",
    marginTop: theme.spacing(1),
    fontSize: 13
  },
  inlineBlockElement: {
    display: "inline-block"
  },
  bottomMessages: {
    textAlign: "center",
    display: "block"
  },
  bottomMessageContainer: {
    marginTop: theme.spacing(2)
  },
  percentage: {
    textAlign: "center",
    color: `${theme.palette.primary.main}`,
    fontWeight: "bold"
  },
  progressBar: {
    height: 5,
    marginBottom: theme.spacing(3),
    marginTop: theme.spacing(1)
  },
  centerText: {
    textAlign: "center"
  },
  backButton: {
    float: "left"
  },
  inputField: {
    borderRadius: 2,
    borderWidth: 5
  },
  notchedOutline: {
    borderWidth: 2
  },
  rightAlignedButton: {
    float: "right",
    marginTop: theme.spacing(4)
  }
}));

//TODO throw error if "label" isn't unique

//@fields: [{required: boolean, label: text, type: CSS Input Type, progressOnFill: number, select:select(see below)}, ...]
//@select: {selectValues: [{label:text, value: text}], defaultValue=text}
//@messages: {submitMessage:text, headerMessage: text, bottomMessage:text}
//@bottomLink: {text: text, href: url}
//@formAction: {href: href, method: method}
export default function Form({
  fields,
  messages,
  bottomLink,
  formAction,
  usePercentage,
  percentage,
  onSubmit,
  errorMessage,
  onGoBack,
  alignButtonsRight
}) {
  const classes = useStyles();

  const [curPercentage, setCurPercentage] = React.useState(percentage);
  const [values, setValues] = React.useState(
    fields.reduce((obj, field) => {
      if (field.select) obj[field.key] = field.select.defaultValue ? field.select.defaultValue : "";
      else if (field.value) obj[field.key] = field.value;
      else if (field.type === "checkbox") obj[field.key] = field.checked ? field.checked : false;
      else obj[field.key] = "";
      return obj;
    }, {})
  );

  function updatePercentage(customValues) {
    const filledFields =
      customValues && typeof customValues === "object"
        ? fields.filter(field => !!customValues[field.key])
        : fields.filter(field => !!values[field.key]);
    if (filledFields.length) {
      const totalValue = filledFields.reduce((accumulator, curField) => {
        return accumulator + curField.progressOnFill;
      }, 0);
      setCurPercentage(percentage + totalValue);
    }
  }

  function handleValueChange(event, key, type, updateInstantly) {
    const newValues = {
      ...values,
      [key]: type === "checkbox" ? event.target.checked : event.target.value
    };
    if (type === "checkbox") {
      const dependentFields = fields.filter(
        f => f.onlyShowIfChecked && f.onlyShowIfChecked === key
      );
      if (dependentFields.length) dependentFields.map(f => (newValues[f.key] = ""));
    }
    setValues(newValues);
    //setValues doesn't apply instantly, so we pass the new values to the updatePercentage function
    if (updateInstantly) updatePercentage(newValues);
  }

  function handleBlur() {
    updatePercentage();
  }

  return (
    <div className={classes.root}>
      {messages.headerMessage ? (
        <Typography component="h2" variant="subtitle1" className={classes.centerText}>
          {onGoBack && (
            <IconButton
              size="small"
              className={classes.backButton}
              onClick={() => onGoBack(event, values)}
            >
              <KeyboardBackspaceIcon />
            </IconButton>
          )}
          {messages.headerMessage}
        </Typography>
      ) : (
        <></>
      )}
      {usePercentage ? (
        <LinearProgress
          value={curPercentage}
          variant="determinate"
          className={classes.progressBar}
        />
      ) : (
        <></>
      )}
      <form
        action={formAction && formAction.action}
        method={formAction && formAction.method}
        onSubmit={() => onSubmit(event, values)}
      >
        {errorMessage && (
          <Typography component="div" color="error" className={classes.centerText}>
            {errorMessage}
          </Typography>
        )}
        {fields.map(field => {
          if (field.select) {
            return (
              <SelectField
                defaultValue={field.select.defaultValue}
                required={field.required}
                options={field.select.values}
                label={field.label}
                className={classes.blockElement}
                key={field.label + fields.indexOf(field)}
                onChange={() => handleValueChange(event, field.key, field.type, true)}
                InputProps={{
                  classes: {
                    root: classes.inputField,
                    notchedOutline: classes.notchedOutline
                  }
                }}
              />
            );
          } else if (field.type === "checkbox") {
            return (
              <div className={classes.checkbox} key={field.key}>
                <Checkbox
                  id={"checkbox" + field.key}
                  checked={values[field.key]}
                  required={field.required}
                  className={classes.inlineBlockElement}
                  color="primary"
                  size="small"
                  onBlur={handleBlur}
                  onChange={() => handleValueChange(event, field.key, field.type)}
                />
                <label htmlFor={"checkbox" + field.key}>{field.label}</label>
              </div>
            );
          } else if (
            (!field.onlyShowIfChecked || values[field.onlyShowIfChecked] === true) &&
            field.type === "autocomplete"
          ) {
            return (
              <AutoCompleteSearchBar
                required={field.required}
                autoFocus={field === fields[0]}
                label={field.autoCompleteProps.label}
                key={field.key}
                freeSolo={field.autoCompleteProps.freeSolo}
                baseUrl={field.autoCompleteProps.baseUrl}
                clearOnSelect={field.autoCompleteProps.clearOnSelect}
                onSelect={field.autoCompleteProps.onSelect}
                renderOption={field.autoCompleteProps.renderOption}
                getOptionLabel={field.autoCompleteProps.getOptionLabel}
                filterOut={field.autoCompleteProps.filterOut}
                helperText={field.autoCompleteProps.helperText}
                onUnselect={field.autoCompleteProps.onUnselect}
              />
            );
          } else if (!field.onlyShowIfChecked || values[field.onlyShowIfChecked] === true) {
            return (
              <TextField
                required={field.required}
                fullWidth
                autoFocus={field === fields[0]}
                label={field.label}
                key={field.key}
                type={field.type}
                variant="outlined"
                value={values[field.key]}
                className={classes.blockElement}
                onBlur={handleBlur}
                onChange={() => handleValueChange(event, field.key, field.type)}
                InputProps={{
                  classes: {
                    root: classes.inputField,
                    notchedOutline: classes.notchedOutline
                  }
                }}
              />
            );
          }
        })}
        <Button
          fullWidth={!alignButtonsRight}
          variant="contained"
          type="submit"
          color="primary"
          className={`${alignButtonsRight ? classes.rightAlignedButton : classes.blockElement}`}
        >
          {messages.submitMessage}
        </Button>
      </form>
      {messages.bottomMessage || bottomLink ? (
        <Container className={classes.bottomMessageContainer}>
          {messages.bottomMessage ? (
            <div className={classes.bottomMessages}>{messages.bottomMessage}</div>
          ) : (
            <></>
          )}
          {bottomLink ? (
            <Link href={bottomLink.href}>
              <a className={classes.bottomMessages}>{bottomLink.text}</a>
            </Link>
          ) : (
            <></>
          )}
        </Container>
      ) : (
        <></>
      )}
    </div>
  );
}
