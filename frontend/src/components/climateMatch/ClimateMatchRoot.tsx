import { Container } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import Router from "next/router";
import React, { useContext, useEffect, useState } from "react";
import Cookies from "universal-cookie";
import { apiRequest } from "../../../public/lib/apiOperations";
import { getCookieProps } from "../../../public/lib/cookieOperations";
import getTexts from "../../../public/texts/texts";
import FeedbackContext from "../context/FeedbackContext";
import UserContext from "../context/UserContext";
import LoadingSpinner from "../general/LoadingSpinner";
import ClimateMatchQuestion from "./ClimateMatchQuestion";
import WelcomeToClimateMatch from "./WelcomeToClimateMatch";

const useStyles = makeStyles((theme) => ({
  loadingOverlay: {
    background: theme.palette.primary.main,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: theme.spacing(4),
    zIndex: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  root: {
    background: theme.palette.primary.main,
    marginTop: 0,
    color: "white",
    borderRadius: theme.spacing(4),
    fontFamily: "flood-std, sans-serif",
    fontStyle: "normal",
    paddingLeft: 0,
    paddingRight: 0,
    position: "relative",
    ["@media (max-width: 760px"]: {
      maxHeight: "calc(100vh - 98px)",
    },
  },
}));

const getInitialUserAnswerArray = (questions) => {
  //initialize answers to choice questions with "" and answers to ranking questions
  //with an empty array
  return questions
    .sort((a, b) => a.step - b.step)
    .map((q) => (q.answer_type === "answer" ? "" : []));
};

export default function ClimateMatchRoot() {
  const { locale, user } = useContext(UserContext);
  const texts = getTexts({ page: "climatematch", locale: locale });
  const [step, setStep] = useState(0);
  const classes = useStyles({ step: step });
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fromHub, setFromHub] = useState(null);
  const [hasDoneClimateMatch, setHasDoneClimateMatch] = useState(false);
  const [userAnswers, setUserAnswers] = useState<any[]>([]);
  const cookies = new Cookies();
  const token = cookies.get("auth_token");
  const climatematch_token = cookies.get("climatematch_token");
  const { showFeedbackMessage } = useContext(FeedbackContext);

  //get initial props after the page loaded
  useEffect(() => {
    (async function () {
      //getHubClimateMatchInfo if ?location="..." is set in the url
      const urlSearchParams = new URLSearchParams(window.location.search);
      const params = Object.fromEntries(urlSearchParams.entries()) as any;
      if (params.from_hub) setFromHub(params.from_hub);
      const retrievedQuestionsData = await getQuestions(
        token,
        locale,
        params.from_hub,
        climatematch_token
      );
      setHasDoneClimateMatch(retrievedQuestionsData.has_done_climatematch);
      setQuestions(retrievedQuestionsData.results);
      setTotalQuestions(retrievedQuestionsData.total_questions);
      setUserAnswers(getInitialUserAnswerArray(retrievedQuestionsData.results));
      setIsLoading(false);
    })();
  }, []);

  const goToNextStep = () => {
    setStep(step + 1);
  };

  const handleSetClimateMatchCookie = (data) => {
    const now = new Date();
    const ONE_YEAR_FROM_NOW = new Date(now.setFullYear(now.getFullYear() + 1));
    const cookieProps = getCookieProps(ONE_YEAR_FROM_NOW);

    cookies.set("climatematch_token", data.climatematch_token, cookieProps);
  };

  const submitUserQuestionAnswerForClimateMatch = (userAnswers, token, locale) => {
    const climatematch_token = cookies.get("climatematch_token");
    const payload: any = {
      method: "post",
      url: `/api/climatematch_question_answers/`,
      payload: {
        ...parseUserQuestionAnswers(userAnswers, questions, user, climatematch_token),
        //hub contains the url slug of the current (location) hub.
        hub: fromHub,
      },
      locale: locale,
    };
    if (user) {
      payload.token = token;
    }
    apiRequest(payload)
      .then(function (response) {
        console.log(response.data);
        if (!user) {
          handleSetClimateMatchCookie(response.data);
        }
        const fromHubParam = fromHub ? `?from_hub=${fromHub}` : "";
        const url = `/climatematchresults${fromHubParam}`;
        Router.push(url);
      })
      .catch(function (error) {
        console.log(error);
        console.log(error?.response?.data?.message);
        if (error?.response?.data?.message) {
          showFeedbackMessage?.({
            message: error.response.data.message,
            error: true,
          });
        }
      });
  };

  const handleForwardClick = (answer) => {
    const newUserAnswers = answer
      ? [...userAnswers.slice(0, step - 1), answer, ...userAnswers.slice(step)]
      : userAnswers;
    if (answer) {
      setUserAnswers(newUserAnswers);
    }
    if (step < totalQuestions) {
      setStep(step + 1);
    } else {
      const answersToSubmit = answer ? newUserAnswers : userAnswers;
      submitUserQuestionAnswerForClimateMatch(answersToSubmit, token, locale);
    }
  };

  const handleBackClick = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleChangeAnswers = (step, newAnswer) =>
    setUserAnswers([...userAnswers.slice(0, step - 1), newAnswer, ...userAnswers.slice(step)]);
  return (
    <Container className={classes.root}>
      {isLoading && (
        <div className={classes.loadingOverlay}>
          <LoadingSpinner
            isLoading
            color="#fff"
            noMarginTop
            message={texts.loading_the_climatematch}
          />
        </div>
      )}
      {step === 0 ? (
        //In the beginning we don't know the hub name and background picture of welcomeToClimateMatch yet
        //We still load the component in loading state because we need to know the height of the container
        <WelcomeToClimateMatch
          isLoading={isLoading}
          goToNextStep={goToNextStep}
          fromHub={fromHub}
          hasDoneClimateMatch={hasDoneClimateMatch}
        />
      ) : (
        <ClimateMatchQuestion
          questions={questions}
          step={step}
          userAnswers={userAnswers}
          onChangeAnswer={handleChangeAnswers}
          handleForwardClick={handleForwardClick}
          onBackClick={handleBackClick}
        />
      )}
    </Container>
  );
}

const parseUserQuestionAnswers = (userAnswers, questions, user, climatematch_token) => {
  const userQuestionAnswers = questions.map((q, i) => ({
    question_id: q.id,
    answers: userAnswers[i],
  }));
  const ret: any = {
    user_question_answers: userQuestionAnswers,
  };
  if (!user && climatematch_token) {
    ret.climatematch_token = climatematch_token;
  }
  return ret;
};

const getQuestions = async (token, locale, fromHub, climatematch_token) => {
  let url = `/api/questions/?hub=${fromHub}`;
  if (climatematch_token) {
    url += `&climatematch_token=${climatematch_token}`;
  }

  // "fromHub" determines what images to show and could lead to different questions
  try {
    const resp = await apiRequest({
      method: "get",
      url: url,
      locale: locale,
      token: token,
    });
    return resp.data;
  } catch (e) {
    console.log(e);
  }
};
