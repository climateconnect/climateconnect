import InstagramIcon from "@material-ui/icons/Instagram";
import TwitterIcon from "@material-ui/icons/Twitter";
import YouTubeIcon from "@material-ui/icons/YouTube";
import FacebookIcon from "@material-ui/icons/Facebook";
import LinkedInIcon from "@material-ui/icons/LinkedIn";

import { apiRequest } from "./apiOperations";

export function verifySocialMediaLink(socialMediaChannel, inputUrl, texts) {
  
  const verfiedSocialMediaLinks = {
    Twitter: verficationOfInput(socialMediaChannel, inputUrl, texts.does_not_comply_twitter),
    Youtube: verficationOfInput(socialMediaChannel, inputUrl, texts.does_not_comply_youtube),
    LinkedIn: verficationOfInput(socialMediaChannel, inputUrl, texts.does_not_comply_linkedin),
    Instagram: verficationOfInput(socialMediaChannel, inputUrl, texts.does_not_comply_instagram),
    Facebook: verficationOfInput(socialMediaChannel, inputUrl, texts.does_not_comply_facebook),
  };
  return verfiedSocialMediaLinks[socialMediaChannel.name];
}

function verficationOfInput(socialMediaChannel, inputUrl, errorMessage) {
  const baseUrl = socialMediaChannel.base_url;
  const askForFullWebsite = socialMediaChannel.ask_for_full_website;
  const socialMediaName = socialMediaChannel.name;

  // matches http://, https:// , https://www. ,http://www.
  const regexPrefix = "^(http)(?:s)?(://)(?:www.)?";
  // matches.com/ anything
  const regexSuffix = askForFullWebsite ? ".com/.+$" : ".+$";

  const regex = askForFullWebsite
    ? new RegExp(regexPrefix + socialMediaName.toLowerCase() + regexSuffix)
    : new RegExp(baseUrl + regexSuffix);
  const matches = regex.test(inputUrl);
  const error = matches ? "" : errorMessage;
  return error;
}

export function getSocialMediaButtons(socialLinks) {
  
  const socialMediaStrings = {
    Twitter: "Twitter",
    Youtube: "Youtube",
    LinkedIn: "LinkedIn",
    Instagram: "Instagram",
    Facebook: "Facebook"
  }
  const socialMediaLinks = [];
  const socialMediaTypes =
  {
    Twitter: {
      href: getUrl(socialLinks, socialMediaStrings.Twitter),
      icon: TwitterIcon,
      altText: socialMediaStrings.Twitter,
    },
    Youtube: {
      href: getUrl(socialLinks, socialMediaStrings.Youtube),
      icon: YouTubeIcon,
      altText: socialMediaStrings.Youtube,
    },
    LinkedIn:{
      href: getUrl(socialLinks, socialMediaStrings.LinkedIn),
      icon: LinkedInIcon,
      altText: socialMediaStrings.LinkedIn,
    },
    Instagram: {
      href: getUrl(socialLinks, socialMediaStrings.Instagram),
      icon: InstagramIcon,
      altText: socialMediaStrings.Instagram,
    },
    Facebook: {
      href: getUrl(socialLinks, socialMediaStrings.Facebook),
      icon: FacebookIcon,
      altText: socialMediaStrings.Facebook,
    },
  }

  socialLinks.map((social) => {
    socialMediaLinks.push(socialMediaTypes[social.social_media_channel.social_media_name])
  });

  return socialMediaLinks;
}

function getUrl(socialLinks, type) {
  const indexOfSearchedType = socialLinks.findIndex(social => social.social_media_channel.social_media_name === type);
  return socialLinks[indexOfSearchedType]?.url;
}

export function createSocialMediaIconButton(socialChannel) {
  const socialChannels = {
    Twitter: {
      icon: TwitterIcon,
    },
    Youtube: {
      icon: YouTubeIcon,
    },
    LinkedIn: {
      icon: LinkedInIcon,
    },
    Instagram: {
      icon: InstagramIcon,
    },
    Facebook: {
      icon: FacebookIcon,
    },
  };

  return socialChannels[socialChannel];
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
