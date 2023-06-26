import React, { useContext } from "react"
import {
  TextField,
} from "@mui/material"
import getTexts from "../../../public/texts/texts"
import UserContext from "../context/UserContext"
import { makeStyles } from "@mui/styles"

const useStyles = makeStyles(theme => ({
  root: {
    marginBottom: theme.spacing(5),
    display:"flex",
    justifyContent: "center",
  },
  textField: {
    width: "100%",
    maxWidth: 800
  }, resize: {
    fontSize: 20,
  },
  input: {
    fontWeight: 600
  }
}))

export default function ProjectNameSection({projectData, handleSetProjectData}) {
  const { locale } = useContext(UserContext)
  const texts = getTexts({page: "project", locale: locale})
  const classes = useStyles()
  
  const onChangeName = (e) => {
    handleSetProjectData({
      name: e.target.value
    })
  }

  return (
    <div className={classes.root}>
      <TextField 
        label={texts.project_name} 
        className={classes.textField}
        required
        InputProps={{
          classes: {
            input: `${classes.resize} ${classes.input}`,
          }
        }}
        InputLabelProps={{
          classes: {
            root: classes.resize
          }
        }}
        value={projectData.name}
        onChange={onChangeName}
      />
    </div>
  )
}