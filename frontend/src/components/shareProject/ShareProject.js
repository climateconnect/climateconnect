import React, { useRef } from "react";
import Form from "../general/Form";
import { Typography, Link } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import InfoOutlinedIcon from "@material-ui/icons/InfoOutlined";
import {
  isLocationValid,
  parseLocation,
  indicateWrongLocation,
  getLocationFields,
  getLocationValue,
} from "../../../public/lib/locationOperations";

const useStyles = makeStyles((theme) => ({
  orgBottomLink: {
    textAlign: "center",
    marginTop: theme.spacing(0.5),
  },
  BottomLinkFlex: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: theme.spacing(0.5),
  },
  appealText: {
    textAlign: "center",
    fontWeight: "bold",
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
      falseLabel: "Personal Project",
      trueLabel: "Organization's project",
      key: "is_organization_project",
      type: "switch",
      checked: project.is_organization_project,
    },
    {
      required: true,
      label: "Organization",
      select: {
        values: organizationOptions,
        defaultValue: parent_organization_name,
      },
      key: "parent_organization",
      bottomLink: (
        <Typography className={classes.orgBottomLink}>
          If your organization does not exist yet{" "}
          <Link href="/createorganization" underline="always">
            click here
          </Link>{" "}
          to create it.
        </Typography>
      ),
      onlyShowIfChecked: "is_organization_project",
    },
    {
      required: true,
      label: "Title (Use a short, english title, e.g. 'Generating energy from ocean waves')",
      type: "text",
      key: "name",
      value: project.name,
      bottomLink: (
        <Typography className={classes.BottomLinkFlex}>
          <InfoOutlinedIcon className={classes.infoIcon} />
          <Typography component="span">
            Use a title that makes people curious to learn more about your project
          </Typography>
        </Typography>
      ),
    },
    ...getLocationFields({
      locationInputRef: locationInputRef,
      locationOptionsOpen: locationOptionsOpen,
      handleSetLocationOptionsOpen: handleSetLocationOptionsOpen,
      values: project,
      locationKey: "loc",
    }),
  ];
  const messages = {
    submitMessage: "Next Step",
  };

  const getOrgObject = (org) => {
    return userOrganizations.find((o) => o.name === org);
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
      indicateWrongLocation(locationInputRef, setLocationOptionsOpen, setMessage);
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
      <div className={classes.appealBox}>
        <Typography color="secondary" className={classes.appealText}>
          Please make sure to only use English when sharing a project.
        </Typography>
        <Typography color="secondary" className={classes.appealText}>
          This way most people can benefit from your ideas and experiences to fight climate change
          together!
        </Typography>
      </div>
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
