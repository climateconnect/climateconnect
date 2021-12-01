import { Avatar, Button, Chip, Container, Link, Tooltip, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import PlaceIcon from "@material-ui/icons/Place";
import React, { useContext } from "react";
import Linkify from "react-linkify";
import { getImageUrl } from "../../../public/lib/imageOperations";
import getTexts from "../../../public/texts/texts";
import MessageContent from "../communication/MessageContent";
import UserContext from "../context/UserContext";
import MiniHubPreviews from "../hub/MiniHubPreviews";
import MiniOrganizationPreview from "../organization/MiniOrganizationPreview";
import ProfileBadge from "../profile/ProfileBadge";
import DetailledDescription from "./DetailledDescription";
import SocialMediaShareButton from "../shareContent/SocialMediaShareButton";
import Cookies from "universal-cookie";

const useStyles = makeStyles((theme) => ({
  avatarContainer: {
    [theme.breakpoints.up("sm")]: {
      marginRight: theme.spacing(5),
      marginLeft: theme.spacing(5),
    },
  },
  avatar: {
    height: theme.spacing(20),
    width: theme.spacing(20),
    margin: "0 auto",
    marginTop: theme.spacing(-15),
    fontSize: 50,
    border: "4px solid white",
    backgroundcolor: "white",
    "& img": {
      objectFit: "contain",
      backgroundColor: "white",
    },
  },
  avatarWithInfo: {
    textAlign: "center",
    width: theme.spacing(40),
    margin: "0 auto",
    [theme.breakpoints.up("sm")]: {
      margin: 0,
      marginLeft: theme.spacing(-5),
      display: "inline-block",
      width: "auto",
    },
  },
  accountInfo: (props) => ({
    padding: 0,
    marginTop: theme.spacing(1),
    [theme.breakpoints.up("sm")]: {
      paddingRight: theme.spacing(15),
    },
    marginRight: props.isOwnAccount ? theme.spacing(10) : 0,
  }),
  name: {
    fontWeight: "bold",
    padding: theme.spacing(1),
    paddingLeft: 0,
    paddingRight: 0,
  },
  subtitle: {
    color: `${theme.palette.secondary.main}`,
    fontWeight: "bold",
    marginBottom: theme.spacing(1),
    marginTop: theme.spacing(1),
  },
  content: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    color: `${theme.palette.secondary.main}`,
    fontSize: 16,
  },
  noPadding: {
    padding: 0,
  },
  infoContainer: {
    [theme.breakpoints.up("sm")]: {
      display: "flex",
    },
    position: "relative",
  },
  noprofile: {
    textAlign: "center",
    padding: theme.spacing(5),
  },
  marginTop: {
    marginTop: theme.spacing(1),
  },
  chip: {
    marginBottom: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  editButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(12),
    [theme.breakpoints.up("sm")]: {
      top: theme.spacing(1),
    },
    [theme.breakpoints.down("xs")]: {
      width: theme.spacing(14),
      textAlign: "center",
    },
  },
  infoIcon: {
    marginBottom: -4,
  },
  detailledDescription: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  shareButtonContainer: {
    position: "absolute",
    right: "0%",
    bottom: "0%",
    marginRight: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));

export default function AccountPage({
  account,
  default_background,
  editHref,
  infoMetadata,
  children,
  isOwnAccount,
  isOrganization,
  editText,
  isTinyScreen,
  isSmallScreen,
}) {
  const classes = useStyles({ isOwnAccount: isOwnAccount });
  const { locale } = useContext(UserContext);
  const token = new Cookies().get("token");
  const texts = getTexts({ page: "profile", locale: locale });
  const organizationTexts = isOrganization
    ? getTexts({ page: "organization", organization: account })
    : "Not an organization";
  const componentDecorator = (href, text, key) => (
    <Link
      color="primary"
      underline="always"
      href={href}
      key={key}
      target="_blank"
      rel="noopener noreferrer"
    >
      {text}
    </Link>
  );

  const displayAccountInfo = (info) =>
    Object.keys(info)
      .sort((a, b) => {
        a = getFullInfoElement(infoMetadata, a, info[a]);
        b = getFullInfoElement(infoMetadata, b, info[b]);
        return b?.weight - a?.weight;
      })
      .map((key, index) => {
        if (info[key]) {
          const i = getFullInfoElement(infoMetadata, key, info[key]);
          const value = Array.isArray(i.value) ? i.value.join(", ") : i.value;
          const additionalText = i.additionalText ? i.additionalText : "";
          if (key === "parent_organization") {
            if (value.name)
              return (
                <div key={index} className={classes.subtitle}>
                  {account.name} {texts.is_a_suborganization_of}{" "}
                  <MiniOrganizationPreview organization={value} size="small" />
                </div>
              );
          } else if (i.type === "array" && i?.value?.length > 0) {
            return (
              <div key={index} className={classes.infoElement}>
                <div className={classes.subtitle}>{i.name}:</div>
                <div className={classes.chipArray}>
                  {i && i.value && i.value.length > 0
                    ? i.value.map((entry) => (
                        <Chip size="medium" label={entry} key={entry} className={classes.chip} />
                      ))
                    : i.missingMessage && <div className={classes.content}>{i.missingMessage}</div>}
                </div>
              </div>
            );
          } else if (i.linkify && value) {
            return (
              <>
                <div className={classes.subtitle}>{i.name}:</div>
                <Linkify componentDecorator={componentDecorator} key={index}>
                  <div className={classes.content}>{value}</div>
                </Linkify>
              </>
            );
          } else if (i.type === "bio" && value) {
            return (
              <div key={index} className={classes.content}>
                <MessageContent content={value ? value + additionalText : i.missingMessage} />
              </div>
            );
          } else if (i.type === "hubs") {
            return <MiniHubPreviews hubs={i.value} />;
          } else if (i.type === "select" && value) {
            const textValue = i.options ? i.options.find((o) => o?.key === value).name : value;
            return (
              <div key={index}>
                <div className={classes.subtitle}>{i.name}:</div>
                <div className={classes.content}>
                  {textValue ? textValue + additionalText : i.missingMessage}
                </div>
              </div>
            );
          } else if (value && !["detailled_description", "location"].includes(i.type)) {
            return (
              <div key={index}>
                <div className={classes.subtitle}>{i.name}:</div>
                <div className={classes.content}>
                  {value ? value + additionalText : i.missingMessage}
                </div>
              </div>
            );
          }
        }
      });
  const getDetailledDescription = () => {
    const detailled_description_obj = Object.keys(account.info).filter((i) => {
      const el = getFullInfoElement(infoMetadata, i, account.info[i]);
      return el.type === "detailled_description";
    });
    if (detailled_description_obj.length > 0) {
      const key = detailled_description_obj[0];
      return getFullInfoElement(infoMetadata, key, account.info[key]);
    } else return null;
  };
  const detailledDescription = getDetailledDescription();
  const locationKeys = Object.keys(account.info).filter((key) => {
    const infoElement = getFullInfoElement(infoMetadata, key, account.info[key]);
    return infoElement.type === "location";
  });
  const location = locationKeys.length > 0 ? account.info[locationKeys[0]] : null;
  const locationAdditionalText = location?.additionalText ? location.additionalText : "";

  const avatarProps = {
    alt: account.name,
    component: "div",
    size: "large",
    src: account.image,
    className: classes.avatar,
  };

  return (
    <Container maxWidth="lg" className={classes.noPadding}>
      <div
        style={{
          background: `url(${
            account.background_image ? account.background_image : default_background
          })`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          width: "100%",
          height: 305,
          position: "relative",
        }}
      >
        {isOrganization && (
          <SocialMediaShareButton
            containerClassName={classes.shareButtonContainer}
            contentLinkPath={"/" + locale + "/organizations/" + account.url_slug}
            apiEndpoint={"/api/organizations/" + account.url_slug + "/set_shared_organization/"}
            locale={locale}
            token={token}
            messageTitle={organizationTexts.climate_protection_organization + account.name}
            tinyScreen={isTinyScreen}
            smallScreen={isSmallScreen}
            mailBody={organizationTexts.share_organization_email_body}
            texts={texts}
            dialogTitle={organizationTexts.tell_others_about_this_organization}
            switchColors={true}
          />
        )}
      </div>
      <Container className={classes.infoContainer}>
        {isOwnAccount && (
          <Button
            className={classes.editButton}
            color="primary"
            variant="contained"
            href={editHref}
          >
            {editText ? editText : texts.edit_profile}
          </Button>
        )}
        <Container className={classes.avatarWithInfo}>
          <div className={classes.avatarContainer}>
            {account.badges?.length > 0 ? (
              <ProfileBadge
                name={account.badges[0].name}
                image={getImageUrl(account.badges[0].image)}
              >
                <Avatar {...avatarProps} />
              </ProfileBadge>
            ) : (
              <Avatar {...avatarProps} />
            )}
          </div>
          <Typography variant="h5" className={classes.name}>
            {account.name}
          </Typography>
          {location && (
            <div>
              <div className={classes.content}>
                <Tooltip title="Location">
                  <PlaceIcon color="primary" className={classes.infoIcon} />
                </Tooltip>
                {location ? location + locationAdditionalText : location.missingMessage}
              </div>
            </div>
          )}
          {account.types && (
            <Container className={classes.noPadding}>
              {account.types.map((type) => (
                <Chip label={type.name} key={type.key} className={classes.chip} />
              ))}
            </Container>
          )}
        </Container>
        <Container className={classes.accountInfo}>{displayAccountInfo(account.info)}</Container>
      </Container>
      {detailledDescription?.value && (
        <Container>
          <DetailledDescription
            title={detailledDescription.name}
            value={detailledDescription.value}
            className={classes.detailledDescription}
          />
        </Container>
      )}
      {children}
    </Container>
  );
}

const getFullInfoElement = (infoMetadata, key, value) => {
  return { ...infoMetadata[key], value: value };
};
