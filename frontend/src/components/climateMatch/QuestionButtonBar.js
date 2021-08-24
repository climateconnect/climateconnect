import { Button, makeStyles } from "@material-ui/core"
import React from "react"
import LightBigButton from "../staticpages/LightBigButton"

const useStyles = makeStyles(theme => ({
  backButton: {
    height: 40,
    color: "white",
    borderColor: "white"
  },
  forwardButton: {
    height: 40,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    float: "right",
    fontSize: 14
  }
}))

export default function QuestionButtonBar() {
  const classes = useStyles()
  return (
    <div>
      <Button variant="outlined" className={classes.backButton}>back</Button>
      <LightBigButton className={classes.forwardButton}>forward</LightBigButton>
    </div>
  )
}