import { Button, Container, Divider, Typography, useMediaQuery } from "@mui/material";
import { Theme } from "@mui/material/styles";
import makeStyles from "@mui/styles/makeStyles";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import NextCookies from "next-cookies";
import Router from "next/router";
import React, { useContext } from "react";
import Cookies from "universal-cookie";
import ROLE_TYPES from "../../public/data/role_types";
import { apiRequest, getLocalePrefix, getRolesOptions } from "../../public/lib/apiOperations";
import { getImageUrl } from "../../public/lib/imageOperations";
import { startPrivateChat } from "../../public/lib/messagingOperations";
import { parseOrganization } from "../../public/lib/organizationOperations";
import { nullifyUndefinedValues } from "../../public/lib/profileOperations";
import getTexts from "../../public/texts/texts";
import AccountPage from "../../src/components/account/AccountPage";
import LoginNudge from "../../src/components/general/LoginNudge";
import PageNotFound from "../../src/components/general/PageNotFound";
import WideLayout from "../../src/components/layouts/WideLayout";
import ProfilePreviews from "../../src/components/profile/ProfilePreviews";
import ProjectPreviews from "../../src/components/project/ProjectPreviews";
import theme from "../../src/themes/theme";
import getOrganizationInfoMetadata from "./../../public/data/organization_info_metadata";
import UserContext from "./../../src/components/context/UserContext";
import IconButton from "@mui/material/IconButton";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import ControlPointSharpIcon from "@mui/icons-material/ControlPointSharp";
import getHubTheme from "../../src/themes/fetchHubTheme";
import { transformThemeData } from "../../src/themes/transformThemeData";

const DEFAULT_BACKGROUND_IMAGE = "/images/default_background_org.jpg";

const useStyles = makeStyles((theme) => ({
  cardHeadline: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(1),
  },
  subtitle: {
    color: `${theme.palette.secondary.main}`,
  },
  loginNudge: {
    textAlign: "center",
    margin: "0 auto",
  },
  button: {
    width: "30px",
    height: "auto",
    marginBottom: theme.spacing(1),
    color: theme.palette.background.default_contrastText,
  },
  innerIcon: {
    marginRight: theme.spacing(0.5),
    marginLeft: -theme.spacing(1),
  },
  divider: {
    marginTop: theme.spacing(1),
  },
  headline: {
    fontSize: 23,
    fontWeight: "bold",
    marginBottom: theme.spacing(1),
    wordBreak: "break-word",
    color: theme?.palette?.background?.default_contrastText,
  },
  sectionHeadlineWithButtonContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: theme.spacing(3),
  },
  no_content_yet: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(5),
  },
}));

export async function getServerSideProps(ctx) {
  const { auth_token } = NextCookies(ctx);
  const organizationUrl = encodeURI(ctx.query.organizationUrl);
  const hubUrl = ctx.query.hub;
  const [
    organization,
    projects,
    members,
    organizationTypes,
    rolesOptions,
    following,
    hubThemeData,
  ] = await Promise.all([
    getOrganizationByUrlIfExists(organizationUrl, auth_token, ctx.locale),
    getProjectsByOrganization(organizationUrl, auth_token, ctx.locale),
    getMembersByOrganization(organizationUrl, auth_token, ctx.locale),
    getOrganizationTypes(),
    getRolesOptions(auth_token, ctx.locale),
    getIsUserFollowing(organizationUrl, auth_token, ctx.locale),
    getHubTheme(hubUrl),
  ]);
  return {
    props: nullifyUndefinedValues({
      organization: organization,
      projects: projects,
      members: members,
      organizationTypes: organizationTypes,
      rolesOptions: rolesOptions,
      following: following,
      hubThemeData: hubThemeData,
      hubUrl: hubUrl,
    }),
  };
}

export default function OrganizationPage({
  organization,
  projects,
  members,
  rolesOptions,
  following,
  hubThemeData,
  hubUrl,
}) {
  const { user, locale, CUSTOM_HUB_URLS } = useContext(UserContext);
  const isCustomHub = CUSTOM_HUB_URLS.includes(hubUrl);
  const infoMetadata = getOrganizationInfoMetadata(locale, organization, false);
  const texts = getTexts({ page: "organization", locale: locale, organization: organization });
  // l. 105-137 handles following Organizations
  const [numberOfFollowers, setNumberOfFollowers] = React.useState(
    organization?.number_of_followers
  );
  const [isUserFollowing, setIsUserFollowing] = React.useState(following);
  const [followingChangePending, setFollowingChangePending] = React.useState(false);

  const handleWindowClose = (e) => {
    if (followingChangePending) {
      e.preventDefault();
      return (e.returnValue = texts.changes_might_not_be_saved);
    }
  };

  const handleFollow = (userFollows, updateCount, pending) => {
    setIsUserFollowing(userFollows);
    if (updateCount) {
      if (userFollows) {
        setNumberOfFollowers(numberOfFollowers + 1);
      } else {
        setNumberOfFollowers(numberOfFollowers - 1);
      }
    }
    setFollowingChangePending(pending);
  };

  React.useEffect(() => {
    window.addEventListener("beforeunload", handleWindowClose);

    return () => {
      window.removeEventListener("beforeunload", handleWindowClose);
    };
  });

  const customHubTheme = hubThemeData ? transformThemeData(hubThemeData) : undefined;
  return (
    <WideLayout
      title={organization ? organization.name : texts.not_found_error}
      description={organization?.name + " | " + organization?.info.short_description}
      image={getImageUrl(organization?.image)}
      headerBackground={isCustomHub ? customHubTheme?.palette?.secondary?.light : "#FFF"}
      customTheme={customHubTheme}
      hubUrl={hubUrl}
    >
      {organization ? (
        <OrganizationLayout
          numberOfFollowers={numberOfFollowers}
          handleFollow={handleFollow}
          followingChangePending={followingChangePending}
          isUserFollowing={isUserFollowing}
          organization={organization}
          projects={projects}
          members={members}
          /*TODO(unused) organizationTypes={organizationTypes} */
          infoMetadata={infoMetadata}
          user={user}
          texts={texts}
          locale={locale}
          rolesOptions={rolesOptions}
          hubUrl={hubUrl}
        />
      ) : (
        <PageNotFound itemName={texts.organization} />
      )}
    </WideLayout>
  );
}

function OrganizationLayout({
  numberOfFollowers,
  handleFollow,
  followingChangePending,
  isUserFollowing,
  organization,
  projects,
  members,
  infoMetadata,
  user,
  texts,
  locale,
  rolesOptions,
  hubUrl,
}) {
  const classes = useStyles();
  const cookies = new Cookies();

  const getRoleName = (permission) => {
    const permission_to_show = permission === "all" ? "read write" : permission;
    return rolesOptions.find((o) => o.role_type === permission_to_show).name;
  };

  const getMembersWithAdditionalInfo = (members) => {
    return members.map((m) => ({
      ...m,
      additionalInfo: [
        {
          text: m.location,
          icon: LocationOnIcon,
          iconName: "LocationOnIcon",
          importance: "high",
        },
        {
          text: m.role_in_organization,
          icon: AccountBoxIcon,
          iconName: "AccountBoxIcon",
          importance: "high",
          toolTipText: texts.role_in_organization,
        },
        {
          text: getRoleName(m.permission),
          importance: "low",
        },
      ],
    }));
  };

  const handleConnectBtn = async (e) => {
    e.preventDefault();
    const token = cookies.get("auth_token");
    const creator = members.filter((m) => m.isCreator === true)[0];
    const chat = await startPrivateChat(creator, token, locale);
    Router.push("/chat/" + chat.chat_uuid + "/");
  };
  const canEdit =
    user &&
    !!members.find((m) => m.id === user.id) &&
    [ROLE_TYPES.all_type, ROLE_TYPES.read_write_type].includes(
      members.find((m) => m.id === user.id).permission
    );

  const membersWithAdditionalInfo = getMembersWithAdditionalInfo(members);

  const isTinyScreen = useMediaQuery<Theme>(theme.breakpoints.down("sm"));
  const isSmallScreen = useMediaQuery<Theme>(theme.breakpoints.down("md"));
  return (
    <AccountPage
      numberOfFollowers={numberOfFollowers}
      handleFollow={handleFollow}
      followingChangePending={followingChangePending}
      isUserFollowing={isUserFollowing}
      account={organization}
      default_background={DEFAULT_BACKGROUND_IMAGE}
      editHref={`${getLocalePrefix(locale)}/editOrganization/${organization.url_slug}${
        hubUrl ? `?hub=${hubUrl}` : ""
      }`}
      /*TODO(unused) type="organization" */
      infoMetadata={infoMetadata}
      isOwnAccount={canEdit}
      isOrganization={true}
      editText={texts.edit_organization}
      isSmallScreen={isSmallScreen}
    >
      {!user && (
        <LoginNudge
          className={classes.loginNudge}
          whatToDo={texts.to_see_this_organizations_full_information}
        />
      )}
      <Container>
        {user && !canEdit && (
          <Button variant="contained" color="primary" onClick={handleConnectBtn}>
            {texts.send_message}
          </Button>
        )}
        <div className={classes.sectionHeadlineWithButtonContainer}>
          <Typography color="primary" className={classes.headline} component="h2">
            {texts.this_organizations_projects}
          </Typography>
          {isTinyScreen ? (
            <IconButton
              href={`${getLocalePrefix(locale)}/share${hubUrl ? `?hub=${hubUrl}` : ""}`}
              size="large"
            >
              <ControlPointSharpIcon
                className={classes.button}
                /*TODO(unused) variant="contained" */
                color="primary"
              />
            </IconButton>
          ) : (
            <Button
              variant="contained"
              color="primary"
              href={`${getLocalePrefix(locale)}/share${hubUrl ? `?hub=${hubUrl}` : ""}`}
            >
              <ControlPointSharpIcon className={classes.innerIcon} />
              {texts.share_a_project}
            </Button>
          )}
        </div>
        {projects && projects.length ? (
          <ProjectPreviews projects={projects} hubUrl={hubUrl} />
        ) : (
          <Typography className={classes.no_content_yet}>
            {texts.this_organization_has_not_listed_any_projects_yet}
          </Typography>
        )}
      </Container>
      <Divider className={classes.divider} />
      <Container>
        <div className={classes.sectionHeadlineWithButtonContainer}>
          <Typography color="primary" className={classes.headline} component="h2">
            {texts.members_of_organization}
          </Typography>
          {canEdit &&
            (isTinyScreen ? (
              <IconButton
                href={`${getLocalePrefix(locale)}/manageOrganizationMembers/${
                  organization.url_slug
                }${hubUrl ? `?hub=${hubUrl}` : ""}`}
                size="large"
              >
                <GroupAddIcon className={classes.button} color="primary" />
              </IconButton>
            ) : (
              <Button
                variant="contained"
                color="primary"
                href={`${getLocalePrefix(locale)}/manageOrganizationMembers/${
                  organization.url_slug
                }${hubUrl ? `?hub=${hubUrl}` : ""}`}
              >
                <GroupAddIcon className={classes.innerIcon} />
                {texts.manage_members}
              </Button>
            ))}
        </div>
        {members && members.length ? (
          <ProfilePreviews
            profiles={membersWithAdditionalInfo}
            showAdditionalInfo
            hubUrl={hubUrl}
          />
        ) : (
          <Typography>
            {texts.none_of_the_members_of_this_organization_has_signed_up_yet}
          </Typography>
        )}
      </Container>
    </AccountPage>
  );
}

async function getOrganizationByUrlIfExists(organizationUrl, token, locale) {
  try {
    const resp = await apiRequest({
      method: "get",
      url: "/api/organizations/" + organizationUrl + "/",
      token: token,
      locale: locale,
    });
    return parseOrganization(resp.data);
  } catch (err) {
    console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
}

async function getProjectsByOrganization(organizationUrl, token, locale) {
  try {
    const resp = await apiRequest({
      method: "get",
      url: "/api/organizations/" + organizationUrl + "/projects/",
      token: token,
      locale: locale,
    });
    if (!resp.data) return null;
    else {
      return parseProjectStubs(resp.data.results);
    }
  } catch (err) {
    console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
}

async function getIsUserFollowing(organizationUrl, token, locale) {
  try {
    const resp = await apiRequest({
      method: "get",
      url: "/api/organizations/" + organizationUrl + "/am_i_following/",
      token: token,
      locale: locale,
    });
    if (resp.data.length === 0) return null;
    else {
      return resp.data.is_following;
    }
  } catch (err) {
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
}

async function getMembersByOrganization(organizationUrl, token, locale) {
  try {
    const resp = await apiRequest({
      method: "get",
      url: "/api/organizations/" + organizationUrl + "/members/?page=1&page_size=24",
      token: token,
      locale: locale,
    });
    if (!resp.data) return null;
    else {
      return parseOrganizationMembers(resp.data.results);
    }
  } catch (err) {
    console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
}

async function getOrganizationTypes() {
  return [];
}

function parseProjectStubs(projects) {
  return projects.map((p) => {
    const project = p.project;
    return {
      ...project,
      location: project.location,
    };
  });
}

function parseOrganizationMembers(members) {
  return members.map((m) => {
    const member = m.user;
    return {
      ...member,
      name: member.first_name + " " + member.last_name,
      permission: m.permission.role_type,
      isCreator: m.permission.role_type === ROLE_TYPES.all_type,
      time_per_week: m.time_per_week,
      role_in_organization: m.role_in_organization,
      location: member.location,
    };
  });
}
