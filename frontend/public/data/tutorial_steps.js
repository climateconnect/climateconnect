import { Button, CircularProgress, Link, makeStyles } from "@material-ui/core";
import Router from "next/router";
import React from "react";
import Cookies from "universal-cookie";
import { startPrivateChat } from "../lib/messagingOperations";

const useStyles = makeStyles((theme) => ({
  buttonContainer: {
    display: "flex",
    justifyContent: "space-around",
    marginTop: theme.spacing(2),
  },
  signUpButton: {
    background: theme.palette.primary.extraLight,
    minWidth: 100,
    "&:hover": {
      background: "#fff",
    },
  },
  link: {
    color: "white",
    textDecoration: "underline",
  },
  thomasImage: {
    borderRadius: 20,
    marginRight: theme.spacing(0.5),
    height: 30,
  },
}));

export default function get_steps({
  projectCardRef,
  filterButtonRef,
  organizationsTabRef,
  hubsSubHeaderRef,
  hubQuickInfoRef,
  hubProjectsButtonRef,
  projectDescriptionRef,
  collaborationSectionRef,
  contactProjectCreatorButtonRef,
  projectTabsRef,
  hubName,
  onClickForward,
}) {
  const classes = useStyles();
  const cookies = new Cookies();
  const token = cookies.get("token");
  const [loading, setLoading] = React.useState(false);

  const handleConnectBtn = async (e) => {
    e.preventDefault();
    setLoading(true);
    const chat = await startPrivateChat({ url_slug: "thomasbove4" }, token);
    if (chat && chat.chat_uuid) Router.push("/chat/" + chat.chat_uuid + "/");
    else setLoading(false);
  };

  return [
    {
      step: 0,
      headline: "Welcome to Climate Connect!",
      pages: ["/browse", "/hubs/", "/projects/"],
      text: (
        <span>
          Climate Connect is a free collaboration platform for people taking climate action.
          <br />
          Want to discover all the things you can do here?
        </span>
      ),
    },
    {
      step: 1,
      headline: "Let's start with a question!",
      pages: ["/browse", "/hubs/", "/projects/"],
      text: (
        <span>
          Are you already involved in climate action, for example as a volunteer or in your
          professional life?
        </span>
      ),
      setsValue: "isActivist",
      possibleAnswers: {
        No: "false",
        "No, but I'd like to": "soon",
        Yes: "true",
      },
    },
    {
      step: 2,
      headline: "Welcome to the browse page!",
      pages: ["/browse"],
      texts: {
        isActivist: {
          true: (
            <span>
              Great that {"you're"} already a climate hero! 🌎 <br />
              Here you can browse through all climate projects created by Climate Connect users. You
              can share your own (later 😉) or find the right people to connect with to multiply
              your impact.
            </span>
          ),
          soon: (
            <span>
              {"That's"} exciting, you have come to the right place to get started! 🌎 We need smart
              people like you to work together to solve this crisis. On this page you can browse
              through all climate projects created by Climate Connect members.
            </span>
          ),
          false: (
            <span>
              No worries, here is the right place to start off! On this page you can browse through
              all climate projects created by Climate Connect members.
            </span>
          ),
        },
      },
    },
    {
      step: 3,
      headline: `Welcome to the ${hubName} hub page!`,
      pages: ["/hubs/"],
      texts: {
        isActivist: {
          true: (
            <span>
              Great that {"you're"} already a climate hero! 🌎 <br />
              Here you can find climate action projects in the {hubName} field that were created by
              Climate Connect members. You can find an overview of all projects on the{" "}
              <Link href="/browse" target="_blank" className={classes.link}>
                browse
              </Link>{" "}
              page.
            </span>
          ),
          soon: (
            <span>
              {"That's"} exciting, you have come to the right place to get started! 🌎 We need smart
              people like you to work together to solve this crisis.
              <br />
              Here you can find climate action projects in the {hubName} field that were created by
              Climate Connect members. You can find an overview of all projects on the{" "}
              <Link href="/browse" target="_blank" className={classes.link}>
                browse
              </Link>{" "}
              page.
            </span>
          ),
          false: (
            <span>
              No worries, here is the right place to start off! <br />
              On this page you can find climate action projects in the {hubName} field that were
              created by Climate Connect members. You can find an overview of all projects on the{" "}
              <Link href="/browse" target="_blank" className={classes.link}>
                browse
              </Link>{" "}
              page.
            </span>
          ),
        },
      },
    },
    {
      step: 4,
      headline: "The project cards!",
      pages: ["/browse", "/hubs/"],
      pointsAt: projectCardRef,
      texts: {
        isActivist: {
          true: (
            <span>
              Find interesting climate projects to collaborate with or get inspired by! Hover over a
              card to see a short summary of what the project is about.
            </span>
          ),
          soon: (
            <span>
              Find interesting climate projects to join or maybe even get inspired to do something
              similar at your location! Hover over a card to see a short summary of what the project
              is about.
            </span>
          ),
          false: (
            <span>
              Find interesting climate projects to join or maybe even get inspired to do something
              similar at your location! Hover over a card to see a short summary of what the project
              is about.
            </span>
          ),
        },
      },
    },
    {
      step: 5,
      headline: "Filter and find what you're looking for",
      pages: ["/browse", "/hubs/"],
      pointsAt: filterButtonRef,
      text: (
        <span>
          Click on the {'"Filter"'} button to filter the projects, for example by location or
          category. Choose what you want to filter by and click {'"Apply"'} to see the results!
        </span>
      ),
      texts: {
        isActivist: {
          true: (
            <span>
              Click on the {'"Filter"'} button to filter the projects, for example by location or
              category. Choose what you want to filter by and click {'"Apply"'} to see the results!
            </span>
          ),
          soon: (
            <span>
              Click on the {'"Filter"'} button to filter the projects, for example by location,
              category or the skills they are looking for. Choose what you want to filter by and
              click {'"Apply"'} to see the results!
            </span>
          ),
          false: (
            <span>
              Click on the {'"Filter"'} button to filter the projects, for example by location or
              category. Choose what you want to filter by and click {'"Apply"'} to see the results!
            </span>
          ),
        },
      },
      placement: "top",
    },
    {
      step: 6,
      headline: "Tabs",
      pages: ["/browse", "/hubs/"],
      pointsAt: organizationsTabRef,
      text: (
        <span>
          Click on another tab to see all active organizations or members of Climate Connect. These
          are the faces behind the projects and the climate actors we strive to we strive to
          empower.
        </span>
      ),
      placement: "top",
    },
    {
      step: 7,
      headline: "Climate action hubs",
      pages: ["/browse"],
      pointsAt: hubsSubHeaderRef,
      text: (
        <span>
          Find plentiful information and effective and interesting projects in a specific field by
          clicking on one of the links to our hubs.
        </span>
      ),
      placement: "bottom",
    },
    {
      step: 8,
      headline: "Quick bits",
      pages: ["/hubs/"],
      pointsAt: hubQuickInfoRef,
      text: (
        <span>
          Every hub page provides a summary as well as detailed information about the impact of each
          sector. Additional statistics help you to put each sector into perspective.
        </span>
      ),
      placement: "bottom",
    },
    {
      step: 9,
      headline: "Want to get involved in the sector?",
      pages: ["/hubs/"],
      pointsAt: hubProjectsButtonRef,
      text: (
        <span>
          By clicking on {'"Show projects"'} you directly get to the projects from this sector that
          have been shared by Climate Connect users.
        </span>
      ),
      placement: "top",
      triggerNext: "showProjectsButton",
    },
    {
      step: 10,
      headline: "Click a project",
      pages: ["/hubs/"],
      pointsAt: projectCardRef,
      text: <span>Click on a project to find out more about it!</span>,
      placement: "top",
    },
    {
      step: 11,
      headline: "Welcome to the project page!",
      pages: ["/projects/"],
      text: (
        <span>
          In the top section you can find a short summary ({"<240 characters"}) and the most
          important information about the project. If the first impression is interesting, you can
          dive deeper.
        </span>
      ),
      placement: "top",
    },
    {
      step: 12,
      headline: "More Detailled information about the project",
      pages: ["/projects/"],
      pointsAt: projectDescriptionRef,
      text: (
        <span>
          Here you can find more detailled information about the project, some projects even include
          a video. If you have a question orthink something is missing you can get in contact with
          the creator. (more on that later)
        </span>
      ),
      placement: "top-start",
    },
    {
      step: 13,
      headline: "Collaboration",
      pages: ["/projects/"],
      pointsAt: collaborationSectionRef,
      text: (
        <span>
          This section shows you if the project needs help in a specific area. If you are interested
          to get involved click the...
        </span>
      ),
      placement: "top-start",
    },
    {
      step: 14,
      headline: "...Contact button",
      pages: ["/projects/"],
      pointsAt: contactProjectCreatorButtonRef,
      text: (
        <span>
          Get in contact with the project creator directly in a private chat. Ask them how to get
          involved or any other question or suggestion you might have.
          {"Don't"} hesitate to use this button frequently, working together is the only way{" "}
          {"we're"} going to solve the climate crisis!
        </span>
      ),
      placement: "bottom",
    },
    {
      step: 15,
      headline: "Meet the team and discuss the project",
      pages: ["/projects/"],
      pointsAt: projectTabsRef,
      text: (
        <span>
          As an alternative to a direct message, you can comment and start a discussion. Also: find
          out who is working on the project in the team tab.
        </span>
      ),
      placement: "top-start",
    },
    {
      step: 16,
      headline: "Are you ready to join team climate?",
      pages: ["/browse", "/hubs/", "/projects/"],
      loggedIn: false,
      texts: {
        isActivist: {
          true: (
            <span>
              Sign up to Climate Connect for free to join our international community of people
              working together to solve the climate crisis. Share you own organization and/or
              projects to get recognition, find new team members and spread your project worldwide.
            </span>
          ),
          soon: (
            <span>
              Sign up to Climate Connect for free to join our international community of people
              working together to solve the climate crisis.
              {"You'll"} be able to find the right project to work on with your skillset to make the
              biggest possible difference against climate change!
            </span>
          ),
          false: (
            <span>
              Do you agree that we can only solve the climate crisis through collaboration? <br />
              Sign up to Climate Connect for free to join our international community of people
              working together to solve the climate crisis
            </span>
          ),
        },
      },
      button: (
        <div className={classes.buttonContainer}>
          <Button href="/signup?from_tutorial=true" className={classes.signUpButton} size="large">
            Sign up
          </Button>
        </div>
      ),
    },
    {
      step: 17,
      headline: "That's it for this page!",
      pages: ["/browse", "/hubs/", "/projects/"],
      loggedIn: true,
      text: (
        <span>
          Great to have you on team climate. We would love to help you with any problem related to
          climate action! Thomas, our community manager will gladly connect you to the right people
          in the community!
        </span>
      ),
      button: (
        <div className={classes.buttonContainer}>
          <Button className={classes.signUpButton} onClick={handleConnectBtn}>
            {loading ? (
              <CircularProgress size={24} className={classes.buttonProgress} />
            ) : (
              <>
                <img src="../images/thomas_profile_image.jpg" className={classes.thomasImage} />
                Message Thomas
              </>
            )}
          </Button>
          <Button className={classes.signUpButton} size="large" onClick={onClickForward}>
            Finish
          </Button>
        </div>
      ),
    },
  ];
}
