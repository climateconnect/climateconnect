import { Button, Container, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import ContactSupportOutlinedIcon from "@mui/icons-material/ContactSupportOutlined";
import ExpandLessOutlinedIcon from "@mui/icons-material/ExpandLessOutlined";
import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";
import React, { useContext, useState } from "react";

import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import FaqQuestionElement from "../faq/FaqQuestionElement";

const useStyles = makeStyles((theme) => ({
  root: {
    background: theme.palette.primary.main,
    marginTop: theme.spacing(8),
    marginBottom: theme.spacing(8),
    paddingTop: theme.spacing(5),
    paddingBottom: theme.spacing(2),
  },
  explanationWrapper: {
    display: "flex",
    maxWidth: 800,
    margin: "0 auto",
    marginBottom: theme.spacing(2),
  },
  icon: {
    color: theme.palette.yellow.main,
    height: 120,
    width: 120,
  },
  faqLink: {
    color: "inherit",
    textDecoration: "underline",
    fontWeight: 600,
    cursor: "pointer",
  },
  explanationText: {
    color: "white",
    zIndex: 1,
  },
  headline: {
    color: "white",
    textAlign: "left",
  },
  iconWrapper: {
    marginRight: theme.spacing(4),
    [theme.breakpoints.down("sm")]: {
      position: "absolute",
      opacity: 0,
    },
  },
  textBody: {
    fontSize: 18,
  },
  faqQuestion: {
    background: theme.palette.primary.light,
    borderLeft: `5px solid ${theme.palette.yellow.main} !important`,
  },
  showMoreButton: {
    color: "white",
  },
  showMoreButtonContainer: {
    display: "flex",
    justifyContent: "center",
    marginTop: theme.spacing(2),
  },
  questionText: {
    color: theme.palette.secondary.main,
    [theme.breakpoints.down("sm")]: {
      fontWeight: "bold",
    },
  },
}));

export default function FaqSection({ headlineClass, questions }) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);

  const texts = getTexts({ page: "faq", locale: locale, classes: classes });
  const [expanded, setExpanded] = useState(false);
  const handleToggleShowMore = (e) => {
    e.preventDefault();
    setExpanded(!expanded);
  };
  return (
    <div className={classes.root}>
      <Container>
        <div className={classes.explanationWrapper}>
          <div className={classes.iconWrapper}>
            <ContactSupportOutlinedIcon className={classes.icon} />
          </div>
          <div className={classes.explanationText}>
            <Typography component="h3" className={`${headlineClass} ${classes.headline}`}>
              {texts.got_a_question}
            </Typography>
            <Typography className={classes.textBody}>
              {texts.find_all_commonly_asked_questions_on_the_faq_page}
            </Typography>
          </div>
        </div>
        <div>
          {questions &&
            questions.map(
              (q, index) =>
                (index <= 1 || expanded) && (
                  <FaqQuestionElement
                    /*TODO(undefined) answerClassName={classes.faqAnswer} */
                    className={classes.faqQuestion}
                    key={index}
                    questionObject={q}
                    questionTextClassName={classes.questionText}
                  />
                )
            )}
        </div>
        <div className={classes.showMoreButtonContainer}>
          <Button className={classes.showMoreButton} onClick={handleToggleShowMore}>
            <Typography>{expanded ? texts.show_less : texts.show_more}</Typography>
            {expanded ? <ExpandLessOutlinedIcon /> : <ExpandMoreOutlinedIcon />}
          </Button>
        </div>
      </Container>
    </div>
  );
}
