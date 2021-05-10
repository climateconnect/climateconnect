import { Card, Link, makeStyles, Typography } from "@material-ui/core"
import AddIcon from '@material-ui/icons/Add'
import EmojiObjectsIcon from '@material-ui/icons/EmojiObjects'
import React, { useContext } from "react"
import getTexts from "../../../public/texts/texts"
import theme from "../../themes/theme"
import UserContext from "../context/UserContext"

const useStyles = makeStyles(theme => ({
  root: props => ({
    border: `3px solid ${props.borderColor}`,
    padding: theme.spacing(1.5),
    textAlign: "center",
    borderRadius: theme.spacing(2),
    background: "#F8F8F8",
    position: "relative"
  }),
  createCardHeadline: {
    fontWeight: 600,
    fontSize: 18
  },
  link: {
    textDecoration: "inherit",
    "&:hover": {
      textDecoration: "inherit",
    },
    cursor: "pointer"
  },
  plusIconContainer: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(4.5),
  },
  addIcon: {
    fontSize: 40,
    background: theme.palette.primary.main,
    color: "white",
    borderRadius: 20
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
    alignItems: "center"
  },
  ideaIcon: {
    fontSize: 23,
    marginTop: -3
  }
}))

//This component is currently only capable of displaying the "add new idea" card and not a real idea preview card
export default function IdeaPreview({idea, isCreateCard}) {
  const classes = useStyles({borderColor: isCreateCard && theme.palette.primary.light})
  const handleCardClick = (e) => {
    e.preventDefault()
  }
  return (
    <Link
      onClick={handleCardClick}
      className={classes.link}
    >
      <Card
        className={`${classes.root} ${isCreateCard}`}
        variant="outlined"
      >
        <CreateCardContent idea={idea}/>
      </Card>
    </Link>
  )
}

function CreateCardContent(idea) {
  const { locale } = useContext(UserContext)
  const classes = useStyles()
  console.log(idea)
  return (
    <div>
      <Typography color="primary" component="h2" className={classes.createCardHeadline}>
        {idea.idea.name}
      </Typography>
      <div className={classes.plusIconContainer}>
        <Typography color="primary" component="h4">{idea.idea.short_description}</Typography>
      </div>
    </div>
  )
}