import InstagramIcon from "@material-ui/icons/Instagram";
import TwitterIcon from "@material-ui/icons/Twitter";
import YouTubeIcon from "@material-ui/icons/YouTube";
import FacebookIcon from "@material-ui/icons/Facebook";
import LinkedInIcon from "@material-ui/icons/LinkedIn";

// goal is to add keys to each different type of social media (in this case its only 5)
export function assignKeys(socials) {
  const keyedSocials = [];

  // matches http://, https:// , https://www. ,http://www.
  const regexPrefix = "^(http)(?:s)?(://)(?:www.)?";

  // matches.com/ anything
  const regexSuffix = ".com/.+$";

  const twitterRegex = new RegExp(regexPrefix + "twitter" + regexSuffix);
  const youtubeRegex = new RegExp(regexPrefix + "youtube" + regexSuffix);
  const linkedInRegex = new RegExp(regexPrefix + "linkedin" + regexSuffix);
  const instagramRegex = new RegExp(regexPrefix + "instagram" + regexSuffix);
  const facebookRegex = new RegExp(regexPrefix + "facebook" + regexSuffix);

  socials.map((sm) => {
    // check for twitter
    const socialMediaChannel = {
      ...sm.social_media_channel,
      is_checked: true,
    };
    if (twitterRegex.test(sm.social_media_channel.social_media_name)) {
      keyedSocials.push({
        ...socialMediaChannel,
        key: 0,
      });
    }
    // check for youtube
    if (youtubeRegex.test(sm.social_media_channel.social_media_name)) {
      keyedSocials.push({
        ...socialMediaChannel,
        key: 1,
      });
    }
    // check for linkedIn
    if (linkedInRegex.test(sm.social_media_channel.social_media_name)) {
      keyedSocials.push({
        ...socialMediaChannel,
        key: 2,
      });
    }
    // check for instagram
    if (instagramRegex.test(sm.social_media_channel.social_media_name)) {
      keyedSocials.push({
        ...socialMediaChannel,
        key: 3,
      });
    }
    // check for facebook
    if (facebookRegex.test(sm.social_media_channel.social_media_name)) {
      keyedSocials.push({
        ...socialMediaChannel,
        key: 4,
      });
    }
  });
  return keyedSocials;
}

export function verifySocialMediaLinks(socialOptions, texts) {
  const err = {};

  // matches http://, https:// , https://www. ,http://www.
  const regexPrefix = "^(http)(?:s)?(://)(?:www.)?";

  // matches.com/ anything
  const regexSuffix = ".com/.+$";
  let regex;
  let matches = false;

  socialOptions.map((so) => {
    switch (so.key) {
      case 0: // twitter
        regex = new RegExp(regexPrefix + "twitter" + regexSuffix);
        matches = regex.test(so.social_media_name);
        err.twitterErr = matches ? null : texts.does_not_comply_twitter;
        break;
      case 1: // youtube
        regex = new RegExp(regexPrefix + "youtube" + regexSuffix);
        matches = regex.test(so.social_media_name);
        err.youtubeErr = matches ? null : texts.does_not_comply_youtube;
        break;
      case 2: // linkedIn
        regex = new RegExp(regexPrefix + "linkedin" + regexSuffix);
        matches = regex.test(so.social_media_name);
        err.linkedInErr = matches ? null : texts.does_not_comply_linkedin;
        break;
      case 3: // instagram
        regex = new RegExp(regexPrefix + "instagram" + regexSuffix);
        matches = regex.test(so.social_media_name);
        err.instagramErr = matches ? null : texts.does_not_comply_instagram;
        break;
      case 4: // facebook
        regex = new RegExp(regexPrefix + "facebook" + regexSuffix);
        matches = regex.test(so.social_media_name);
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
    switch (social.key) {
      case 0: // twitter
        socialMediaLinks.push(createSocialMediaIconButton(social));
        break;
      case 1: // youtube
        socialMediaLinks.push(createSocialMediaIconButton(social));
        break;
      case 2: // linkedin
        socialMediaLinks.push(createSocialMediaIconButton(social));
        break;
      case 3: // instagram
        socialMediaLinks.push(createSocialMediaIconButton(social));
        break;
      case 4: // facebook
        socialMediaLinks.push(createSocialMediaIconButton(social));
        break;
      default:
        break;
    }
  });
  return socialMediaLinks;
}

function createSocialMediaIconButton(social) {
  const link = social.social_media_name;
  switch (social.key) {
    case 0:
      return {
        href: link,
        icon: TwitterIcon,
        altText: "Twitter",
      };
    case 1:
      return {
        href: link,
        icon: YouTubeIcon,
        altText: "Youtube",
      };
    case 2:
      return {
        href: link,
        icon: LinkedInIcon,
        altText: "LinkedIn",
      };
    case 3:
      return {
        href: link,
        icon: InstagramIcon,
        altText: "Instagram",
      };
    case 4:
      return {
        href: link,
        icon: FacebookIcon,
        altText: "Facebook",
      };
    default:
      break;
  }
}
