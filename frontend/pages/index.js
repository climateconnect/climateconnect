import { Button, makeStyles } from "@material-ui/core";
import NextCookies from "next-cookies";
import React, { useContext, useEffect, useRef, useState } from "react";
import { apiRequest, getLocalePrefix } from "../public/lib/apiOperations";
import getTexts from "../public/texts/texts";
import UserContext from "../src/components/context/UserContext";
import DonationsBanner from "../src/components/landingPage/DonationsBanner";
import HubsBox from "../src/components/landingPage/HubsBox";
import JoinCommunityBox from "../src/components/landingPage/JoinCommunityBox";
import LandingTopBox from "../src/components/landingPage/LandingTopBox";
import OrganizationsSharedBox from "../src/components/landingPage/OrganizationsSharedBox";
import OurTeamBox from "../src/components/landingPage/OurTeamBox";
import PitchBox from "../src/components/landingPage/PitchBox";
import ProjectsSharedBox from "../src/components/landingPage/ProjectsSharedBox";
import WideLayout from "../src/components/layouts/WideLayout";
import ExplainerBox from "../src/components/staticpages/ExplainerBox";
import StartNowBanner from "../src/components/staticpages/StartNowBanner";

const useStyles = makeStyles((theme) => ({
  root: {
    background: "#F8F8F8",
    overflowX: "hidden",
  },
  hideOverFlowY: {
    overflowY: "hidden",
  },
  h1ClassName: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down("xs")]: {
      fontSize: 22,
    },
  },
  explainerBox: {
    marginTop: theme.spacing(6),
    [theme.breakpoints.down("sm")]: {
      marginTop: theme.spacing(2),
    },
  },
  signUpButtonContainer: {
    display: "flex",
    justifyContent: "center",
    marginTop: theme.spacing(10),
    marginBottom: theme.spacing(10),
    [theme.breakpoints.down("xs")]: {
      marginTop: theme.spacing(0),
      marginBottom: theme.spacing(7),
    },
  },
  signUpButton: {
    width: 300,
    height: 60,
    fontSize: 18,
  },
  lowerPart: {
    position: "relative",
  },
  contentRef: {
    position: "absolute",
    top: -100,
  },
  pitchBox: {
    marginTop: theme.spacing(4),
  },
  projectsSharedBox: {
    marginTop: theme.spacing(5),
  },
  loadingSpinner: {
    marginTop: theme.spacing(2),
  },
}));

export async function getServerSideProps(ctx) {
  const { token } = NextCookies(ctx);
  console.log("getting serverside props");
  if (ctx.resolvedUrl === "/" && token) {
    console.log("redirecting!!!");
    return {
      redirect: {
        permanent: false,
        destination: `${getLocalePrefix(ctx.locale)}/browse`,
      },
    };
  }
  return {
    props: {},
  };
}

export default function Index() {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "general", locale: locale });
  const [initialized, setInitialized] = useState(false);
  const [pos, setPos] = useState("top");
  const [isLoading, setIsLoading] = useState(true);
  //holds projects, organizations and hubs
  const [elements, setElements] = useState({});
  useEffect(() => {
    const initialize = async () => {
      if (!initialized && isLoading) {
        setPos(document.scrollingElement.scrollTop < 50 ? "top" : "moved");
        document.addEventListener("scroll", () => {
          const scrolled = document.scrollingElement.scrollTop;
          if (scrolled < 50) {
            setPos("top");
          } else {
            setPos("moved");
          }
        });
        const projects = await getProjects(locale);
        const organizations = await getOrganizations(locale);
        const hubs = await getHubs(locale);
        setElements({
          projects: projects,
          organizations: organizations,
          hubs: hubs,
        });
        setInitialized(true);
        setIsLoading(false);
      }
    };
    initialize();
  }, []);

  const contentRef = useRef(null);

  const scrollToContent = () => contentRef.current.scrollIntoView({ behavior: "smooth" });

  return (
    <WideLayout
      hideTitle
      fixedHeader
      transparentHeader={pos === "top"}
      noFeedbackButton
      noSpaceBottom
      largeFooter
      landingPage
    >
      <div className={`${classes.root} ${isLoading && classes.hideOverFlowY}`}>
        <LandingTopBox scrollToContent={scrollToContent} />
        <div className={classes.lowerPart}>
          <div id="info" ref={contentRef} className={classes.contentRef} />
          <ExplainerBox h1ClassName={classes.h1ClassName} className={classes.explainerBox} />
          <ProjectsSharedBox
            projects={elements.projects}
            className={classes.projectsSharedBox}
            isLoading={isLoading}
          />
          <PitchBox h1ClassName={classes.h1ClassName} className={classes.pitchBox} />
          <div className={classes.signUpButtonContainer}>
            <Button
              href={getLocalePrefix(locale) + "/signup"}
              variant="contained"
              color="primary"
              size="large"
              className={classes.signUpButton}
            >
              {texts.sign_up_and_make_a_change}
            </Button>
          </div>
          <HubsBox isLoading={isLoading} hubs={elements.hubs} />
          <JoinCommunityBox h1ClassName={classes.h1ClassName} />
          <OrganizationsSharedBox isLoading={isLoading} organizations={elements.organizations} />
          <DonationsBanner h1ClassName={classes.h1ClassName} />
          <OurTeamBox h1ClassName={classes.h1ClassName} />
          <StartNowBanner h1ClassName={classes.h1ClassName} />
        </div>
      </div>
    </WideLayout>
  );
}

const getProjects = async (token, locale) => {
  try {
    const resp = await apiRequest({
      method: "get",
      url: `/api/featured_projects/`,
      locale: locale,
      shouldThrowError: true,
    });
    if (resp.data.length === 0) {
      return null;
    }

    return parseProjects(resp.data.results);
  } catch (err) {
    if (err.response && err.response.data) {
      console.log("Error: ");
      console.log(err.response.data);
    } else console.log(err);
    throw err;
  }
};

const getOrganizations = async (locale) => {
  try {
    const resp = await apiRequest({
      method: "get",
      url: "/api/featured_organizations/",
      locale: locale,
    });
    if (resp.data.length === 0) return null;
    else return parseOrganizations(resp.data.results);
  } catch (err) {
    if (err.response && err.response.data) {
      console.log("Error: ");
      console.log(err.response.data);
    } else console.log(err);
    throw err;
  }
};

const parseProjects = (projects) => {
  return projects.map((project) => ({
    ...project,
    location: project.location,
  }));
};

const parseOrganizations = (organizations) => {
  return organizations.map((organization) => ({
    ...organization,
    types: organization.types.map((type) => type.organization_tag),
    info: {
      location: organization.location,
    },
  }));
};

const getHubs = async (locale) => {
  try {
    const resp = await apiRequest({
      method: "get",
      url: `/api/hubs/`,
      locale: locale,
    });
    return resp.data.results.slice(0, 4);
  } catch (err) {
    if (err.response && err.response.data)
      console.log("Error in getHubData: " + err.response.data.detail);
    console.log(err);
    return null;
  }
};
