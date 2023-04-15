import { Button, Theme, Typography, useMediaQuery } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import React, { useContext } from "react";
import { parseLocation } from "../../../../public/lib/locationOperations";
import getTexts from "../../../../public/texts/texts";
import theme from "../../../themes/theme";
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
    fontSize: 14,
    fontWeight: 500,
  },
  chooseIsOrganizationsProject: {
    marginBottom: theme.spacing(2),
  },
  errorMessage: {
    textAlign: "center",
  },
  chooseOrganizationField: {
    marginTop: theme.spacing(2),
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
  const isTinyScreen = useMediaQuery<Theme>("(max-width:400px");
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "idea", locale: locale });
  const isNarrowScreen = useMediaQuery<Theme>(theme.breakpoints.down("md"));
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
            className={classes.chooseOrganizationField}
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
        onSelect={(location) => handleValueChange(parseLocation(location), "location")}
        handleSetOpen={handleSetLocationOptionsOpen}
        open={locationOptionsOpen}
        locationInputRef={locationInputRef}
        smallInput
        helperText={texts.create_idea_location_helper_text}
        disabled
      />
      <Typography className={classes.headline}>Hub*</Typography>
      <SelectField
        size="small"
        label={texts.choose_a_category}
        options={allHubs}
        controlled
        required
        onChange={(e) =>
          handleValueChange(
            allHubs.find((h) => h.name === e.target.value),
            "hub"
          )
        }
        controlledValue={idea.hub}
      />
      <div className={classes.buttonBar}>
        <Button variant="contained" onClick={goBack}>
          {isNarrowScreen ? <ArrowBackIcon /> : texts.back}
        </Button>
        <Button type="submit" variant="contained" color="primary" className={classes.publishButton}>
          {isTinyScreen ? texts.save : texts.publish}
        </Button>
      </div>
    </form>
  );
}
