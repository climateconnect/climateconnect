import {
  Button,
  Container,
  Link,
  List,
  ListItem,
  ListItemIcon,
  makeStyles,
  Typography,
  useMediaQuery,
} from "@material-ui/core";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import SettingsBackupRestoreIcon from "@material-ui/icons/SettingsBackupRestore";
import { Router } from "next/router";
import React, { useContext, useEffect, useRef, useState } from "react";
import Cookies from "universal-cookie";
import { apiRequest, getLocalePrefix } from "../../../public/lib/apiOperations";
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
    minWidth: 230,
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
    color: "inherit",
  },
  backButton: {
    color: "white",
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  backIcon: {
    fontSize: 18,
  },
  backButtonsContainer: {
    display: "flex",
    justifyContent: "space-between",
  },
}));

//TODO: Replace by locationhub select as first step of climatematch if no hub is passed
const FALLBACK_HUB = "test";

export default function ClimateMatchResultsRoot() {
  const classes = useStyles();
  const cookies = new Cookies();
  const token = cookies.get("token");
  const climatematch_token = cookies.get("climatematch_token");
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [page, setPage] = useState(0);
  const [fromHub, setFromHub] = useState(FALLBACK_HUB);
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "climatematch", locale: locale });
  const headerContainerRef = useRef(null);
  const screenIsSmallerThanMd = useMediaQuery((theme) => theme.breakpoints.down("md"));
  const screenIsSmallerThanSm = useMediaQuery((theme) => theme.breakpoints.down("sm"));

  useEffect(async () => {
    const suggestions = await getSuggestions({
      token: token,
      climatematch_token: climatematch_token,
      page: page,
      texts: texts,
    });
    setFromHub(suggestions.hub);
    setSuggestions(suggestions.matched_resources);
    setLoading(false);
  }, []);
  return (
    <div className={classes.root}>
      {loading ? (
        <LoadingContainer />
      ) : (
        <div>
          <div className={classes.headerContainer} ref={headerContainerRef}>
            <div className={classes.backButtonsContainer}>
              <Button
                className={classes.backButton}
                href={`${getLocalePrefix(locale)}/hubs/${fromHub?.url_slug}`}
              >
                <ArrowBackIosIcon className={classes.backIcon} />
                {texts.cityhub} {fromHub?.name}
              </Button>
              <Button
                className={classes.backButton}
                href={`${getLocalePrefix(locale)}/climatematch?from_hub=${fromHub?.url_slug}`}
              >
                <SettingsBackupRestoreIcon />
                {texts.restart}
              </Button>
            </div>
            <ClimateMatchHeadline size={screenIsSmallerThanSm && "small"}>
              {texts.suggestions_for_you}
            </ClimateMatchHeadline>
          </div>
          <Container maxWidth="xl" className={classes.contentContainer} disableGutters>
            {!screenIsSmallerThanMd && (
              <div>
                <List className={classes.suggestionsOverviewContainer}>
                  {suggestions?.map((suggestion, index) => (
                    <Link
                      href={`#${suggestion.url_slug}`}
                      className={classes.noUnderline}
                      key={index}
                    >
                      <ListItem button className={classes.suggestionOverviewItem}>
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
            )}
            <div className={classes.resultsContainer}>
              {suggestions?.map((suggestion, index) => (
                <ClimateMatchResult key={index} suggestion={suggestion} pos={index} />
              ))}
            </div>
          </Container>
        </div>
      )}
    </div>
  );
}

const getSuggestions = async ({ texts, token, page, climatematch_token }) => {
  try {
    const args = {
      method: "get",
      url: `/api/climatematch_results/?range_start=${page * 10}&range_end=${(page + 1) * 10}`,
    };
    if (token) {
      args.token = token;
    } else if (climatematch_token) {
      args.url += `&climatematch_token=${climatematch_token}`;
    } else {
      Router.push({
        pathname: "/climatemath",
        query: {
          message: texts.you_havent_done_the_climatematch,
        },
      });
    }
    const resp = await apiRequest(args);
    return resp.data;
  } catch (e) {
    console.log(e.response);
  }
};
