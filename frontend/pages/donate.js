import React from "react";
import WideLayout from "../src/components/layouts/WideLayout";
import { makeStyles } from "@material-ui/core/styles";
import TopSection from "../src/components/staticpages/TopSection";
import { Container, Typography, useMediaQuery } from "@material-ui/core";
import QuoteBox from "../src/components/staticpages/QuoteBox";
import TextBox from "../src/components/staticpages/donate/TextBox";
import WhoWeAreContent from "../src/components/staticpages/donate/WhoWeAreContent";
import FloatingWidget from "../src/components/staticpages/donate/FloatingWidget";
import theme from "../src/themes/theme";
import ToggleWidgetButton from "../src/components/staticpages/donate/ToggleWidgetButton";
import axios from "axios";

const useStyles = makeStyles((theme) => {
  return {
    root: {
      position: "relative",
    },
    topImageContainer: {
      width: "100%",
      height: 450,
      background: "url('/images/drought.jpg')",
      backgroundRepeat: "no-repeat",
      backgroundSize: "100% auto",
      backgroundPosition: "0px 50%",
      [theme.breakpoints.down("md")]: {
        height: 350,
        backgroundPosition: "0px 70%",
      },
      [theme.breakpoints.down("sm")]: {
        height: 260,
        backgroundPosition: "0px 85%",
      },
      [theme.breakpoints.down("xs")]: {
        height: 160,
        display: "none",
      },
    },
    imageTextContainer: {
      position: "relative",
      height: "100%",
      width: "100%",
    },
    headlineClass: {
      fontSize: 25,
      fontWeight: 700,
      marginBottom: theme.spacing(1.5),
      color: theme.palette.primary.main,
      [theme.breakpoints.down("xs")]: {
        fontSize: 20,
      },
    },
    imageText: {
      position: "absolute",
      bottom: theme.spacing(4),
      color: theme.palette.yellow.main,
      paddingRight: `max(24px, 472px - ((100% - 1280px) / 2))`,
      marginBottom: 0,
      [theme.breakpoints.down("md")]: {
        paddingRight: 472,
      },
      [theme.breakpoints.down("sm")]: {
        padding: 0,
      },
      [theme.breakpoints.down("xs")]: {
        display: "none",
      },
    },
    textBodyClass: {
      color: theme.palette.secondary.main,
    },
    textSection: {
      marginTop: theme.spacing(5),
      marginBottom: theme.spacing(5),
      paddingRight: `max(24px, 472px - ((100% - 1280px) / 2))`,
      [theme.breakpoints.down("md")]: {
        paddingRight: 472,
      },
      [theme.breakpoints.down("sm")]: {
        padding: theme.spacing(4),
      },
      [theme.breakpoints.down("xs")]: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
        paddingTop: theme.spacing(3),
        paddingBottom: theme.spacing(3),
      },
    },
    subHeadline: {
      color: theme.palette.primary.main,
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(1),
      fontWeight: 700,
      fontSize: 20,
      [theme.breakpoints.down("xs")]: {
        fontSize: 16,
      },
    },
  };
});

export default function Donate({ goal_name, goal_amount, current_amount }) {
  const classes = useStyles();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("md"));
  const [overlayOpen, setOverlayOpen] = React.useState(false);
  return (
    <WideLayout title="Your donation counts" isStaticPage noSpaceBottom noFeedbackButton>
      <div className={classes.root}>
        {isLargeScreen ? (
          <FloatingWidget
            goal_name={goal_name}
            current_amount={current_amount}
            goal_amount={goal_amount}
          />
        ) : (
          <ToggleWidgetButton
            overlayOpen={overlayOpen}
            setOverlayOpen={setOverlayOpen}
            goal_name={goal_name}
            current_amount={current_amount}
            goal_amount={goal_amount}
          />
        )}
        <TopSection
          headline="Donate"
          subHeader="Support growing a global network of climate actors."
        />
        <div className={classes.topImageContainer}>
          <Container className={classes.imageTextContainer}>
            <Typography className={`${classes.imageText} ${classes.headlineClass}`} component="h1">
              A new way to fight climate change. Donate today.
            </Typography>
          </Container>
        </div>
        <TextBox
          className={classes.textSection}
          headlineClass={classes.headlineClass}
          textBodyClass={classes.textBodyClass}
          headline="Why donate?"
          text={`
              Great that you want to support us!

              We believe that the possibility to connect and get active in the climate movement should be free and include everyone.

              With a donation you enable us to stay independent. Our full-time team is working hard every day to multiply the impact of climate actors around the globe.


            `}
          subPoints={[
            {
              headline: "Your donation helps scale up effective climate solutions",
              text: `
                There are many climate solutions, that have a huge impact in one place. Many of them could also be implemented in other places, but never get scaled up.
                With your donation we can reach even more people and enable them to work with the creators of these solutions to spread the most effective climate solutions around the world

              `,
            },
            {
              headline: "Your donation multiplies the impact of climate actors",
              text: (
                <>
                  There is currently many people around the world working on similar solutions to
                  climate change without even knowing about each other. Climate Connect allows them
                  to connect, exchange knowledge and join forces to achieve much more together. We
                  will not be able to solve this crisis by working alone or in silos and with your
                  donation Climate Connect can multiply the impact of even more climate actors
                  worldwide.
                </>
              ),
            },
            {
              headline: "Your support keeps Climate Connect independent and free for everyone",
              text:
                "We strongly believe that a platform connecting all climate actors needs to be independent, non-profit and free for everyone. This is only possible with your financial support.",
            },
          ]}
          subHeadlineClass={classes.subHeadline}
          icon="/icons/floating_sign_heart.svg"
        />
        <TextBox
          className={classes.textSection}
          headlineClass={classes.headlineClass}
          textBodyClass={classes.textBodyClass}
          headline="Donate as a gift"
          text="Give your loved ones a gift that helps save our planet. By donating you support a global effort of move towards a carbon-neutral future. You will recieve a personalized christmas themed donation certificate."
          icon="/icons/floating_sign_gift.svg"
        />
        <TextBox
          className={classes.textSection}
          headlineClass={classes.headlineClass}
          textBodyClass={classes.textBodyClass}
          headline="Donate with cryptocurrency"
          text="While we prefer other payment methods, we've also added the option to donate cryptocurrency. When donating with cryptocurrency you will not receive a donation receipt."
          icon="/icons/bitcoin.svg"
          subPoints={[{
            text: (
              <>
                <Typography color="primary" component="span">Our Bitcoin address: </Typography>
                <Typography component="span">1BTKuBx78uSGBkNcS8pCkvLKwXTH1NyJ23</Typography>
              </>
            )
          }]}
        />
        <QuoteBox
          className={classes.textSection}
          text="We can only prevent a global climate catastrophe if everyone working in climate action coordinates their efforts and the most effective solutions get spread globally - support our vision by donating."
        />
        <TextBox
          className={classes.textSection}
          headlineClass={classes.headlineClass}
          textBodyClass={classes.textBodyClass}
          headline="What we need to pay for"
          text="Next to our volunteers from around the world Climate Connect has 3 full-time employees working hard every day to bring climate actors together to multiply their positive impact on our planet. We can only do this in a sustainable way with your financial support."
          subPoints={[
            {
              headline: "Improving and updating Climate Connect",
              text: (
                <>
                  We are still in Beta and a big chunk of our work goes into designing and
                  developing new features (see our{" "}
                  <a href="https://github.com/climateconnect/climateconnect">
                    open source codebase
                  </a>
                  ). For the next few months, we will create hubs for each important topic in
                  climate action, vastly improve user experience on Climate Connect and try to
                  optimize project pages even more so we can be most effective at sparking
                  collaboration and knowledge sharing between users. We also constantly improve
                  existing parts of the websites based on user feedback.
                </>
              ),
            },
            {
              headline: "Growing the community and sparking collaboration",
              text: (
                <>
                  Just putting a platform out there is not enough. Our volunteers and full-time
                  employees spend countless hours spreading the word about Climate Connect to work
                  towards our vision of connecting all climate actors worldwide. We are also
                  constantly in contact with our community and connect users between which we see
                  synergies to spark collaboration between Climate Connect users.
                </>
              ),
            },
            {
              headline: "Ongoing expenses",
              text:
                "Our ongoing expenses include server costs, fees for bookkeeping and legal advice.",
            },
          ]}
          subHeadlineClass={classes.subHeadline}
          icon="/icons/floating_sign_expenses.svg"
        />
        <TextBox
          className={classes.textSection}
          headlineClass={classes.headlineClass}
          textBodyClass={classes.textBodyClass}
          headline="Long term sustainability"
          text={
            <>
              To make Climate Connect sustainable in the long run, we rely on people supporting us
              continuously. This is why we much prefer smaller recurring donations over one-time
              bigger donations. To pay our current full-time employees a wage that they can live on,
              we would need around 5,000€ in donations per month.
            </>
          }
          icon="/icons/floating_sign_infinity.svg"
        />
        <TextBox
          className={classes.textSection}
          headlineClass={classes.headlineClass}
          textBodyClass={classes.textBodyClass}
          headline="Who we are"
          text={
            <>
              <Typography>
                This is the European part of our team on the day we launched our Beta. In total we
                are a team of 3 full-time employees and 15 active volunteers from all around the
                world. Together we work on developing and designing the platform, spreading the word
                through marketing and trying the best to serve our community. We have all decided to
                dedicate our time towards trying to make the biggest difference in the fight against
                climate change.
              </Typography>
            </>
          }
          icon="/icons/floating_sign_group.svg"
        >
          <WhoWeAreContent />
        </TextBox>
      </div>
    </WideLayout>
  );
}

Donate.getInitialProps = async () => {
  const { goal_name, goal_amount, current_amount } = await getDonations();
  return {
    goal_name: goal_name,
    goal_amount: goal_amount,
    current_amount: current_amount,
  };
};

const getDonations = async () => {
  try {
    const resp = await axios.get(process.env.API_URL + "/api/donation_goal_progress/");
    return {
      goal_name: resp.data.name,
      goal_start: resp.data.start_date,
      goal_end: resp.data.end_date,
      goal_amount: resp.data.amount,
      current_amount: resp.data.current_amount,
    };
  } catch (err) {
    if (err.response && err.response.data) {
      console.log(err.response.data);
    } else console.log(err);
    return null;
  }
};
