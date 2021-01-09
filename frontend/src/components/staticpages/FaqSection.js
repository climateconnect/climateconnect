import React from "react";
import { Container, Typography, makeStyles, Link, Button } from "@material-ui/core";
import ContactSupportOutlinedIcon from "@material-ui/icons/ContactSupportOutlined";
import FaqQuestionElement from "../faq/FaqQuestionElement";
import ExpandMoreOutlinedIcon from "@material-ui/icons/ExpandMoreOutlined";
import ExpandLessOutlinedIcon from "@material-ui/icons/ExpandLessOutlined";

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
    [theme.breakpoints.down("xs")]: {
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
    [theme.breakpoints.down("xs")]: {
      fontWeight: "bold",
    },
  },
}));

export default function FaqSection({ headlineClass, questions }) {
  const classes = useStyles();
  const [expanded, setExpanded] = React.useState(false);
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
              Got a question?
            </Typography>
            <Typography className={classes.textBody}>
              Find all commonly asked questions and their answers on the{" "}
              <Link className={classes.faqLink} href="/faq" target="_blank">
                FAQ page
              </Link>
              .
            </Typography>
          </div>
        </div>
        <div>
          {questions &&
            questions.map(
              (q, index) =>
                (index <= 1 || expanded) && (
                  <FaqQuestionElement
                    questionObject={q}
                    key={index}
                    className={classes.faqQuestion}
                    answerClassName={classes.faqAnswer}
                    questionTextClassName={classes.questionText}
                  />
                )
            )}
        </div>
        <div className={classes.showMoreButtonContainer}>
          <Button className={classes.showMoreButton} onClick={handleToggleShowMore}>
            <Typography>{expanded ? "Show Less" : "Show More"}</Typography>
            {expanded ? <ExpandLessOutlinedIcon /> : <ExpandMoreOutlinedIcon />}
          </Button>
        </div>
      </Container>
    </div>
  );
}
