import { makeStyles, Typography } from "@material-ui/core";
import Router from "next/router";
import React, { useContext, useState } from "react";
import Cookies from "universal-cookie";
import { apiRequest, getLocalePrefix } from "../../../public/lib/apiOperations";
import { arraysEqual } from "../../../public/lib/generalOperations";
import { blobFromObjectUrl } from "../../../public/lib/imageOperations";
import { indicateWrongLocation, isLocationValid } from "../../../public/lib/locationOperations";
import {
  getTranslationsFromObject,
  getTranslationsWithoutRedundantKeys,
} from "../../../public/lib/translationOperations";
import getTexts from "../../../public/texts/texts";
import EditAccountPage from "../account/EditAccountPage";
import UserContext from "../context/UserContext";
import PageNotFound from "../general/PageNotFound";
import TranslateTexts from "../general/TranslateTexts";
import { parseOrganization } from "../../../public/lib/organizationOperations";
import { verifySocialMediaLinks } from "../../../public/lib/socialMediaOperations";

const useStyles = makeStyles((theme) => ({
  headline: {
    textAlign: "center",
    marginTop: theme.spacing(4),
  },
}));

export default function EditOrganizationRoot({
  organization,
  tagOptions,
  infoMetadata,
  handleSetErrorMessage,
  locationInputRef,
  handleSetLocationOptionsOpen,
  errorMessage,
  initialTranslations,
  allHubs,
  socialMediaChannels,
}) {
  const classes = useStyles();
  const cookies = new Cookies();
  const token = cookies.get("auth_token");
  const { locale, locales } = useContext(UserContext);
  const STEPS = ["edit_organization", "edit_translations"];
  const legacyModeEnabled = process.env.ENABLE_LEGACY_LOCATION_FORMAT === "true";

  const [editedOrganization, setEditedOrganization] = useState({ ...organization });
  const texts = getTexts({
    page: "organization",
    locale: locale,
    organization: editedOrganization,
  });
  const [step, setStep] = useState(STEPS[0]);
  const [translations, setTranslations] = useState(
    initialTranslations ? getTranslationsFromObject(initialTranslations, "organization") : {}
  );
  const [sourceLanguage, setSourceLanguage] = useState(organization.language);
  const [targetLanguage, setTargetLanguage] = useState(locales.find((l) => l !== sourceLanguage));

  const handleSetEditedOrganization = (newOrganizationData) => {
    setEditedOrganization({ ...editedOrganization, ...newOrganizationData });
  };

  const handleChangeTranslations = (locale, newTranslations, isManualChange) => {
    const newTranslationsObject = {
      ...translations,
      [locale]: {
        ...translations[locale],
        ...newTranslations,
        is_manual_translation: isManualChange ? true : false,
      },
    };
    setTranslations({ ...newTranslationsObject });
  };

  const changeTranslationLanguages = ({ newLanguagesObject }) => {
    if (newLanguagesObject.sourceLanguage) setSourceLanguage(newLanguagesObject.sourceLanguage);
    if (newLanguagesObject.targetLanguage) setTargetLanguage(newLanguagesObject.targetLanguage);
  };

  const getChanges = (o, oldO) => {
    const finalProfile = {};
    const org = { ...o, ...o.info };
    delete org.info;
    const oldOrg = { ...oldO, ...oldO.info };
    delete oldOrg.info;

    Object.keys(org).map((k) => {
      if (oldOrg[k] && org[k] && Array.isArray(oldOrg[k]) && Array.isArray(org[k])) {
        if (!arraysEqual(oldOrg[k], org[k])) finalProfile[k] = org[k];
      } else if (oldOrg[k] !== org[k] && !(!oldOrg[k] && !org[k])) finalProfile[k] = org[k];
    });

    return finalProfile;
  };

  const saveChanges = async (editedOrg, isTranslationsStep) => {
    const error = verifyChanges(editedOrg, texts).error;
    //verify location is valid and notify user if it's not

    if (
      editedOrg?.info?.location !== organization?.info?.location &&
      !isLocationValid(editedOrg?.info?.location) &&
      !legacyModeEnabled &&
      !isTranslationsStep
    )
      indicateWrongLocation(
        locationInputRef,
        handleSetLocationOptionsOpen,
        handleSetErrorMessage,
        texts
      );
    if (error) {
      handleSetErrorMessage(error);
    } else {
      editedOrg.language = sourceLanguage;
      const oldOrg = await getOrganizationByUrlIfExists(organization.url_slug, token, locale);
      /*for the getChanges function if you want to check for changes within an attribute in an object such as translations or social media name
       we need to get the old org via api request otherwise no changes will be noticed  see PR #1046 for more info */
      const payload = await parseForRequest(getChanges(editedOrg, oldOrg));

      if (isTranslationsStep)
        payload.translations = getTranslationsWithoutRedundantKeys(
          getTranslationsFromObject(initialTranslations, "organization"),
          translations
        );
      apiRequest({
        method: "patch",
        url: "/api/organizations/" + encodeURI(organization.url_slug) + "/",
        payload: payload,
        token: token,
        locale: locale,
        shouldThrowError: true,
      })
        .then(function () {
          Router.push({
            pathname: "/organizations/" + organization.url_slug,
            query: {
              message: texts.successfully_edited_organization,
            },
          });
        })
        .catch(function (error) {
          console.log(error);
          if (error) console.log(error.response);
        });
    }
  };
  const handleCancel = () => {
    Router.push("/organizations/" + organization.url_slug);
  };

  const handleGoToPreviousStep = () => {
    setStep(STEPS[STEPS.indexOf(step) - 1]);
  };

  const onClickCheckTranslations = async (editedAccount) => {
    setEditedOrganization(editedAccount);
    setStep(STEPS[1]);
  };

  const handleTranslationsSubmit = async (event) => {
    event.preventDefault();
    await saveChanges(editedOrganization, true);
  };

  return (
    <>
      {organization ? (
        step === "edit_organization" ? (
          <EditAccountPage
            type="organization"
            account={organization}
            possibleAccountTypes={tagOptions}
            infoMetadata={infoMetadata}
            accountHref={getLocalePrefix(locale) + "/organizations/" + organization.url_slug}
            maxAccountTypes={2}
            handleSubmit={saveChanges}
            handleCancel={handleCancel}
            errorMessage={errorMessage}
            onClickCheckTranslations={onClickCheckTranslations}
            allHubs={allHubs}
            socialMediaChannels={socialMediaChannels}
          />
        ) : (
          <>
            <Typography color="primary" className={classes.headline} component="h1" variant="h4">
              {texts.translate}
            </Typography>
            <TranslateTexts
              data={editedOrganization}
              handleSetData={handleSetEditedOrganization}
              onSubmit={handleTranslationsSubmit}
              goToPreviousStep={handleGoToPreviousStep}
              handleChangeTranslationContent={handleChangeTranslations}
              translations={translations}
              targetLanguage={targetLanguage}
              organization={organization}
              pageName="organization"
              introTextKey="translate_organization_intro"
              submitButtonText={texts.save}
              textsToTranslate={[
                {
                  textKey: "info.short_description",
                  rows: 5,
                  headlineTextKey: "short_description",
                },
                {
                  textKey: "info.about",
                  rows: 9,
                  headlineTextKey: "about",
                },
              ]}
              changeTranslationLanguages={changeTranslationLanguages}
            />
          </>
        )
      ) : (
        <PageNotFound itemName={texts.organization} />
      )}
    </>
  );
}

const parseForRequest = async (org) => {
  const parsedOrg = {
    ...org,
  };
  if (org.short_description) parsedOrg.short_description = org.short_description;
  if (org.parent_organization)
    parsedOrg.parent_organization = org.parent_organization ? org.parent_organization.id : null;
  if (org.background_image)
    parsedOrg.background_image = await blobFromObjectUrl(org.background_image);
  if (org.thumbnail_image) parsedOrg.thumbnail_image = await blobFromObjectUrl(org.thumbnail_image);
  if (org.image) parsedOrg.image = await blobFromObjectUrl(org.image);
  if (org.hubs) parsedOrg.hubs = org.hubs.map((h) => h.url_slug);

  return parsedOrg;
};

const verifyChanges = (newOrg, texts) => {
  const requiredPropErrors = {
    image: texts.image_required_error,
    types: texts.type_required_errror,
    name: texts.name_required_error,
  };
  const requiredInfoPropErrors = {
    location: texts.location_required_error,
  };
  for (const prop of Object.keys(requiredPropErrors)) {
    if (!newOrg[prop] || (Array.isArray(newOrg[prop]) && newOrg[prop].length <= 0)) {
      return {
        error: requiredPropErrors[prop],
      };
    }
  }
  for (const prop of Object.keys(requiredInfoPropErrors)) {
    if (!newOrg.info[prop] || (Array.isArray(newOrg.info[prop]) && newOrg.info[prop].length <= 0)) {
      return {
        error: requiredInfoPropErrors[prop],
      };
    }
  }
  const socialMediaError = verifySocialMediaLinks(newOrg.info.social_options, texts);
  console.log(socialMediaError);
  for (const prop of Object.keys(socialMediaError)) {
    if (socialMediaError[prop] !== null) {
      return {
        error: socialMediaError[prop],
      };
    }
  }

  return true;
};

async function getOrganizationByUrlIfExists(organizationUrl, token, locale) {
  try {
    const resp = await apiRequest({
      method: "get",
      url: "/api/organizations/" + organizationUrl + "/",
      token: token,
      locale: locale,
    });
    return parseOrganization(resp.data, true);
  } catch (err) {
    console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
}
