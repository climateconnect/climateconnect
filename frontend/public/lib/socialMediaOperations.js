import InstagramIcon from "@material-ui/icons/Instagram";
import TwitterIcon from "@material-ui/icons/Twitter";
import YouTubeIcon from "@material-ui/icons/YouTube";
import FacebookIcon from "@material-ui/icons/Facebook";
import LinkedInIcon from "@material-ui/icons/LinkedIn";

import { apiRequest } from "./apiOperations";

// goal is to add keys to each different type of social media (in this case its only 5)
export function assignKeys(socials) {
  const keyedSocials = [];

  /* this could be done via id instantly and this check owuldnt be necessary but my id's are ranging in 200s from earlier
     if id = 1 - 5 this keying wouldn't be necessary and in a real world we would never need to change/ delete the social media channels
  */
  socials.map((sm) => {
    // check for twitter
    const socialMediaInfo = {
      ...sm,
      is_checked: true,
    };
    if (sm.social_media_channel.social_media_name === "Twitter") {
      keyedSocials.push({
        ...socialMediaInfo,
        key: 0,
      });
    }
    // check for youtube
    if (sm.social_media_channel.social_media_name === "Youtube") {
      keyedSocials.push({
        ...socialMediaInfo,
        key: 1,
      });
    }
    // check for linkedIn
    if (sm.social_media_channel.social_media_name === "LinkedIn") {
      keyedSocials.push({
        ...socialMediaInfo,
        key: 2,
      });
    }
    // check for instagram
    if (sm.social_media_channel.social_media_name === "Instagram") {
      keyedSocials.push({
        ...socialMediaInfo,
        key: 3,
      });
    }
    // check for facebook
    if (sm.social_media_channel.social_media_name === "Facebook") {
      keyedSocials.push({
        ...socialMediaInfo,
        key: 4,
      });
    }
  });
  console.log(keyedSocials);
  return keyedSocials;
}

export function verifySocialMediaLinks(socialOptions, texts) {
  const err = {};
  console.log(socialOptions);
  // matches http://, https:// , https://www. ,http://www.
  const regexPrefix = "^(http)(?:s)?(://)(?:www.)?";

  // matches.com/ anything
  const regexSuffix = ".com/.+$";
  let regex;
  let matches = false;

  socialOptions.map((so) => {
    switch (so.social_media_channel.social_media_name) {
      case "Twitter": // twitter
        regex = new RegExp(regexPrefix + "twitter" + regexSuffix);
        matches = regex.test(so.url);
        err.twitterErr = matches ? null : texts.does_not_comply_twitter;
        break;
      case "Youtube": // youtube
        regex = new RegExp(regexPrefix + "youtube" + regexSuffix);
        matches = regex.test(so.url);
        err.youtubeErr = matches ? null : texts.does_not_comply_youtube;
        break;
      case "LinkedIn": // linkedIn
        regex = new RegExp(regexPrefix + "linkedin" + regexSuffix);
        matches = regex.test(so.url);
        err.linkedInErr = matches ? null : texts.does_not_comply_linkedin;
        break;
      case "Instagram": // instagram
        regex = new RegExp(regexPrefix + "instagram" + regexSuffix);
        matches = regex.test(so.url);
        err.instagramErr = matches ? null : texts.does_not_comply_instagram;
        break;
      case "Facebook": // facebook
        regex = new RegExp(regexPrefix + "facebook" + regexSuffix);
        matches = regex.test(so.url);
        err.facebookErr = matches ? null : texts.does_not_comply_facebook;
        break;
      default:
        break;
    }
  });

  return err;
}

export function getSocialMediaButtons(socialLinks) {
  const socialMediaLinks = [];
  socialLinks.map((social) => {
    switch (social.social_media_channel.social_media_name) {
      case "Twitter": // twitter
        socialMediaLinks.push(createSocialMediaIconButton(social));
        break;
      case "Youtube": // youtube
        socialMediaLinks.push(createSocialMediaIconButton(social));
        break;
      case "LinkedIn": // linkedin
        socialMediaLinks.push(createSocialMediaIconButton(social));
        break;
      case "Instagram": // instagram
        socialMediaLinks.push(createSocialMediaIconButton(social));
        break;
      case "Facebook": // facebook
        socialMediaLinks.push(createSocialMediaIconButton(social));
        break;
      default:
        break;
    }
  });
  return socialMediaLinks;
}

export function createSocialMediaIconButton(social) {
  console.log(social);
  const link = social.url;
  switch (social.social_media_channel.social_media_name) {
    case "Twitter":
      return {
        href: link,
        icon: TwitterIcon,
        altText: "Twitter",
      };
    case "Youtube":
      return {
        href: link,
        icon: YouTubeIcon,
        altText: "Youtube",
      };
    case "LinkedIn":
      return {
        href: link,
        icon: LinkedInIcon,
        altText: "LinkedIn",
      };
    case "Instagram":
      return {
        href: link,
        icon: InstagramIcon,
        altText: "Instagram",
      };
    case "Facebook":
      return {
        href: link,
        icon: FacebookIcon,
        altText: "Facebook",
      };
    default:
      break;
  }
}

export async function getSocialMediaChannels(locale) {
  try {
    const resp = await apiRequest({
      method: "get",
      url: "/api/social_media_channels/",
      locale: locale,
    });

    if (resp.data.results.length === 0) return null;
    else {
      return resp.data.results.map((t) => {
        return {
          name: t.social_media_name,
          ask_for_full_website: t.ask_for_full_website,
          base_url: t.base_url,
        };
      });
    }
  } catch (err) {
    console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
}

function assignKey(name) {
  if (name === "Twitter") {
    return 0;
  }
  if (name === "Youtube") {
    return 1;
  }
  if (name === "LinkedIn") {
    return 2;
  }
  if (name === "Instagram") {
    return 3;
  }
  if (name === "Facebook") {
    return 4;
  }
}
