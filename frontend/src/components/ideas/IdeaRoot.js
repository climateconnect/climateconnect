import { Button, Card, makeStyles, Tooltip, Typography, useMediaQuery } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import LocationOnIcon from "@material-ui/icons/LocationOn";
import React, { useContext, useEffect, useState } from "react";
import Cookies from "universal-cookie";
import { apiRequest } from "../../../public/lib/apiOperations";
import { getIdeaBorderColor } from "../../../public/lib/ideaOperations";
import { getImageUrl } from "../../../public/lib/imageOperations";
import getTexts from "../../../public/texts/texts";
import theme from "../../themes/theme";
import FeedbackContext from "../context/FeedbackContext";
import UserContext from "../context/UserContext";
import DateDisplay from "../general/DateDisplay";
import LoadingSpinner from "../general/LoadingSpinner";
import MiniOrganizationPreview from "../organization/MiniOrganizationPreview";
import MiniProfilePreview from "../profile/MiniProfilePreview";
import SocialMediaShareButton from "../shareContent/SocialMediaShareButton";
import EditIdeaRoot from "./editIdea/EditIdeaRoot";
import IdeaCommentsSection from "./IdeaCommentsSection";
import IdeaHubIcon from "./IdeaHubIcon";
import IdeaJoinButton from "./IdeaJoinButton";
import IdeaRatingSlider from "./IdeaRatingSlider";

const useStyles = makeStyles((theme) => ({
  root: (props) => ({
    borderColor: props.borderColor,
    borderWidth: 3,
    position: "absolute",
    left: 0,
    background: props.loading || props.isEditing ? "white" : "#E9E9E9",
    right: 0,
    top: props.offsetTop < 110 && props.offsetTop !== null ? 110 - props.offsetTop : 0,
    bottom: props.offsetTop < 110 ? props.offsetBottom + theme.spacing(1) : "default",
    overflowY: "auto",
    [theme.breakpoints.down("sm")]: {
      borderRadius: "30px 30px 0px 0px",
      borderWidth: 0,
      position: "relative",
    },
  }),
  contentWrapper: {
    padding: theme.spacing(1),
    background: "white",
    paddingBottom: theme.spacing(3),
    [theme.breakpoints.down("sm")]: {
      paddingTop: theme.spacing(0),
      paddingLeft: theme.spacing(3),
      paddingRight: theme.spacing(3),
    },
  },
  closeStyle: {
    cursor: "pointer",
  },
  ideaInfo: {
    marginLeft: theme.spacing(4),
    marginRight: theme.spacing(2.5),
    [theme.breakpoints.down("sm")]: {
      marginLeft: 0,
      marginRight: 0,
    },
  },
  name: {
    fontWeight: "bold",
    fontSize: 22,
  },
  topItem: {
    marginTop: theme.spacing(2),
  },
  location: {
    display: "flex",
    alignItems: "center",
  },
  locationText: {
    marginLeft: theme.spacing(0.5),
  },
  titleAndHubIconWrapper: {
    display: "flex",
    justifyContent: "space-between",
  },
  ideaHubIcon: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  ratingSlider: {
    height: 10,
  },
  loadingSpinner: {
    width: 40,
    height: 40,
  },
  loadingSpinnerContainer: {
    height: "50vh",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    padding: theme.spacing(1),
  },
  interactionsCounter: {
    fontWeight: 600,
  },
  buttonsContainer: {
    display: "flex",
    justifyContent: "space-between",
  },
  ideaImage: {
    width: "40%",
    float: "right",
    marginLeft: theme.spacing(1),
  },
  imageAndShortDescriptionWrapper: {
    marginTop: theme.spacing(2),
    overflow: "auto",
  },
  creatorProfilePreview: {
    display: "inline-block",
  },
  creatorAndCreatedAtWrapper: {
    display: "flex",
    alignItems: "center",
  },
  createdAtText: {
    marginLeft: theme.spacing(0.5),
    marginTop: -6,
  },
  by: {
    marginRight: theme.spacing(0.75),
    marginLeft: 0,
  },
}));

export default function IdeaRoot({
  idea,
  onIdeaClose,
  onRatingChange,
  handleAddComments,
  handleRemoveComment,
  containerOffsetTop,
  userOrganizations,
  allHubs,
  handleSetComments,
}) {
  const token = new Cookies().get("token");
  const borderColor = getIdeaBorderColor({ idea: idea, index: idea.index });
  const { user, notifications, setNotificationsRead, refreshNotifications } = useContext(
    UserContext
  );
  const { showFeedbackMessage } = useContext(FeedbackContext);
  const isMediumScreen = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isTinyScreen = useMediaQuery(theme.breakpoints.down("xs"));
  const handleIdeaClose = (e) => {
    onIdeaClose(e);
  };

  useEffect(() => {
    //This is executed when the component is about to unmount
    //Without this code, the ide would reopen itself when it finishes loading,
    //even if it has already been closed by the user
    return () => {
      onRatingChange = null;
      handleAddComments = null;
      handleRemoveComment = null;
    };
  }, []);

  const isNarrowScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [loading, setLoading] = useState(!!token);
  const [userRating, setUserRating] = useState({
    rating_score: 0,
    has_rated: idea.rating?.has_rated,
    //userRating updates live when users pull the heart. last_locked_rating_score only updates when they let go of the mouse
    last_locked_rating_score: 0,
  });
  const [hasJoinedIdea, setHasJoinedIdea] = useState({
    has_joined: false,
    chat_uuid: null,
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleClickEditIdea = (e) => {
    e.preventDefault();
    setIsEditing(true);
    window.history.pushState(
      {},
      "",
      `${window.location.origin}${window.location.pathname}?idea=${idea.url_slug}&edit=true${window.location.hash}`
    );
  };

  const classes = useStyles({
    offsetTop: containerOffsetTop?.screen,
    offsetBottom:
      containerOffsetTop?.screenBottom -
      containerOffsetTop?.pageBottom +
      containerOffsetTop?.screenBottom,
    loading: loading,
    isEditing: isEditing,
    borderColor: borderColor,
  });

  const setNotificationsReadAndRefresh = async (notification_to_set_read) => {
    await setNotificationsRead(token, notification_to_set_read, locale);
    await refreshNotifications();
  };

  useEffect(
    async function () {
      if (token) {
        setLoading(true);
        setIsEditing(false);
        const [userRating, comments, hasJoinedIdea] = await Promise.all([
          getUserRatingFromServer(idea, token, locale),
          getIdeaCommentsFromServer(idea, token, locale),
          getHasJoinedIdea(idea, token, locale),
        ]);
        //The user has closed the idea in the mean time!
        if (!idea) {
          return;
        }
        const all_comment_ids = comments.reduce(function (allComments, curComment) {
          allComments.push(curComment.id);
          if (curComment.replies?.length > 0) {
            allComments = [...allComments, ...curComment.replies.map((c) => c.id)];
          }
          return allComments;
        }, []);
        const notification_to_set_read = notifications.filter((n) =>
          all_comment_ids.includes(n.idea_comment?.id)
        );
        setUserRating &&
          setUserRating({ ...userRating, last_locked_rating_score: userRating?.rating_score });
        setHasJoinedIdea &&
          setHasJoinedIdea({
            has_joined: hasJoinedIdea?.has_joined,
            chat_uuid: hasJoinedIdea?.chat_uuid,
          });
        handleSetComments && handleSetComments(comments);
        setLoading(false);
        await setNotificationsReadAndRefresh(notification_to_set_read);
      }
    },
    [idea.url_slug]
  );

  const handleRatingChange = (event, newRating) => {
    event.preventDefault();
    setUserRating({ ...userRating, rating_score: newRating });
  };

  const handleRateProject = async (event, newRating) => {
    if (!user) {
      showFeedbackMessage({
        message: texts.please_sign_in_to_rate_an_idea,
        promptLogIn: true,
        newHash: window.location.hash,
        error: true,
      });
      return;
    }
    setUserRating({ ...userRating, has_rated: true, last_locked_rating_score: newRating });
    const payload = {
      rating: newRating,
    };
    try {
      const response = await apiRequest({
        method: "post",
        url: `/api/ideas/${idea.url_slug}/ratings/`,
        payload: payload,
        token: token,
        locale: locale,
      });
      onRatingChange(response.data.average_rating);
    } catch (err) {
      console.log(err);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    window.history.pushState(
      {},
      "",
      `${window.location.origin}${window.location.pathname}?idea=${idea.url_slug}${window.location.hash}`
    );
  };

  const handleAddComment = (comment) => handleAddComments([comment]);

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  const handleJoinIdea = (newHasJoinedIdeaObject) => {
    setHasJoinedIdea(newHasJoinedIdeaObject);
  };

  const ideaCreatorName = idea.user
    ? idea.user.first_name + " " + idea.user.last_name
    : idea.organization.name;

  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "idea", locale: locale, idea: idea, creator: ideaCreatorName });
  return (
    <Card variant="outlined" className={classes.root}>
      {loading ? (
        <div className={classes.contentWrapper}>
          <CloseIcon className={classes.closeStyle} onClick={handleIdeaClose} />
          <div className={classes.loadingSpinnerContainer}>
            <LoadingSpinner isLoading className={classes.loadingSpinner} />
          </div>
        </div>
      ) : isEditing ? (
        <EditIdeaRoot
          idea={idea}
          cancelEdit={cancelEdit}
          userOrganizations={userOrganizations}
          allHubs={allHubs}
        />
      ) : (
        <>
          <div className={classes.contentWrapper}>
            <CloseIcon className={classes.closeStyle} onClick={handleIdeaClose} />
            <div className={classes.ideaInfo}>
              <div className={classes.titleAndHubIconWrapper}>
                <Typography color="secondary" className={classes.name} component="h2">
                  {idea.name}
                </Typography>
                <IdeaHubIcon idea={idea} className={classes.ideaHubIcon} />
              </div>
              <div className={classes.imageAndShortDescriptionWrapper}>
                {idea.thumbnail_image && (
                  <img src={getImageUrl(idea.thumbnail_image)} className={classes.ideaImage} />
                )}
                <Typography variant="body1">{idea.short_description}</Typography>
              </div>
              <div className={`${classes.topItem} ${classes.creatorAndCreatedAtWrapper}`}>
                {isNarrowScreen && (
                  <Typography className={`${classes.createdAtText} ${classes.by}`}>
                    {capitalizeFirstLetter(texts.by)}
                  </Typography>
                )}
                {!idea.organization ? (
                  <MiniProfilePreview profile={idea.user} size="medium" />
                ) : (
                  <MiniOrganizationPreview organization={idea.organization} size="medium" />
                )}
                <Typography className={classes.createdAtText}>
                  {isNarrowScreen ? (
                    <>
                      {" "}
                      <DateDisplay date={new Date(idea?.created_at)} short />
                    </>
                  ) : (
                    texts.shared_this_idea_x_days_ago
                  )}
                </Typography>
              </div>
              <div className={`${classes.topItem} ${classes.location}`}>
                <Tooltip title={texts.location}>
                  <LocationOnIcon />
                </Tooltip>
                <Typography variant="body1" className={classes.locationText}>
                  {idea.location}
                </Typography>
              </div>
              <div className={classes.topItem}>
                <Typography className={classes.interactionsCounter}>
                  {texts.interactions} • {idea.rating?.number_of_ratings}
                </Typography>
              </div>
              <div className={classes.topItem}>
                <IdeaRatingSlider
                  value={userRating?.rating_score}
                  averageRating={idea.rating?.rating_score}
                  onChange={handleRatingChange}
                  onChangeCommitted={handleRateProject}
                  aria-labelledby="continuous-slider"
                  valueLabelDisplay="auto"
                  track={false}
                  className={classes.ratingSlider}
                />
              </div>
              <div className={`${classes.topItem} ${classes.buttonsContainer}`}>
                <IdeaJoinButton
                  idea={idea}
                  has_joined={hasJoinedIdea.has_joined}
                  chat_uuid={hasJoinedIdea.chat_uuid}
                  onJoinIdea={handleJoinIdea}
                />
                {user && idea?.user?.id === user?.id && (
                  <Button onClick={handleClickEditIdea} variant="contained" color="primary">
                    {isMediumScreen ? texts.edit : texts.edit_idea}
                  </Button>
                )}
                <SocialMediaShareButton
                  contentLinkPath={`${window.location.pathname}?idea=${idea.url_slug}${window.location.hash}`}
                  apiEndpoint={`/api/ideas/${idea.url_slug}/set_shared_idea/`}
                  locale={locale}
                  token={token}
                  messageTitle={`${texts.climate_protection_idea_from}${ideaCreatorName}: ${idea.name}`}
                  tinyScreen={isTinyScreen}
                  smallScreen={isSmallScreen}
                  mailBody={texts.share_idea_email_body}
                  texts={texts}
                  dialogTitle={texts.tell_others_about_this_idea}
                />
              </div>
            </div>
          </div>
          <div>
            <IdeaCommentsSection
              idea={idea}
              handleAddComment={handleAddComment}
              handleRemoveComment={handleRemoveComment}
            />
          </div>
        </>
      )}
    </Card>
  );
}

const getUserRatingFromServer = async (idea, token, locale) => {
  try {
    const response = await apiRequest({
      method: "get",
      url: `/api/ideas/${idea.url_slug}/my_rating/`,
      token: token,
      locale: locale,
    });
    return {
      rating_score: response.data.user_rating,
      has_rated: response.data.has_user_rated,
    };
  } catch (err) {
    console.log(err);
  }
};

const getIdeaCommentsFromServer = async (idea, token, locale) => {
  try {
    const response = await apiRequest({
      method: "get",
      url: `/api/ideas/${idea.url_slug}/comments/`,
      token: token,
      locale: locale,
    });
    return response.data.results;
  } catch (err) {
    console.log(err?.response);
  }
};

const getHasJoinedIdea = async (idea, token, locale) => {
  try {
    const response = await apiRequest({
      method: "get",
      url: `/api/ideas/${idea.url_slug}/have_i_joined/`,
      token: token,
      locale: locale,
    });
    return response.data;
  } catch (err) {
    console.log(err?.response);
  }
};
