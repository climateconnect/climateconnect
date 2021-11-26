import Router from "next/router";
import getTexts from "../texts/texts";
import { getImageUrl } from "./imageOperations";

export function parseProfile(profile, detailledSkills, keepOldProps) {
  let user = { info: {} };
  if (keepOldProps) {
    user.first_name = profile.first_name;
  }
  user = {
    ...user,
    badges: profile.badges,
    url_slug: profile.url_slug,
    name: profile.first_name + " " + profile.last_name,
    first_name: profile.first_name,
    last_name: profile.last_name,
    image: getImageUrl(profile.image),
    background_image: getImageUrl(profile.background_image),
    language: profile.language,
    info: {
      ...user.info,
      location: profile.location,
      bio: profile.biography,
      skills: profile.skills && profile.skills.map((s) => s.name),
      availability: profile.availability && profile.availability.name,
      website: profile.website,
    },
  };
  user = convertUndefinedToNull(user);
  if (keepOldProps) delete user.info.location;
  if (detailledSkills) user.info.skills = profile.skills.map((s) => ({ ...s, key: s.id }));
  return user;
}

const convertUndefinedToNull = (inputObject) => {
  const outputObject = { ...inputObject };
  for (const key of Object.keys(outputObject)) {
    if (outputObject[key] === undefined) outputObject[key] = null;
    else if (
      typeof outputObject[key] === "object" &&
      !Array.isArray(outputObject[key]) &&
      outputObject[key] !== null
    )
      outputObject[key] = convertUndefinedToNull(outputObject[key]);
  }
  return outputObject;
};

export function redirectOnLogin(user, redirectUrl, locale) {
  const texts = getTexts({ page: "profile", locale: locale });
  const SIGN_UP_MESSAGE = texts.sign_up_message;

  if (user.has_logged_in < 2) {
    Router.push({
      pathname: "/editprofile",
      query: {
        message: SIGN_UP_MESSAGE,
      },
    });
  } else if (redirectUrl) {
    if (redirectUrl[0] === "/") redirectUrl = redirectUrl.substring(1, redirectUrl.length);
    window.location.replace(window.location.origin + "/" + redirectUrl);
  } else Router.push("/browse");
}

export function nullifyUndefinedValues(obj) {
  return convertUndefinedToNull(obj);
}
