import React from "react";
import Link from "next/link";
import { TextField, Button, Card, Container, LinearProgress, Typography } from "@material-ui/core";
import SelectField from "./SelectField";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(4),
    maxWidth: 350,
    margin: "0 auto"
  },
  blockElement: {
    display: "block",
    maxWidth: 250,
    height: 56,
    margin: "0 auto",
    marginTop: theme.spacing(2)
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
  }
}));

//@fields: [{required: boolean, label: text, type: CSS Input Type, select:select(see below)}, ...]
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
  percentage
}) {
  const classes = useStyles();

  return (
    <Card className={classes.root}>
      {messages.headerMessage ? (
        <Typography component="h2" variant="subtitle1" className={classes.centerText}>
          {messages.headerMessage}
        </Typography>
      ) : (
        <></>
      )}
      {usePercentage ? (
        <LinearProgress value={percentage} variant="determinate" className={classes.progressBar} />
      ) : (
        <></>
      )}
      <form action={formAction.href} method={formAction.method}>
        {fields.map(field => {
          if (field.select) {
            return (
              <SelectField
                field={field}
                className={classes.blockElement}
                key={field.label + fields.indexOf(field)}
              />
            );
          } else {
            return (
              <TextField
                required={field.required}
                fullWidth
                autoFocus={field === fields[0]}
                label={field.label}
                key={field.label + fields.indexOf(field)}
                type={field.type}
                variant="outlined"
                className={classes.blockElement}
              />
            );
          }
        })}
        <Button
          fullWidth
          variant="contained"
          type="submit"
          color="primary"
          className={classes.blockElement}
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
    </Card>
  );
}
