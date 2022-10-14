import InstagramIcon from "@material-ui/icons/Instagram";
import TwitterIcon from "@material-ui/icons/Twitter";
import YouTubeIcon from "@material-ui/icons/YouTube";
import FacebookIcon from "@material-ui/icons/Facebook";
import LinkedInIcon from "@material-ui/icons/LinkedIn";

import { apiRequest } from "./apiOperations";

export function verifySocialMediaLink(socialChannel, url, texts) {
  let error = "";
  // matches http://, https:// , https://www. ,http://www.
  const regexPrefix = "^(http)(?:s)?(://)(?:www.)?";
  console.log(socialChannel, url);
  // matches.com/ anything
  const regexSuffix = ".com/.+$";
  let regex;
  let matches = false;

  switch (socialChannel.name) {
    case "Twitter": // twitter
      regex = new RegExp(regexPrefix + "twitter" + regexSuffix);
      matches = regex.test(url);
      error = matches
        ? ""
        : texts.does_not_comply_twitter +
          ". Link must match with https://twitter.com/<your handle>";
      break;
    case "Youtube": // youtube
      regex = new RegExp(regexPrefix + "youtube" + regexSuffix);
      matches = regex.test(url);
      error = matches ? "" : texts.does_not_comply_youtube;
      break;
    case "LinkedIn": // linkedIn
      regex = new RegExp(regexPrefix + "linkedin" + regexSuffix);
      matches = regex.test(url);
      error = matches ? "" : texts.does_not_comply_linkedin;
      break;
    case "Instagram": // instagram
      regex = new RegExp(regexPrefix + "instagram" + regexSuffix);
      matches = regex.test(url);
      error = matches ? "" : texts.does_not_comply_instagram;
      break;
    case "Facebook": // facebook
      regex = new RegExp(regexPrefix + "facebook" + regexSuffix);
      matches = regex.test(url);
      error = matches ? "" : texts.does_not_comply_facebook;
      break;
    default:
      break;
  }
  return error;
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
          name: t.social_media_name, // need to refactor name for the selectfield component to work
          ask_for_full_website: t.ask_for_full_website,
          base_url: t.base_url,
          additionalInfo: [{}], // need for selectdialog component to work
        };
      });
    }
  } catch (err) {
    console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
}
