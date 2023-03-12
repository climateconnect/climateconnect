import { TextField, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React, { useContext, useRef } from "react";
import { Project, Organization } from "../../types";
import ProjectTypeSelector from "./ProjectTypeSelector";

// Relative imports
import {
  getLocationValue,
  indicateWrongLocation,
  isLocationValid,
  parseLocation,
} from "../../../public/lib/locationOperations";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import Form from "../general/Form";
import Switcher from "../general/Switcher";
import SelectField from "../general/SelectField";

const useStyles = makeStyles((theme) => ({
  orgBottomLink: {
    textAlign: "center",
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
  field: {
    marginTop: theme.spacing(3),
  },
}));

type Args = {
  project: Project;
  handleSetProjectData: Function;
  goToNextStep: Function;
  userOrganizations: Array<Organization>;
  setMessage: Function;
};

export default function Share({
  project,
  handleSetProjectData,
  goToNextStep,
  userOrganizations,
  setMessage,
}: Args) {
  console.log(userOrganizations);
  const organizationOptions = !userOrganizations
    ? []
    : userOrganizations.map((org) => {
        return {
          key: org.url_slug,
          ...org,
        };
      });
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale: locale });

  const getOrgObject = (org) => {
    return userOrganizations.find((o) => o.name === org);
  };

  const onChangeSwitch = () => {
    handleSetProjectData({ is_organization_project: !project.is_organization_project });
  };

  const onChangeParentOrganization = (e) => {
    console.log(e);
  };

  const onChangeProjectType = (newValue) => {
    handleSetProjectData({ type: newValue });
  };

  return (
    <div className={classes.form}>
      {locale === "en" && <PleaseOnlyUseEnglishAppeal />}
      <Switcher
        trueLabel={texts.organizations_project}
        falseLabel={texts.personal_project}
        value={project.is_organization_project}
        required={false}
        className={classes.field}
        handleChangeValue={onChangeSwitch}
      />
      {project.is_organization_project && (
        <>
          <SelectField
            controlled
            controlledValue={project.parent_organization.name}
            required
            options={organizationOptions}
            label={texts.organization}
            className={classes.field}
            onChange={onChangeParentOrganization}
          />
          <Typography className={classes.orgBottomLink}>
            {texts.if_your_organization_does_not_exist_yet_click_here}
          </Typography>
        </>
      )}
      <ProjectTypeSelector
        className={classes.field}
        value={project.type}
        onChange={onChangeProjectType}
      />
    </div>
  );
}

const PleaseOnlyUseEnglishAppeal = () => {
  const classes = useStyles();
  return (
    <div className={classes.appealBox}>
      <Typography color="secondary" className={classes.appealText}>
        Please make sure to{" "}
        <Typography component="span" className={classes.bold}>
          only use English when sharing a project
        </Typography>
        .
      </Typography>
      <Typography className={classes.appealText}>
        This enables more people to contribute to your ideas and experiences to fight climate change
        together!
      </Typography>
    </div>
  );
};
