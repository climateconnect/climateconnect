import { makeStyles, Typography } from "@material-ui/core";
import NextCookies from "next-cookies";
import Router from "next/router";
import React, { useContext, useRef, useState } from "react";
import Cookies from "universal-cookie";
import ROLE_TYPES from "../public/data/role_types";
import { apiRequest, getLocalePrefix } from "../public/lib/apiOperations";
import { getAllHubs } from "../public/lib/hubOperations";
import { blobFromObjectUrl } from "../public/lib/imageOperations";
import {
  getLocationValue,
  indicateWrongLocation,
  isLocationValid,
  parseLocation,
} from "../public/lib/locationOperations";
import getTexts from "../public/texts/texts";
import UserContext from "../src/components/context/UserContext";
import LoginNudge from "../src/components/general/LoginNudge";
import TranslateTexts from "../src/components/general/TranslateTexts";
import Layout from "./../src/components/layouts/layout";
import WideLayout from "./../src/components/layouts/WideLayout";
import EnterBasicOrganizationInfo from "./../src/components/organization/EnterBasicOrganizationInfo";
import EnterDetailledOrganizationInfo from "./../src/components/organization/EnterDetailledOrganizationInfo";

const useStyles = makeStyles((theme) => ({
  headline: {
    textAlign: "center",
    marginTop: theme.spacing(4),
  },
}));

export async function getServerSideProps(ctx) {
  const { auth_token } = NextCookies(ctx);
  const [tagOptions, rolesOptions, allHubs] = await Promise.all([
    await getTags(auth_token, ctx.locale),
    await getRolesOptions(auth_token, ctx.locale),
    getAllHubs(ctx.locale, true),
  ]);
  return {
    props: {
      tagOptions: tagOptions,
      rolesOptions: rolesOptions,
      allHubs: allHubs,
    },
  };
}

export default function CreateOrganization({ tagOptions, rolesOptions, allHubs }) {
  const token = new Cookies().get("auth_token");
  const classes = useStyles();
  const [errorMessages, setErrorMessages] = React.useState({
    basicOrganizationInfo: "",
    detailledOrganizationInfo: "",
  });

  const legacyModeEnabled = process.env.ENABLE_LEGACY_LOCATION_FORMAT === "true";

  const handleSetErrorMessages = (newErrorMessages) => {
    setErrorMessages(newErrorMessages);
    window.scrollTo(0, 0);
  };

  const [organizationInfo, setOrganizationInfo] = React.useState({
    name: "",
    hasparentorganization: false,
    parentorganization: "",
    image: "",
    thumbnail_image: "",
    verified: false,
    info: {
      location: {},
      short_description: "",
      website: "",
      about: "",
      organization_size: "",
      hubs: [],
    },
    types: [],
  });
  const { user, locale, locales } = useContext(UserContext);
  const texts = getTexts({ page: "organization", locale: locale });
  const steps = ["basicorganizationinfo", "detailledorganizationinfo", "checktranslations"];
  const [curStep, setCurStep] = React.useState(steps[0]);
  const locationInputRef = useRef(null);
  const [locationOptionsOpen, setLocationOptionsOpen] = React.useState(false);
  const [translations, setTranslations] = React.useState({});
  const [sourceLanguage, setSourceLanguage] = useState(locale);
  const [targetLanguage, setTargetLanguage] = useState(locales.find((l) => l !== locale));
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const changeTranslationLanguages = ({ newLanguagesObject }) => {
    if (newLanguagesObject.sourceLanguage) setSourceLanguage(newLanguagesObject.sourceLanguage);
    if (newLanguagesObject.targetLanguage) setTargetLanguage(newLanguagesObject.targetLanguage);
  };

  const handleChangeTranslationContent = (locale, newTranslations, isManualChange) => {
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

  const handleSetLocationOptionsOpen = (bool) => {
    setLocationOptionsOpen(bool);
  };

  const handleSetLocationErrorMessage = (newMessage) => {
    handleSetErrorMessages({
      ...errorMessages,
      basicOrganizationInfo: newMessage,
    });
  };

  const handleSetDetailledErrorMessage = (newMessage) => {
    handleSetErrorMessages({
      ...errorMessages,
      detailledOrganizationInfo: newMessage,
    });
  };

  const handleBasicInfoSubmit = async (event, values) => {
    event.preventDefault();
    try {
      //Short circuit if there is no parent organization
      if (values.hasparentorganization && !values.parentOrganization) {
        handleSetErrorMessages({
          ...errorMessages,
          basicOrganizationInfo: texts.you_have_not_selected_a_parent_organization_either_untick,
        });
        return;
      }

      //short circuit if the location is invalid and we're not in legacy mode
      if (!legacyModeEnabled && !isLocationValid(values.location)) {
        indicateWrongLocation(
          locationInputRef,
          setLocationOptionsOpen,
          handleSetLocationErrorMessage,
          texts
        );
        return;
      }
      const resp = await apiRequest({
        method: "get",
        url: "/api/organizations/?search=" + values.organizationname,
        locale: locale,
      });
      if (resp.data.results && resp.data.results.find((r) => r.name === values.organizationname)) {
        const org = resp.data.results.find((r) => r.name === values.organizationname);
        handleSetErrorMessages({
          errorMessages,
          basicOrganizationInfo: (
            <div>
              {texts.an_organization_with_this_name_already_exists}
              <a href={getLocalePrefix(locale) + "/organizations/" + org.url_slug}>
                {texts.click_here}
              </a>{" "}
              {texts.to_see_it}
            </div>
          ),
        });
      } else {
        const location = getLocationValue(values, "location");
        setOrganizationInfo({
          ...organizationInfo,
          name: values.organizationname,
          parentorganization: values.parentorganizationname,
          location: parseLocation(location),
        });
        setCurStep(steps[1]);
      }
    } catch (err) {
      console.log(err);
      if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
      return null;
    }
  };

  const requiredPropErrors = {
    image: texts.image_required_error,
    organization_tags: texts.type_required_errror,
    name: texts.name_required_error,
    location: texts.location_required_error,
  };

  const handleSetOrganizationInfo = (newOrganizationData) => {
    setOrganizationInfo({ ...setOrganizationInfo, ...newOrganizationData });
  };

  const handleDetailledInfoSubmit = async (account) => {
    //If the language is not language, short circuit and allow users to check the english translations for their texts
    const organizationToSubmit = await parseOrganizationForRequest(
      account,
      user,
      rolesOptions,
      translations,
      sourceLanguage
    );
    if (!legacyModeEnabled && !isLocationValid(organizationToSubmit.location)) {
      indicateWrongLocation(
        locationInputRef,
        setLocationOptionsOpen,
        handleSetDetailledErrorMessage,
        texts
      );
      return;
    }
    for (const prop of Object.keys(requiredPropErrors)) {
      if (
        !organizationToSubmit[prop] ||
        (Array.isArray(organizationToSubmit[prop]) && organizationToSubmit[prop].length <= 0)
      ) {
        handleSetErrorMessages({
          errorMessages,
          detailledOrganizationInfo: requiredPropErrors[prop],
        });
        return;
      }
    }
    if (locale !== "en") {
      console.log(account);
      setOrganizationInfo({
        ...account,
        parentorganization: organizationInfo.parentorganization,
      });
      setCurStep(steps[2]);
      return;
    }
    setLoadingSubmit(true);
    await makeCreateOrganizationRequest(organizationToSubmit);
  };

  const goToPreviousStep = () => {
    setCurStep(steps[steps.indexOf(curStep) - 1]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const organizationToSubmit = await parseOrganizationForRequest(
      organizationInfo,
      user,
      rolesOptions,
      translations,
      sourceLanguage,
      targetLanguage
    );
    await makeCreateOrganizationRequest(organizationToSubmit);
  };

  const makeCreateOrganizationRequest = (organizationToSubmit) => {
    apiRequest({
      method: "post",
      url: "/api/create_organization/",
      payload: organizationToSubmit,
      token: token,
      locale: locale,
    })
      .then(function (response) {
        setLoadingSubmit(false);
        Router.push({
          pathname: "/manageOrganizationMembers/" + response.data.url_slug,
          query: {
            message: texts.you_have_successfully_created_an_organization_you_can_add_members,
            isCreationStage: true,
          },
        });
        return;
      })
      .catch(function (error) {
        console.log(error);
        setLoadingSubmit(false);
        if (error) console.log(error?.response?.data);
        if (error?.response?.data?.message)
          handleSetErrorMessages({
            errorMessages,
            detailledOrganizationInfo: error?.response?.data?.message,
          });
        return;
      });
  };

  if (!user)
    return (
      <WideLayout
        title={texts.please_log_in + " " + texts.to_create_an_organization}
        hideHeadline={true}
      >
        <LoginNudge fullPage whatToDo={texts.to_create_an_organization} />
      </WideLayout>
    );
  else if (curStep === "basicorganizationinfo")
    return (
      <Layout title={texts.create_an_organization}>
        <EnterBasicOrganizationInfo
          errorMessage={errorMessages.basicOrganizationInfo}
          handleSubmit={handleBasicInfoSubmit}
          organizationInfo={organizationInfo}
          locationInputRef={locationInputRef}
          locationOptionsOpen={locationOptionsOpen}
          handleSetLocationOptionsOpen={handleSetLocationOptionsOpen}
        />
      </Layout>
    );
  else if (curStep === "detailledorganizationinfo")
    return (
      <WideLayout title={texts.create_an_organization}>
        <EnterDetailledOrganizationInfo
          errorMessage={errorMessages.detailledOrganizationInfo}
          handleSubmit={handleDetailledInfoSubmit}
          organizationInfo={organizationInfo}
          tagOptions={tagOptions}
          locationInputRef={locationInputRef}
          locationOptionsOpen={locationOptionsOpen}
          handleSetLocationOptionsOpen={handleSetLocationOptionsOpen}
          loadingSubmit={loadingSubmit}
          allHubs={allHubs}
        />
      </WideLayout>
    );
  else if (curStep === "checktranslations")
    return (
      <WideLayout title={texts.languages}>
        <Typography color="primary" className={classes.headline} component="h1" variant="h4">
          {texts.translate}
        </Typography>
        <TranslateTexts
          data={organizationInfo}
          pageName="organization"
          handleSetData={handleSetOrganizationInfo}
          onSubmit={handleSubmit}
          translations={translations}
          sourceLanguage={sourceLanguage}
          targetLanguage={targetLanguage}
          handleChangeTranslationContent={handleChangeTranslationContent}
          goToPreviousStep={goToPreviousStep}
          introTextKey="translate_organization_intro"
          textsToTranslate={[
            {
              textKey: "info.short_description",
              rows: 5,
              headlineTextKey: "short_description",
            },
            {
              textKey: "info.about",
              rows: 10,
              headlineTextKey: "about",
            },
          ]}
          organization={organizationInfo}
          changeTranslationLanguages={changeTranslationLanguages}
        />
      </WideLayout>
    );
}

const getRolesOptions = async (token, locale) => {
  try {
    const resp = await apiRequest({
      method: "get",
      url: "/roles/",
      token: token,
      locale: locale,
    });
    if (resp.data.results.length === 0) return null;
    else {
      return resp.data.results;
    }
  } catch (err) {
    console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
};

async function getTags(token, locale) {
  try {
    const resp = await apiRequest({
      method: "get",
      url: "/api/organizationtags/",
      token: token,
      locale: locale,
    });
    if (resp.data.results.length === 0) return null;
    else {
      return resp.data.results.map((t) => {
        return { ...t, key: t.id, additionalInfo: t.additional_info ? t.additional_info : [] };
      });
    }
  } catch (err) {
    console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
}

const parseOrganizationForRequest = async (o, user, rolesOptions, translations, sourceLanguage) => {
  const organization = {
    team_members: [
      {
        user_id: user.id,
        permission_type_id: rolesOptions.find((r) => r.role_type === ROLE_TYPES.all_type).id,
      },
    ],
    name: o.name,
    background_image: o.background_image,
    image: o.image,
    thumbnail_image: o.thumbnail_image,
    location: o.info.location,
    website: o.info.website,
    short_description: o.info.short_description,
    organization_size: o.info.organization_size,
    hubs: o.info.hubs.map((h) => h.url_slug),
    about: o.info.about,
    organization_tags: o.types,
    translations: {
      ...translations,
    },
    source_language: sourceLanguage,
  };
  if (o.parentorganization) organization.parent_organization = o.parentorganization;
  if (o.background_image)
    organization.background_image = await blobFromObjectUrl(o.background_image);
  if (o.thumbnail_image) organization.thumbnail_image = await blobFromObjectUrl(o.thumbnail_image);
  if (o.image) organization.image = await blobFromObjectUrl(o.image);
  if (o.info.school) organization.school = o.info.school;
  return organization;
};
