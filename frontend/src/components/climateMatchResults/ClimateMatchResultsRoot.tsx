import { Button, Container, Theme, useMediaQuery } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import SettingsBackupRestoreIcon from "@mui/icons-material/SettingsBackupRestore";
import Router from "next/router";
import React, { useContext, useEffect, useRef, useState } from "react";
import Cookies from "universal-cookie";
import { apiRequest, getLocalePrefix } from "../../../public/lib/apiOperations";
import getTexts from "../../../public/texts/texts";
import ClimateMatchHeadline from "../climateMatch/ClimateMatchHeadline";
import UserContext from "../context/UserContext";
import LoadingSpinner from "../general/LoadingSpinner";
import ClimateMatchResult from "./ClimateMatchResult";
import ClimateMatchResultsOverviewBar from "./ClimateMatchResultsOverviewBar";
import { getParams } from "../../../public/lib/generalOperations";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";

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
  root: {
    position: "relative",
    width: "100%",
    minHeight: "100vh",
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
    justifyContent: "center",
  },
}));

//TODO: Replace by locationhub select as first step of climatematch if no hub is passed
const FALLBACK_HUB = "test";

export default function ClimateMatchResultsRoot() {
  const cookies = new Cookies();
  const token = cookies.get("auth_token");
  const climatematch_token = cookies.get("climatematch_token");
  const [loading, setLoading] = useState(true);
  const classes = useStyles({ loading: loading });

  const [suggestions, setSuggestions] = useState<any>({
    hasMore: true,
    matched_resources: [],
  });
  const [page, setPage] = useState(0);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const [fromHub, setFromHub] = useState<any>(FALLBACK_HUB);
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "climatematch", locale: locale });
  const headerContainerRef = useRef(null);
  const screenIsSmallerThanMd = useMediaQuery<Theme>((theme) => theme.breakpoints.down("lg"));
  const screenIsSmallerThanSm = useMediaQuery<Theme>((theme) => theme.breakpoints.down("md"));
  useEffect(() => {
    (async () => {
      try {
        setIsFetchingMore(true);
        const params = getParams(window.location.href);
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
          //TODO(unused) texts: texts,
          locale: locale,
          hubUrl: params.from_hub ? params.from_hub : fromHub,
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
    })();
  }, []);
  const loadMore = async () => {
    setIsFetchingMore(true);
    const newRessources = await getSuggestions({
      token: token,
      climatematch_token: climatematch_token,
      page: page,
      locale: locale,
      hubUrl: fromHub,
    });
    setPage(page + 1);
    setSuggestions({
      ...suggestions,
      hasMore: newRessources.has_more,
      matched_resources: [...suggestions.matched_resources, ...newRessources.matched_resources],
    });
    setIsFetchingMore(false);
  };

  const loadMoreRef = useInfiniteScroll({
    hasMore: suggestions.hasMore,
    isLoading: isFetchingMore || loading,
    onLoadMore: loadMore,
  });

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
                href={`${getLocalePrefix(locale)}/hubs/${fromHub?.url_slug}/browse`}
              >
                <ArrowBackIosIcon className={classes.backIcon} />
                {texts.climatehub} {fromHub?.name}
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
            <div className={classes.resultsContainer}>
              {suggestions?.matched_resources?.map((suggestion, index) => (
                <ClimateMatchResult key={index} suggestion={suggestion} pos={index} />
              ))}
              {isFetchingMore && <LoadingSpinner isLoading key="project-previews-spinner" />}
              <div ref={loadMoreRef} style={{ height: "1px" }} />
            </div>
          </Container>
        </div>
      )}
    </div>
  );
}

const getSuggestions = async ({ token, page, climatematch_token, locale, hubUrl }) => {
  try {
    const hubParameter = hubUrl ? `&hub=${hubUrl}` : "";
    const url = `/api/climatematch_results/?range_start=${page * 10}&range_end=${
      (page + 1) * 10
    }${hubParameter}`;
    const args: any = {
      method: "get",
      url: url,
      locale: locale,
    };
    if (token) {
      args.token = token;
    } else if (climatematch_token) {
      args.url += `&climatematch_token=${climatematch_token}`;
    }
    const resp = await apiRequest(args);
    return resp.data;
  } catch (e: any) {
    console.log(e.response);
  }
};
