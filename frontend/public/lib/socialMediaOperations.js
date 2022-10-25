import InstagramIcon from "@material-ui/icons/Instagram";
import TwitterIcon from "@material-ui/icons/Twitter";
import YouTubeIcon from "@material-ui/icons/YouTube";
import FacebookIcon from "@material-ui/icons/Facebook";
import LinkedInIcon from "@material-ui/icons/LinkedIn";

import { apiRequest } from "./apiOperations";

export function verifySocialMediaLink(socialMediaChannel, url, texts) {
  const baseUrl = socialMediaChannel.base_url;
  const verfiedSocialMediaLinks = {
    "Twitter": verficationOfInput(baseUrl, url, texts.does_not_comply_twitter),
    "Youtube": verficationOfInput(baseUrl, url, texts.does_not_comply_youtube),
    "LinkedIn": verficationOfInput(baseUrl, url, texts.does_not_comply_linkedin),
    "Instagram": verficationOfInput(baseUrl, url, texts.does_not_comply_instagram),
    "Facebook": verficationOfInput(baseUrl, url, texts.does_not_comply_facebook),

  }
  return(verfiedSocialMediaLinks[socialMediaChannel.name]);

}

function verficationOfInput(baseUrl, url, errorMessage) {
  // matches.com/ anything
  const regexSuffix = ".+$";
 
  const regex = new RegExp(baseUrl + regexSuffix);
  const matches = regex.test(url);
  const error = matches ? "" : errorMessage;
  return error;

}

export function getSocialMediaButtons(socialLinks) {
  const socialMediaLinks = [];
  socialLinks.map((social) => {
    const link = social.url;
    switch (social.social_media_channel.social_media_name) {
      case "Twitter": // twitter
        socialMediaLinks.push({
          href: link,
          icon: TwitterIcon,
          altText: "Twitter",
        });
        break;
      case "Youtube": // youtube
        socialMediaLinks.push({
          href: link,
          icon: YouTubeIcon,
          altText: "Youtube",
        });
        break;
      case "LinkedIn": // linkedin
        socialMediaLinks.push({
          href: link,
          icon: LinkedInIcon,
          altText: "LinkedIn",
        });
        break;
      case "Instagram": // instagram
        socialMediaLinks.push( {
          href: link,
          icon: InstagramIcon,
          altText: "Instagram",
        });
        break;
      case "Facebook": // facebook
        socialMediaLinks.push({
          href: link,
          icon: FacebookIcon,
          altText: "Facebook",
        });
        break;

      default:
        break;
    }
  });
  return socialMediaLinks;
}

export function createSocialMediaIconButton (socialChannel) {
  const socialChannels = {
    "Twitter": {
      icon: TwitterIcon,
    },
    "Youtube": {
      icon: YouTubeIcon,
    },
    "LinkedIn": {
      icon: LinkedInIcon,
    },
    "Instagram": {
      icon: InstagramIcon,
    },
    "Facebook": {
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
