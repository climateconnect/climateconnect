import { Card, CardMedia, Link, makeStyles, Typography } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import EmojiObjectsIcon from "@material-ui/icons/EmojiObjects";
import React, { useContext, useState } from "react";
import { getImageUrl } from "../../../public/lib/imageOperations";
import getTexts from "../../../public/texts/texts";
import theme from "../../themes/theme";
import UserContext from "../context/UserContext";
import CreateIdeaDialog from "./createIdea/CreateIdeaDialog";
import IdeaHubIcon from "./IdeaHubIcon";
import IdeaRatingIcon from "./IdeaRatingIcon";

const useStyles = makeStyles((theme) => ({
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
    boxShadow: "3px 3px 6px #00000029"    
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
}));

//This component is currently only capable of displaying the "add new idea" card and not a real idea preview card
export default function IdeaPreview({
  idea,
  isCreateCard,
  allHubs,
  userOrganizations,
  onClickIdea,
  index,
}) {
  const colors = [
    theme.palette.primary.main,
    theme.palette.primary.light,
    theme.palette.secondary.main,
    theme.palette.yellow.main,
  ];
  const color = isCreateCard ? theme.palette.primary.main : colors[(index + idea.name.length) % 4];
  const classes = useStyles({ borderColor: !isCreateCard && color });
  const [open, setOpen] = useState(false);
  const handleCardClick = (e) => {
    e.preventDefault();
    if (isCreateCard) {
      setOpen(true);
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
        href={`${window.location.origin}${window.location.pathname}?idea=${idea?.url_slug}${window.location.hash}`}
      >
        <Card
          className={classes.root}
          variant="outlined"        
        >
          {isCreateCard ? <CreateCardContent /> : <IdeaCardContent idea={idea} />}
        </Card>      
      </Link>
      {isCreateCard && (
        <CreateIdeaDialog
          open={open}
          onClose={onClose}
          allHubs={allHubs}
          userOrganizations={userOrganizations}
        />
      )}
    </>
  );
}

function CreateCardContent() {
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "idea", locale: locale });
  const classes = useStyles();
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
  const classes = useStyles();
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
          <Typography color="secondary" component="h4" className={classes.shortDescription}>
            {idea.idea.short_description}
          </Typography>
        ) : (
          <CardMedia title={idea.idea.url_slug} image={getImageUrl(idea.idea.image)}>
            <img
              src={getImageUrl(idea.idea.image)}
              alt={idea.idea.name}
              className={classes.placeholderImg}
            />
          </CardMedia>
        )}
      </div>
    </div>
  );
}
