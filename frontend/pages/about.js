//global imports
import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React, { useContext, useState } from "react";
import { apiRequest } from "../public/lib/apiOperations";
import getTexts from "../public/texts/texts";
import UserContext from "../src/components/context/UserContext";
import TopOfPage from "../src/components/hooks/TopOfPage";
import WideLayout from "../src/components/layouts/WideLayout";
import Born from "../src/components/staticpages/about/Born";
import Challenge from "../src/components/staticpages/about/Challenge";
import Goals from "../src/components/staticpages/about/Goals";
import HowItWorks from "../src/components/staticpages/about/HowItWorks";
import Team from "../src/components/staticpages/about/Team";
import Timeline from "../src/components/staticpages/about/Timeline";
import Values from "../src/components/staticpages/about/Values";
import ExplainerBox from "../src/components/staticpages/ExplainerBox";
import FaqSection from "../src/components/staticpages/FaqSection";
import Quote from "../src/components/staticpages/Quote";
import StartNowBanner from "../src/components/staticpages/StartNowBanner";
import Cookies from "next-cookies";
//local components
import TopSection from "../src/components/staticpages/TopSection";

const useStyles = makeStyles((theme) => {
  return {
    root: {
      overflowX: "hidden",
    },
    headlineClass: {
      fontSize: 28,
      fontWeight: 600,
      textAlign: "center",
    },
    boxHeadlineClass: {
      fontSize: 28,
      color: theme.palette.yellow.main,
      textAlign: "left",
      fontWeight: "bold",
      marginBottom: theme.spacing(2),
      [theme.breakpoints.down("sm")]: {
        textAlign: "center",
        fontSize: 25,
      },
    },
    solutionHeadline: {
      marginTop: theme.spacing(12),
      marginBottom: theme.spacing(5),
    },
    quote: {
      maxWidth: 800,
      marginTop: theme.spacing(10),
    },
    born: {
      marginTop: theme.spacing(6),
    },
    team: {
      marginBottom: theme.spacing(6),
    },
    challenege: {
      marginTop: theme.spacing(6),
    },
  };
});

export async function getServerSideProps(ctx) {
  const { auth_token } = Cookies(ctx);

  const questions = await getQuestionsWithAnswers(auth_token, ctx.locale);
  /* "Grundlagen is probably the wrong term to find the German name of the section Basics and needs to be changed
      Should be reworked to be better scalable for more languages
  */
  const questionsBySection = ctx.locale === "en" ? questions.by_section['Basics'] : questions.by_section['Grundlagen'] ;
    return {
    props: {
      questionsFromSection: questionsBySection,
    },
  };
}

export default function About({questionsFromSection}) {
  const classes = useStyles();
  const trigger = !TopOfPage({ initTopOfPage: true });
  const { user, locale } = useContext(UserContext);
  const texts = getTexts({ page: "about", locale: locale });
  const quoteText = texts.about_quote_text;
 return (
    <>
      <WideLayout title="About" isStaticPage noSpaceBottom>
        <div className={classes.root}>
          <TopSection
            headline={texts.top_section_headline}
            subHeader={texts.top_section_subheader}
          />
          <Challenge
            className={classes.challenege}
            headlineClass={classes.headlineClass}
            showContent={trigger}
          />
          <Goals headlineClass={classes.headlineClass} />
          <Values headlineClass={classes.boxHeadlineClass} />
          <Typography
            component="h1"
            color="primary"
            className={`${classes.headlineClass} ${classes.solutionHeadline}`}
          >
            {texts.our_solution}
          </Typography>
          <ExplainerBox hideHeadline />
          <Quote className={classes.quote} text={quoteText} />
          <Born className={classes.born} headlineClass={classes.boxHeadlineClass} />
          <Timeline headlineClass={classes.headlineClass} />
          <HowItWorks headlineClass={classes.headlineClass} />
          <FaqSection
            headlineClass={classes.boxHeadlineClass}
            questions={questionsFromSection}
          />
          <Team headlineClass={classes.headlineClass} className={classes.team} />
          {!user && <StartNowBanner h1ClassName={classes.headlineClass} />}
        </div>
      </WideLayout>
    </>
  );
}

const getQuestionsWithAnswers = async (token, locale) => {
  try {
    const resp = await apiRequest({ 
      method: "get", 
      url: "/api/list_faq/",
      token: token,
      locale: locale,
     });
    if (resp.data.length === 0) {
      return null;
    }

    return {
      by_section: sortBySection(resp.data.results),
      all: resp.data.results,
    };
  } catch (err) {
    if (err.response && err.response.data) {
      console.log(err.response.data);
    } else {
      console.log(err);
    }
    return null;
  }
};

const sortBySection = (questions) => {
  return questions.reduce((obj, question) => {
    if (!obj[question.section]) obj[question.section] = [question];
    else obj[question.section].push(question);
    return obj;
  }, {});
};
