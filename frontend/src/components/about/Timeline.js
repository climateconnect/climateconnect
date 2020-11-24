import React from "react";
import { makeStyles, Container, Typography, Divider } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(8)
  },
  headline: {
    maxWidth: 800,
    textAlign: "center",
    margin: "0 auto"
  },
  timelineElementsWrapper: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: theme.spacing(6)
  },
  timelineElement: {
    maxWidth: 250,
    textAlign: "center"
  },
  date: {
    fontSize: 30,
    fontWeight: "bold"
  },
  timelineElDivider: {
    background: theme.palette.yellow.main,
    height: theme.spacing(0.75),
    maxWidth: "50%",
    margin: "0 auto",
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },
  elementHeadline: {
    fontSize: 25,
    fontWeight: 600,
    marginBottom: theme.spacing(2)
  }
}));

export default function Timeline({ headlineClass }) {
  const classes = useStyles();

  return (
    <Container className={classes.root}>
      <Typography color="primary" component="h1" className={`${headlineClass} ${classes.headline}`}>
        After realizing the need for global collaboration, Climate Connect was launched in July 2020
      </Typography>
      <div className={classes.timelineElementsWrapper}>
        {timelineData.map((d, index) => (
          <TimelineElement
            key={index}
            className={classes.timelineElement}
            date={d.date}
            headline={d.headline}
            content={d.content}
          />
        ))}
      </div>
    </Container>
  );
}

const timelineData = [
  {
    date: "July 2019",
    headline: "The Idea Is Born",
    content: `After the networking event, we started working on a way for climate actors to work together to spread good climate solutions worldwide. The idea of Climate Connect was born.`
  },
  {
    date: "November 2019",
    headline: "First Prototype",
    content: `We create our first interactive design prototype and create concepts for how to create collaboration between climate actors. Our team of volunteers starts growing.`
  },
  {
    date: "July 2020",
    headline: "Open Beta launch",
    content: `We finally launched Climate Connect in Open Beta. New functionality is added every week and we constantly improve the platform based on your feedback.`
  },
  {
    date: "Summer 2021",
    headline: "Leaving Beta",
    content: `In the summer of 2021 we expect all core functionality to work smooth and all pages and content to be polished and user-friendly. Help us get here by sharing your feedback!`
  }
];

const TimelineElement = ({ date, headline, content, className }) => {
  const classes = useStyles();
  return (
    <div className={className}>
      <Typography color="secondary" className={classes.date}>
        {date}
      </Typography>
      <Divider className={classes.timelineElDivider} />
      <Typography color="primary" component="h3" className={classes.elementHeadline}>
        {headline}
      </Typography>
      <Typography>{content}</Typography>
    </div>
  );
};
