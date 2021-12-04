import { Button, Container, makeStyles, useMediaQuery } from "@material-ui/core";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import SettingsBackupRestoreIcon from "@material-ui/icons/SettingsBackupRestore";
import Router from "next/router";
import React, { useContext, useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroller";
import Cookies from "universal-cookie";
import { apiRequest, getLocalePrefix } from "../../../public/lib/apiOperations";
import getTexts from "../../../public/texts/texts";
import ClimateMatchHeadline from "../climateMatch/ClimateMatchHeadline";
import UserContext from "../context/UserContext";
import LoadingSpinner from "../general/LoadingSpinner";
import ClimateMatchResult from "./ClimateMatchResult";
import ClimateMatchResultsOverviewBar from "./ClimateMatchResultsOverviewBar";

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
    marginTop: 0,
  },
  resultsContainer: {
    flexGrow: 1,
    borderLeft: "1px solid black",
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

  const [suggestions, setSuggestions] = useState({
    hasMore: true,
    matched_resources: [],
  });
  const [page, setPage] = useState(0);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const [fromHub, setFromHub] = useState(FALLBACK_HUB);
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "climatematch", locale: locale });
  const headerContainerRef = useRef(null);
  const screenIsSmallerThanMd = useMediaQuery((theme) => theme.breakpoints.down("md"));
  const screenIsSmallerThanSm = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  useEffect(async () => {
    try {
      setIsFetchingMore(true);
      if (!token && !climatematch_token) {
        return Router.push({
          pathname: "/climatematch",
          query: {
            message: texts.you_havent_done_the_climatematch,
          },
        });
      }
      const result = await getSuggestions({
        token: token,
        climatematch_token: climatematch_token,
        page: page,
        texts: texts,
        locale: locale,
      });
      setPage(page + 1);
      setFromHub(result.hub);
      setSuggestions({
        ...suggestions,
        matched_resources: result.matched_resources,
        hasMore: result.has_more,
      });
      setIsFetchingMore(false);
      setLoading(false);
    } catch (e) {
      console.log(e);
    }
  }, []);

  const loadMore = async () => {
    // Sometimes InfiniteScroll calls loadMore twice really fast. Therefore
    // to improve performance, we aim to guard against subsequent
    // fetches to the API by maintaining a local state flag.
    if (!isFetchingMore) {
      setIsFetchingMore(true);
      const newRessources = await getSuggestions({
        token: token,
        climatematch_token: climatematch_token,
        page: page,
        texts: texts,
        locale: locale,
      });
      setPage(page + 1);
      setSuggestions({
        ...suggestions,
        hasMore: newRessources.has_more,
        matched_resources: [...suggestions.matched_resources, ...newRessources.matched_resources],
      });
      setIsFetchingMore(false);
    }
  };

  return (
    <div className={classes.root}>
      {loading ? (
        <div className={classes.loadingOverlay}>
          <LoadingSpinner
            isLoading
            color="#fff"
            noMarginTop
            message={texts.calculating_your_results}
          />
        </div>
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
              <ClimateMatchResultsOverviewBar suggestions={suggestions?.matched_resources} />
            )}
            <InfiniteScroll
              className={classes.resultsContainer}
              component="div"
              container
              // We block subsequent invocations from InfinteScroll until we update local state
              hasMore={suggestions.hasMore && !isFetchingMore && !loading}
              loadMore={loadMore}
              pageStart={1}
              spacing={2}
            >
              {suggestions?.matched_resources?.map((suggestion, index) => (
                <ClimateMatchResult key={index} suggestion={suggestion} pos={index} />
              ))}
              {isFetchingMore && <LoadingSpinner isLoading key="project-previews-spinner" />}
            </InfiniteScroll>
          </Container>
        </div>
      )}
    </div>
  );
}

const getSuggestions = async ({ token, page, climatematch_token, locale }) => {
  try {
    const args = {
      method: "get",
      url: `/api/climatematch_results/?range_start=${page * 10}&range_end=${(page + 1) * 10}`,
      locale: locale,
    };
    if (token) {
      args.token = token;
    } else if (climatematch_token) {
      args.url += `&climatematch_token=${climatematch_token}`;
    }
    const resp = await apiRequest(args);
    return resp.data;
  } catch (e) {
    console.log(e.response);
  }
};
