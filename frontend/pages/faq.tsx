import { Container, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import Cookies from "next-cookies";
import React, { useContext } from "react";
import WebflowPage from "../src/components/webflow/WebflowPage";

import { apiRequest } from "../public/lib/apiOperations";
import getTexts from "../public/texts/texts";
import UserContext from "../src/components/context/UserContext";
import FilteredFaqContent from "../src/components/faq/FilteredFaqContent";
import UnfilteredFaqContent from "../src/components/faq/UnfilteredFaqContent";
import FilterSearchBar from "../src/components/filter/FilterSearchBar";
import WideLayout from "../src/components/layouts/WideLayout";
import HeaderImage from "../src/components/staticpages/HeaderImage";

const useStyles = makeStyles((theme) => {
  return {
    headerTextContainer: {
      position: "absolute",
      top: "45%",
      left: "10%",
      maxWidth: "400px",
      minWidth: "250px",
      borderRadius: "5px",
      backgroundColor: "#207178",
    },
    headerTextInnerContainer: {
      height: "100%",
      display: "flex",
      alignItems: "start",
      justifyContent: "left",
    },
    headerTextBig: {
      color: "white",
      fontWeight: 700,
      fontSize: 40,
      textAlign: "left",
      padding: "16px 0 0px 10px",
      backgroundImage: "linear-gradient(58deg, #66bcb5, #f3d516)",
      backgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
    headerTextSmall: {
      color: "white",
      fontSize: 18,
      fontWeight: 600,
      textAlign: "left",
      padding: "7px 0 16px 10px",
    },
    topText: {
      fontWeight: "bold",
      fontSize: 19,
      textAlign: "center",
      [theme.breakpoints.down("lg")]: {
        fontSize: 14,
        fontWeight: "normal",
      },
      paddingTop: "70px",
    },
    searchBarContainer: {
      flexGrow: 100,
      marginTop: theme.spacing(3),
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    searchBar: {
      width: "100%",
      maxWidth: 780,
      margin: "0 auto",
    },
  };
});

export async function getServerSideProps(ctx) {
  const { auth_token } = Cookies(ctx);

  // Fetch list of FAQ questions from the database
  const questions = await getQuestionsWithAnswers(auth_token, ctx.locale);

  return {
    props: {
      questionsBySection: questions!.by_section,
      questions: questions!.all,
    },
  };
}

export default function Faq({ questionsBySection, questions }) {
  const classes = useStyles();
  // The first section should be the initial tab value
  const [searchValue, setSearchValue] = React.useState("");
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "faq", locale: locale });

  const handleSearchBarChange = (event) => {
    setSearchValue(event?.target?.value);
  };
  return (
    <div>
      <WideLayout title={texts.faq} isStaticPage>
        <HeaderImage>
          <div className={classes.headerTextContainer}>
            <div className={classes.headerTextInnerContainer}>
              <div>
                <Typography
                  color="primary"
                  component="h1"
                  variant="h1"
                  className={classes.headerTextBig}
                >
                  {texts.faq}
                </Typography>
                <Typography variant="h1" className={classes.headerTextSmall}>
                  {texts.find_your_answers_here}
                </Typography>
              </div>
            </div>
          </div>
        </HeaderImage>
        <Container>
          <Typography className={classes.topText} component="h1">
            {texts.cant_find_the_answer_to_your_question_contact}
          </Typography>
          <div className={classes.searchBarContainer}>
            <FilterSearchBar
              label={texts.search_for_keywords}
              className={classes.searchBar}
              onChange={handleSearchBarChange}
              value={searchValue}
            />
          </div>
          {searchValue ? (
            <FilteredFaqContent searchValue={searchValue} questions={questions} />
          ) : (
            <UnfilteredFaqContent questionsBySection={questionsBySection} />
          )}
        </Container>
      </WideLayout>
    </div>
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
  } catch (err: any) {
    if (err.response && err.response.data) {
      console.log(err.response.data);
    } else console.log(err);
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
