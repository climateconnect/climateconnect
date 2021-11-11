import { Container, Link, List, ListItem, ListItemIcon, makeStyles, Typography } from "@material-ui/core";
import React, { useContext, useEffect, useRef, useState } from "react";
import Cookies from "universal-cookie";
import { apiRequest } from "../../../public/lib/apiOperations";
import getTexts from "../../../public/texts/texts";
import ClimateMatchHeadline from "../climateMatch/ClimateMatchHeadline";
import UserContext from "../context/UserContext";
import LoadingContainer from "../general/LoadingContainer";
import ClimateMatchResult from "./ClimateMatchResult";

const useStyles = makeStyles((theme) => ({
  headerContainer: {
    background: theme.palette.primary.main,
    width: "100%",
    color: "white",
    fontFamily: "flood-std, sans-serif",
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  contentContainer: {
    display: "flex",
  },
  suggestionsOverviewContainer: {
    maxWidth: 300,
    paddingTop: 0,
  },
  suggestionOverviewNumber: {
    fontFamily: "flood-std, sans-serif",
    fontSize: 22,
  },
  suggestionOverviewName: {
    fontWeight: 600,
  },
  suggestionOverviewItem: {
    display: "flex",
    alignItems: "flex-start",
  },
  suggestionsOverViewItemIcon: {
    minWidth: 30,
  },
  resultsContainer: {
    flexGrow: 1,
    borderLeft: "1px solid black",
  },
  noUnderline: {
    textDecoration: "inherit",
    "&:hover": {
      textDecoration: "inherit",
    },
    color: "inherit"
  },
}));

export default function ClimateMatchResultsRoot() {
  const classes = useStyles();
  const cookies = new Cookies();
  const token = cookies.get("token");
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [page, setPage] = useState(0);
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "climatematch", locale: locale });
  const headerContainerRef = useRef(null)
  

  useEffect(async () => {
    setSuggestions((await getSuggestions(token, page)).matched_resources);
    setLoading(false);
  }, []);
  return (
    <div className={classes.root}>
      {loading ? (
        <LoadingContainer />
      ) : (
        <div>
          <div className={classes.headerContainer} ref={headerContainerRef}>
            <ClimateMatchHeadline>{texts.suggestions_for_you}</ClimateMatchHeadline>
          </div>
          <Container maxWidth="xl" className={classes.contentContainer} disableGutters>
            <div>
              <List className={classes.suggestionsOverviewContainer}>
                {suggestions.map((suggestion, index) => (
                  <Link href={`#${suggestion.url_slug}`} className={classes.noUnderline} key={index}>
                    <ListItem  button className={classes.suggestionOverviewItem}>
                      <ListItemIcon className={classes.suggestionsOverViewItemIcon}>
                        <Typography color="primary" className={classes.suggestionOverviewNumber}>
                          {index + 1}.
                        </Typography>
                      </ListItemIcon>
                      <Typography className={classes.suggestionOverviewName}>
                        {suggestion.name}
                      </Typography>
                    </ListItem>
                  </Link>
                ))}
              </List>
            </div>
            <div className={classes.resultsContainer}>
              {suggestions.map((suggestion, index) => (
                <ClimateMatchResult key={index} suggestion={suggestion} pos={index} />
              ))}
            </div>
          </Container>
        </div>
      )}
    </div>
  );
}

const getSuggestions = async (token, page) => {
  try {
    const resp = await apiRequest({
      method: "get",
      url: `/api/climatematch_results/?range_start=${page * 10}&range_end=${(page + 1) * 10}`,
      token: token,
    });
    console.log(resp.data);
    return resp.data;
  } catch (e) {
    console.log(e.response);
  }
};