import { Card, CardMedia, Link, Typography, Tooltip, Theme } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import AddIcon from "@mui/icons-material/Add";
import EmojiObjectsIcon from "@mui/icons-material/EmojiObjects";
import React, { useContext, useState } from "react";
import { getIdeaBorderColor } from "../../../public/lib/ideaOperations";
import { getImageUrl } from "../../../public/lib/imageOperations";
import getTexts from "../../../public/texts/texts";
import FeedbackContext from "../context/FeedbackContext";
import UserContext from "../context/UserContext";
import CreateIdeaDialog from "./createIdea/CreateIdeaDialog";
import IdeaHubIcon from "./IdeaHubIcon";
import IdeaRatingIcon from "./IdeaRatingIcon";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ModeCommentIcon from "@mui/icons-material/ModeComment";
import { buildHubUrl } from "../../../public/lib/urlBuilder";

const useStyles = makeStyles<Theme, { borderColor?: any }>((theme) => ({
  noUnderline: {
    textDecoration: "inherit",
    "&:hover": {
      textDecoration: "inherit",
    },
  },
  root: (props) => ({
    border: `3px solid ${props.borderColor}`,
    textAlign: "center",
    borderRadius: theme.spacing(2),
    background: "#F8F8F8",
    position: "relative",
    cursor: "pointer",
    boxShadow: "3px 3px 6px #00000029",
  }),
  createCardHeadline: {
    fontWeight: 600,
    fontSize: 18,
  },
  link: {
    textDecoration: "inherit",
    "&:hover": {
      textDecoration: "inherit",
    },
    cursor: "pointer",
  },
  plusIconContainer: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(6.5),
  },
  addIcon: {
    fontSize: 40,
    background: theme.palette.primary.main,
    color: "white",
    borderRadius: 20,
  },
  shareIdeaBottomSection: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    background: theme.palette.primary.main,
    color: "white",
    fontSize: 20,
    fontWeight: 600,
    paddingTop: theme.spacing(0.75),
    paddingBottom: theme.spacing(0.75),
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  ideaIcon: {
    fontSize: 23,
    marginTop: -3,
  },
  ratingIcon: {
    width: "50px",
    height: "50px",
    opacity: 1,
  },
  placeholderImg: {
    visibility: "hidden",
    width: "100%",
  },
  topSection: {
    padding: theme.spacing(1),
  },
  categoryAndRatingWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: theme.spacing(1),
  },
  shortDescription: {
    padding: theme.spacing(0.5),
  },
  imgAdditionalInfoContainer: {
    borderRadius: theme.spacing(2),
    backgroundColor: "white",
    bottom: 8,
    left: "50%",
    transform: "translate(-50%)",
    position: "absolute",
    display: "inline-flex",
    padding: theme.spacing(0.5),
  },
  noImgAdditionalInfoContainer: {
    display: "inline-flex",
    marginTop: theme.spacing(0.75),
    marginBottom: theme.spacing(0.75),
  },
  additionalInfoCounter: {
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(1),
    fontSize: 16,
  },
  additionalInfoIcon: {
    marginLeft: theme.spacing(1),
  },
}));

//This component is currently only capable of displaying the "add new idea" card and not a real idea preview card
export default function IdeaPreview({
  allHubs,
  hubData,
  hubLocation,
  idea,
  index,
  isCreateCard,
  onClickIdea,
  resetTabsWhereFiltersWereApplied,
  sendToIdeaPageOnClick,
  userOrganizations,
}) {
  const { user, locale } = useContext(UserContext);
  const texts = getTexts({ page: "idea", locale: locale });
  const { showFeedbackMessage } = useContext(FeedbackContext);
  const color = getIdeaBorderColor({ idea: idea, index: index, isCreateCard: isCreateCard });
  const classes = useStyles({ borderColor: !isCreateCard && color });
  const [open, setOpen] = useState(false);

  const handleCardClick = (e) => {
    if (sendToIdeaPageOnClick) return;
    e.preventDefault();
    if (isCreateCard) {
      if (!user) {
        showFeedbackMessage({
          message: texts.sign_up_or_log_in_to_share_an_idea,
          promptLogIn: true,
          error: true,
        });
      } else {
        setOpen(true);
      }
    } else {
      onClickIdea(idea);
    }
  };

  const onClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Link
        className={classes.noUnderline}
        onClick={handleCardClick}
        href={
          sendToIdeaPageOnClick
            ? buildHubUrl({
                hubUrlSlug: idea?.hub_shared_in?.url_slug,
                queryParams: `idea=${idea?.url_slug}`,
                hash: "ideas",
                pathType: "hubBrowse",
                includeBaseUrl: true,
              })
            : // `${process.env.BASE_URL}/hubs/${idea?.hub_shared_in?.url_slug}?idea=${idea?.url_slug}#ideas`
              `${window.location.origin}${window.location.pathname}?idea=${idea?.url_slug}${window.location.hash}`
        }
        underline="hover"
      >
        <Card className={classes.root} variant="outlined">
          {isCreateCard ? <CreateCardContent /> : <IdeaCardContent idea={idea} />}
        </Card>
      </Link>
      {isCreateCard && (
        <CreateIdeaDialog
          allHubs={allHubs}
          hubData={hubData}
          hubLocation={hubLocation}
          onClose={onClose}
          open={open}
          resetTabsWhereFiltersWereApplied={resetTabsWhereFiltersWereApplied}
          userOrganizations={userOrganizations}
        />
      )}
    </>
  );
}

function CreateCardContent() {
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "idea", locale: locale });
  const classes = useStyles({});
  return (
    <div>
      <div className={classes.topSection}>
        <Typography color="primary" component="h2" className={classes.createCardHeadline}>
          {texts.share_your_idea_and_find_the_right_collaborators}
        </Typography>
        <div className={classes.plusIconContainer}>
          <AddIcon className={classes.addIcon} />
        </div>
      </div>
      <div className={classes.shareIdeaBottomSection}>
        <EmojiObjectsIcon className={classes.ideaIcon} />
        {texts.share_idea}
      </div>
    </div>
  );
}

function IdeaCardContent(idea) {
  const classes = useStyles({});

  return (
    <div>
      <div className={classes.topSection}>
        <Typography color="secondary" component="h2" className={classes.createCardHeadline}>
          {idea.idea.name}
        </Typography>
        <div className={classes.categoryAndRatingWrapper}>
          {idea.idea.hub && <IdeaHubIcon idea={idea.idea} />}
          <IdeaRatingIcon
            rating={idea.idea.rating.rating_score}
            number_of_ratings={idea.idea.rating.number_of_ratings}
          />
        </div>
      </div>
      <div>
        {idea.idea.image === undefined || idea.idea.image === null ? (
          <>
            <Typography color="secondary" component="h4" className={classes.shortDescription}>
              {idea.idea.short_description?.length > 200
                ? idea.idea.short_description.slice(0, 200) + "..."
                : idea.idea.short_description}
            </Typography>
            {(idea.idea.number_of_comments > 0 || idea.idea.number_of_participants > 0) && (
              <AdditionalInfoIdeaCardPreview
                containerName={classes.noImgAdditionalInfoContainer}
                commentCount={idea.idea.number_of_comments}
                participationCount={idea.idea.number_of_participants}
              />
            )}
          </>
        ) : (
          <CardMedia title={idea.idea.url_slug} image={getImageUrl(idea.idea.image)}>
            <img
              src={getImageUrl(idea.idea.image)}
              alt={idea.idea.name}
              className={classes.placeholderImg}
            />
            {(idea.idea.rating?.number_of_ratings > 0 || idea.idea.number_of_participants > 0) && (
              <AdditionalInfoIdeaCardPreview
                containerName={classes.imgAdditionalInfoContainer}
                commentCount={idea.idea.number_of_comments}
                participationCount={idea.idea.number_of_participants}
              />
            )}
          </CardMedia>
        )}
      </div>
    </div>
  );
}

function AdditionalInfoIdeaCardPreview({ containerName, commentCount, participationCount }) {
  const classes = useStyles({});
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "general", locale: locale });
  return (
    <>
      <div className={containerName}>
        {commentCount > 0 && (
          <>
            <Tooltip arrow title={texts.comments}>
              <ModeCommentIcon className={classes.additionalInfoIcon} color="primary" />
            </Tooltip>
            <span className={classes.additionalInfoCounter}> {commentCount} </span>
          </>
        )}
        {participationCount > 0 && (
          <>
            <Tooltip arrow title={texts.participants}>
              <PersonAddIcon className={classes.additionalInfoIcon} color="primary" />
            </Tooltip>
            <span className={classes.additionalInfoCounter}> {participationCount} </span>
          </>
        )}
      </div>
    </>
  );
}
