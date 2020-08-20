import React from "react";
import Link from "next/link";
import {
  TextField,
  Button,
  Container,
  LinearProgress,
  Typography,
  IconButton,
  Checkbox,
  Switch
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
  },
  switchText: {
    textAlign: "center",
    position: "relative"
  },
  bold: {
    fontWeight: "bold"
  },
  flexBlock: {
    display: "flex",
    justifyContent: "space-around"
  },
  switchTextContainer: {
    display: "flex",
    alignItems: "center"
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
  alignButtonsRight,
  className,
  fieldClassName
}) {
  const classes = useStyles();

  const [curPercentage, setCurPercentage] = React.useState(percentage);
  const [values, setValues] = React.useState(
    fields.reduce((obj, field) => {
      if (field.select) obj[field.key] = field.select.defaultValue ? field.select.defaultValue : "";
      else if (field.value) obj[field.key] = field.value;
      else if (field.type === "checkbox" || field.type === "switch")
        obj[field.key] = field.checked ? field.checked : false;
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
      [key]: type === "checkbox" || type === "switch" ? event.target.checked : event.target.value
    };
    if (type === "checkbox" || type === "switch") {
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
    <div className={`${className ? className : classes.root}`}>
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
          if (
            (!field.onlyShowIfChecked || values[field.onlyShowIfChecked] === true) &&
            field.select
          ) {
            let options = field.select.values;
            if (field.select.addEmptyValue) options = ["", ...options];
            return (
              <React.Fragment key={field.key}>
                <SelectField
                  controlledValue={{ name: values[field.key] }}
                  controlled
                  required={field.required}
                  options={options}
                  label={field.label}
                  className={`${classes.blockElement} ${fieldClassName}`}
                  key={field.label + fields.indexOf(field)}
                  onChange={() => handleValueChange(event, field.key, field.type, true)}
                  InputProps={{
                    classes: {
                      root: classes.inputField,
                      notchedOutline: classes.notchedOutline
                    }
                  }}
                />
                {field.bottomLink && field.bottomLink}
              </React.Fragment>
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
          } else if (field.type === "switch") {
            return (
              <div className={classes.flexBlock} key={field.key}>
                <span className={classes.switchTextContainer}>
                  <Typography
                    className={`${classes.switchText} ${!values[field.key] && classes.bold}`}
                    color={values[field.key] ? "secondary" : "primary"}
                  >
                    {field.falseLabel}
                  </Typography>
                </span>
                <Switch
                  id={"checkbox" + field.key}
                  checked={values[field.key]}
                  required={field.required}
                  color="primary"
                  name="checkedA"
                  inputProps={{ "aria-label": "secondary checkbox" }}
                  onChange={() => handleValueChange(event, field.key, field.type)}
                />
                <span className={classes.switchTextContainer}>
                  <Typography
                    className={`${classes.switchText} ${values[field.key] && classes.bold}`}
                    color={values[field.key] ? "primary" : "secondary"}
                  >
                    {field.trueLabel}
                  </Typography>
                </span>
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
              <React.Fragment key={field.key}>
                <TextField
                  required={field.required}
                  fullWidth
                  autoFocus={field === fields[0]}
                  label={field.label}
                  type={field.type}
                  variant="outlined"
                  value={values[field.key]}
                  className={`${classes.blockElement} ${fieldClassName}`}
                  onBlur={handleBlur}
                  onChange={() => handleValueChange(event, field.key, field.type)}
                  InputProps={{
                    classes: {
                      root: classes.inputField,
                      notchedOutline: classes.notchedOutline
                    }
                  }}
                />
                {field.bottomLink && field.bottomLink}
              </React.Fragment>
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
