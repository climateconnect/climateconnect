import { Button, makeStyles, Typography } from "@material-ui/core";
import React, { useContext } from "react";
import getTexts from "../../../../public/texts/texts";
import UserContext from "../../context/UserContext";
import SelectField from "../../general/SelectField";
import Switcher from "../../general/Switcher";
import LocationSearchBar from "../../search/LocationSearchBar";

const useStyles = makeStyles((theme) => ({
  textField: {
    width: "100%",
    marginBottom: theme.spacing(2),
  },
  headline: {
    fontWeight: 600,
    fontSize: 17,
    marginBottom: theme.spacing(0.5),
  },
  publishButton: {
    float: "right",
  },
  buttonBar: {
    marginTop: theme.spacing(2),
  },
  motivationText: {
    marginBottom: theme.spacing(2),
    fontSize: 17,
    fontWeight: 600,
  },
  chooseIsOrganizationsProject: {
    marginBottom: theme.spacing(2),
  },
  errorMessage: {
    textAlign: "center",
  },
}));

export default function IdeaMetadataStep({
  idea,
  handleValueChange,
  handleIsOrganizationsIdeaChange,
  locationOptionsOpen,
  locationInputRef,
  handleSetLocationOptionsOpen,
  userOrganizations,
  allHubs,
  onSubmitIdea,
  goBack,
  errorMessage,
}) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "idea", locale: locale });
  return (
    <form onSubmit={onSubmitIdea}>
      <Typography className={classes.motivationText}>
        {texts.create_idea_add_metadata_motivation_text}
      </Typography>
      {errorMessage && (
        <Typography color="error" className={classes.errorMessage}>
          {errorMessage}
        </Typography>
      )}
      <div className={classes.chooseIsOrganizationsProject}>
        <Switcher
          trueLabel={texts.organizations_idea}
          falseLabel={texts.personal_idea}
          value={idea.is_organizations_idea}
          handleChangeValue={handleIsOrganizationsIdeaChange}
        />
        {idea.is_organizations_idea && (
          <SelectField
            size="small"
            label={texts.choose_your_organization}
            options={userOrganizations}
            controlled
            onChange={(e) =>
              handleValueChange(
                userOrganizations.find((o) => o.name === e.target.value),
                "parent_organization"
              )
            }
            controlledValue={idea.parentOrganization}
          />
        )}
      </div>
      <Typography className={classes.headline}>{texts.location}*</Typography>
      <LocationSearchBar
        required
        label={texts.choose_a_location}
        className={classes.textField}
        value={idea.location}
        onChange={(newValue) => handleValueChange(newValue, "location")}
        onSelect={(location) => handleValueChange(location, "location")}
        handleSetOpen={handleSetLocationOptionsOpen}
        open={locationOptionsOpen}
        locationInputRef={locationInputRef}
        smallInput
        helperText={texts.create_idea_location_helper_text}
      />
      <Typography className={classes.headline}>Hub*</Typography>
      <SelectField
        size="small"
        label={texts.choose_a_category}
        options={allHubs}
        controlled
        onChange={(e) => handleValueChange(e.target.value, "hub")}
        controlledValue={idea.hub}
      />
      <div className={classes.buttonBar}>
        <Button variant="contained" onClick={goBack}>
          {texts.back}
        </Button>
        <Button type="submit" variant="contained" color="primary" className={classes.publishButton}>
          {texts.publish}
        </Button>
      </div>
    </form>
  );
}
