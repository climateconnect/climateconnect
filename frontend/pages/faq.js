import React from "react";
import { Typography, Container } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import HeaderImage from "../src/components/staticpages/HeaderImage";
import WideLayout from "../src/components/layouts/WideLayout";
import FilterSearchBar from "../src/components/filter/FilterSearchBar";
import Cookies from "next-cookies";
import axios from "axios";
import tokenConfig from "../public/config/tokenConfig";
import UnfilteredFaqContent from "../src/components/faq/UnfilteredFaqContent";
import FilteredFaqContent from "../src/components/faq/FilteredFaqContent";

const useStyles = makeStyles(theme => {
  return {
    headerImageContainer: {
      marginBottom: theme.spacing(3),
      [theme.breakpoints.down("md")]: {
        marginBottom: theme.spacing(2)
      }
    },
    headerTextContainer: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      background: "rgba(255, 255, 255, 0.6)",
      width: "100%",
      height: "100%",
      [theme.breakpoints.down("md")]: {
        background: "rgba(255, 255, 255, 0.8)"
      }
    },
    headerTextInnerContainer: {
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: theme.spacing(4)
    },
    headerTextBig: {
      fontWeight: "bold",
      fontSize: 80,
      [theme.breakpoints.down("md")]: {
        fontSize: 60
      },
      [theme.breakpoints.down("xs")]: {
        fontSize: 40
      },
      textAlign: "left"
    },
    headerTextSmall: {
      color: "white",
      fontWeight: "bold",
      textAlign: "left",
      [theme.breakpoints.down("md")]: {
        fontSize: 40
      },
      [theme.breakpoints.down("xs")]: {
        fontSize: 25
      },
      textShadow: "3px 3px 3px #484848C2"
    },
    topText: {
      fontWeight: "bold",
      fontSize: 19,
      textAlign: "center",
      [theme.breakpoints.down("md")]: {
        fontSize: 14,
        fontWeight: "normal"
      }
    },
    searchBarContainer: {
      flexGrow: 100,
      marginTop: theme.spacing(3),
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    },
    searchBar: {
      width: "100%",
      maxWidth: 780,
      margin: "0 auto"
    }
  };
});

export default function Faq({ questionsBySection, questions }) {
  const classes = useStyles();
  //The first section should be the initial tab value
  const [searchValue, setSearchValue] = React.useState("");

  const handleSearchBarChange = (type, value) => setSearchValue(value);

  return (
    <div>
      <WideLayout title="FAQ" isStaticPage>
        <HeaderImage src={"images/supportusheader.jpg"} className={classes.headerImageContainer}>
          <div className={classes.headerTextContainer}>
            <div className={classes.headerTextInnerContainer}>
              <div>
                <Typography
                  color="primary"
                  component="h1"
                  variant="h1"
                  className={classes.headerTextBig}
                >
                  FAQ
                </Typography>
                <Typography variant="h1" className={classes.headerTextSmall}>
                  Find your answers here!
                </Typography>
              </div>
            </div>
          </div>
        </HeaderImage>
        <Container>
          <Typography className={classes.topText} component="h1">
            {"Can't"} find the answer to your question? Contact support@climateconnect.earth.
          </Typography>
          <div className={classes.searchBarContainer}>
            <FilterSearchBar
              label="Search for keywords"
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

Faq.getInitialProps = async ctx => {
  const { token } = Cookies(ctx);
  const questions = await getQuestionsWithAnswers(token);
  return {
    questionsBySection: questions.by_section,
    questions: questions.all
  };
};

const getQuestionsWithAnswers = async token => {
  try {
    const resp = await axios.get(process.env.API_URL + "/api/list_faq/", tokenConfig(token));
    if (resp.data.length === 0) return null;
    else {
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
