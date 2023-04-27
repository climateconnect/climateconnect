import { Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext, useRef } from "react";

// Relative imports
import {
  getLocationFields,
  getLocationValue,
  indicateWrongLocation,
  isLocationValid,
  parseLocation,
} from "../../../public/lib/locationOperations";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import Form from "../general/Form";

const useStyles = makeStyles((theme) => ({
  orgBottomLink: {
    textAlign: "center",
    marginTop: theme.spacing(0.5),
  },

  bottomLinkFlex: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: theme.spacing(0.5),
  },

  bold: {
    fontWeight: "bold",
  },

  appealText: {
    textAlign: "center",
  },
  appealBox: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  form: {
    maxWidth: 700,
    margin: "0 auto",
    padding: theme.spacing(4),
    paddingTop: theme.spacing(2),
  },
  infoIcon: {
    marginRight: theme.spacing(0.5),
  },
  field: {
    marginTop: theme.spacing(3),
  },
}));

export default function Share({
  project,
  handleSetProjectData,
  goToNextStep,
  userOrganizations,
  setMessage,
}) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale: locale });
  const locationInputRef = useRef(null);
  const [locationOptionsOpen, setLocationOptionsOpen] = React.useState(false);

  const handleSetLocationOptionsOpen = (bool) => {
    setLocationOptionsOpen(bool);
  };

  const organizations = !userOrganizations
    ? []
    : userOrganizations.map((org) => {
        return {
          key: org.url_slug,
          ...org,
        };
      });
  const organizationOptions = [...organizations];
  const parent_organization_name = project.parent_organization
    ? project.parent_organization.name
      ? project.parent_organization.name
      : project.parent_organization
    : "";
  const legacyModeEnabled = process.env.ENABLE_LEGACY_LOCATION_FORMAT === "true";
  const fields = [
    {
      falseLabel: texts.personal_project,
      trueLabel: texts.organizations_project,
      key: "is_organization_project",
      type: "switch",
      checked: project.is_organization_project,
    },
    {
      required: true,
      label: texts.organization,
      select: {
        values: organizationOptions,
        defaultValue: parent_organization_name,
      },
      key: "parent_organization",
      bottomLink: (
        <Typography className={classes.orgBottomLink}>
          {texts.if_your_organization_does_not_exist_yet_click_here}
        </Typography>
      ),
      onlyShowIfChecked: "is_organization_project",
    },
    {
      required: true,
      label: texts.title_with_explanation_and_example,
      type: "text",
      key: "name",
      value: project.name,
    },
    ...getLocationFields({
      locationInputRef: locationInputRef,
      locationOptionsOpen: locationOptionsOpen,
      handleSetLocationOptionsOpen: handleSetLocationOptionsOpen,
      values: project,
      locationKey: "loc",
      texts: texts,
    }),
  ];
  const messages = {
    submitMessage: texts.next_step,
  };

  const getOrgObject = (org) => {
    return userOrganizations.find((o) => o.name.trim() === org);
  };

  const onSubmit = (event, values) => {
    event.preventDefault();
    Object.keys(values).map(
      (k) =>
        (values[k] =
          values[k] && values[k] != true && typeof values[k] !== "object"
            ? values[k].trim()
            : values[k])
    );
    //Short circuit if the location is not valid and we're not in legacy mode
    if (!legacyModeEnabled && !isLocationValid(values.loc)) {
      indicateWrongLocation(locationInputRef, setLocationOptionsOpen, setMessage, texts);
      return;
    }
    const loc_value = getLocationValue(values, "loc");
    const loc = parseLocation(loc_value);
    if (!values.parent_organization) {
      handleSetProjectData({
        ...values,
        loc: loc,
        isPersonalProject: true,
      });
    } else {
      handleSetProjectData({
        ...values,
        loc: loc,
        parent_organization: getOrgObject(values.parent_organization),
        isPersonalProject: false,
      });
    }
    goToNextStep();
  };
  return (
    <>
      {locale === "en" && (
        <div className={classes.appealBox}>
          <Typography color="secondary" className={classes.appealText}>
            Please make sure to{" "}
            <Typography component="span" className={classes.bold}>
              only use English when sharing a project
            </Typography>
            .
          </Typography>
          <Typography className={classes.appealText}>
            This enables more people to contribute to your ideas and experiences to fight climate
            change together!
          </Typography>
        </div>
      )}
      <Form
        className={classes.form}
        fields={fields}
        messages={messages}
        onSubmit={onSubmit}
        alignButtonsRight
        fieldClassName={classes.field}
      />
    </>
  );
}
