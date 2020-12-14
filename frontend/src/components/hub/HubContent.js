import { Container, Typography, makeStyles, Button, Collapse } from "@material-ui/core";
import React from "react";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import StatBox from "./StatBox";

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(3),
    display: "flex",
  },
  h1: {
    fontSize: 30,
    fontWeight: 700,
    marginBottom: theme.spacing(2),
  },
  expandMoreButton: {
    width: "100%",
  },
  h2: {
    color: theme.palette.primary.main,
    fontWeight: 600,
    fontSize: 21,
    marginBottom: theme.spacing(1),
  },
  infoBoxContainer: {
    marginLeft: theme.spacing(4),
  },
  showSolutionsButton: {
    width: "100%",
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(4),
  },
}));

export default function HubContent({ headline, quickInfo, detailledInfo, stats, name }) {
  const classes = useStyles();
  const [expanded, setExpanded] = React.useState(false);
  const handleClickExpand = () => setExpanded(!expanded);
  return (
    <Container className={classes.root}>
      <div>
        <Typography color="primary" component="h1" className={classes.h1}>
          {headline}
        </Typography>
        <Typography>{quickInfo}</Typography>
        <Collapse in={expanded}>
          <div>{detailledInfo}</div>
        </Collapse>
        <Button className={classes.expandMoreButton} onClick={handleClickExpand}>
          {expanded ? (
            <>
              <ExpandLessIcon />
              Less{" "}
            </>
          ) : (
            <>
              <ExpandMoreIcon />
              More
            </>
          )}
        </Button>
        <Typography>
          Knowing the facts is important but taking action is what matters! The clock is ticking and
          every tenth of an degree matters. Find impactful climate change solutions that Climate
          Connect users are working on below. Get involved with the solutions or spread them to your
          home town. Contact the {"solutions'"} creators direcly on the project page to start a
          conversation!
        </Typography>
        <Button className={classes.showSolutionsButton} variant="contained" color="primary">
          <ExpandMoreIcon /> Show Solutions
        </Button>
      </div>
      <div className={classes.infoBoxContainer}>
        <StatBox name={name} stats={stats} />
      </div>
    </Container>
  );
}
