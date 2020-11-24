//global imports
import React, { useContext } from "react";
import WideLayout from "../src/components/layouts/WideLayout";
import { makeStyles } from "@material-ui/core/styles";
//local components
import TopSection from "../src/components/staticpages/TopSection";
import Challenge from "../src/components/about/Challenge";
import { useScrollTrigger, Typography } from "@material-ui/core";
import Goals from "../src/components/about/Goals";
import Values from "../src/components/about/Values";
import ExplainerBox from "../src/components/staticpages/ExplainerBox";
import Quote from "../src/components/staticpages/Quote";
import Born from "../src/components/about/Born";
import Timeline from "../src/components/about/Timeline";
import HowItWorks from "../src/components/about/HowItWorks";
import FaqSection from "../src/components/staticpages/FaqSection";
import axios from "axios";
import Team from "../src/components/about/Team";
import StartNowBanner from "../src/components/staticpages/StartNowBanner";
import UserContext from "../src/components/context/UserContext";

const useStyles = makeStyles(theme => {
  return {
    headlineClass: {
      fontSize: 28,
      fontWeight: 600,
      textAlign: "center"
    },
    boxHeadlineClass: {
      fontSize: 28,
      color: theme.palette.yellow.main,
      textAlign: "left",
      fontWeight: "bold",
      marginBottom: theme.spacing(2)
    },
    solutionHeadline: {
      marginTop: theme.spacing(12),
      marginBottom: theme.spacing(5)
    },
    quote: {
      maxWidth: 800,
      marginTop: theme.spacing(10)
    },
    born: {
      marginTop: theme.spacing(6)
    },
    team: {
      marginBottom: theme.spacing(6)
    }
  };
});

export default function About({ faqQuestions }) {
  console.log(faqQuestions.by_section);
  const classes = useStyles();
  const trigger = useScrollTrigger({
    disableHysteresis: false,
    threshold: 50
  });
  const { user } = useContext(UserContext)

  const quoteText = `
    We want to connect everyone that is fighting against climate change from 
    Greta Thunberg and Greenpeace to the local sustainable startup, local 
    and national governments, and your friend who just recently realized that 
    biking to work instead of driving can already make a difference.
  `;

  return (
    <>
      <WideLayout title="About Climate Connect" isStaticPage noSpaceBottom>
        <TopSection
          headline="About Us"
          subHeader="Everything you need to know about Climate Connect"
          img={"/images/top_image_about.svg"}
        />
        <Challenge headlineClass={classes.headlineClass} showContent={trigger} />
        <Goals headlineClass={classes.headlineClass} />
        <Values headlineClass={classes.boxHeadlineClass} />
        <Typography
          component="h1"
          color="primary"
          className={`${classes.headlineClass} ${classes.solutionHeadline}`}
        >
          Our Solution
        </Typography>
        <ExplainerBox hideHeadline />
        <Quote className={classes.quote} text={quoteText} />
        <Born className={classes.born} headlineClass={classes.boxHeadlineClass} />
        <Timeline headlineClass={classes.headlineClass} />
        <HowItWorks headlineClass={classes.headlineClass} />
        <FaqSection
          headlineClass={classes.boxHeadlineClass}
          questions={faqQuestions.by_section["Basics"]}
        />
        <Team headlineClass={classes.headlineClass} className={classes.team} />
        {
          !user &&
          <StartNowBanner h1ClassName={classes.headlineClass} />
        }
      </WideLayout>
    </>
  );
}

About.getInitialProps = async () => {
  const questions = await getQuestionsWithAnswers();
  return {
    faqQuestions: questions
  };
};

const getQuestionsWithAnswers = async () => {
  try {
    const resp = await axios.get(process.env.API_URL + "/api/list_faq/");
    if (resp.data.length === 0) return null;
    else {
      console.log(resp.data.results);
      return {
        by_section: sortBySection(resp.data.results),
        all: resp.data.results
      };
    }
  } catch (err) {
    if (err.response && err.response.data) {
      console.log(err.response.data);
    } else console.log(err);
    return null;
  }
};

const sortBySection = questions => {
  return questions.reduce((obj, question) => {
    if (!obj[question.section]) obj[question.section] = [question];
    else obj[question.section].push(question);
    return obj;
  }, {});
};
