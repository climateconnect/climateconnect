import { makeStyles, useMediaQuery } from "@material-ui/core"
import React, { useEffect, useState } from "react"
import IdeaPreviews from "./IdeaPreviews"
import IdeaRoot from "./IdeaRoot"

const useStyles = makeStyles(({
  root: props => ({
    display: props.ideaOpen ? "flex" : "default",
    flex: "1 1 0px"
  }),
  idea: {
    flex: "1 1 0px"
  },
  ideaPreviews: {
    flex: "1 1 0px"
  }
}))
export default function IdeasBoard({
  hasMore,
  loadFunc,
  ideas,
  allHubs,
  userOrganizations,
  onUpdateIdeaRating
}) {  
  const [idea, setIdea] = useState(null)
  const classes = useStyles({ideaOpen: idea !== null})
  const isNarrowScreen = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  
  useEffect(function(){
    if(idea && ideas.filter(i=>i.url_slug === idea.url_slug).length === 1) {
      setIdea(ideas.filter(i=>i.url_slug === idea.url_slug)[0])
    }
  }, [ideas])

  const onClickIdea = async (idea) => {
    //catch idea from api
    //then setIdea(idea)
    setIdea(idea);
  }

  const onClose = () => {
    setIdea(null);
  }

  const handleUpdateRating = (newRating) => {
    onUpdateIdeaRating(idea, newRating)
  }

  return (
    <div className={classes.root}>
      <IdeaPreviews
        hasMore={hasMore}
        loadFunc={loadFunc}
        parentHandlesGridItems
        ideas={ideas}
        allHubs={allHubs}
        userOrganizations={userOrganizations}
        onClickIdea={onClickIdea}
        hasIdeaOpen={!!idea}
        className={classes.ideaPreviews}
      />
      {
        idea && !isNarrowScreen && (
          <div className={classes.idea}>
            <IdeaRoot idea={idea} onIdeaClose={onClose} onRatingChange={handleUpdateRating}/>
          </div>
        )
      }
      {
        idea && isNarrowScreen && (
          /* display mobile idea */
          <IdeaRoot idea={idea} onIdeaClose={onClose} onRatingChange={handleUpdateRating}/>
        )
      }
    </div>
  )
}