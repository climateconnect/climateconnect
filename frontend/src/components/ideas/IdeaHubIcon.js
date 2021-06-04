import { makeStyles, Tooltip } from "@material-ui/core"
import React from "react"

const useStyles = makeStyles(theme => ({
  hubIcon: {
    color: theme.palette.primary.main,
    fill: theme.palette.primary.main,
    marginRight: theme.spacing(1.5)
  },
}))

export default function IdeaHubIcon({idea, className}) {
  const classes = useStyles()
  console.log(idea.hub)
  return (
    <Tooltip>
      <img src={idea.hub.icon} className={`${classes.hubIcon} ${className}`} />
    </Tooltip>
  )
}