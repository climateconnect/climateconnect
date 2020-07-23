import React from "react"
import { makeStyles } from "@material-ui/core/styles";
import { Typography, Checkbox, Container, Button } from "@material-ui/core";
import Cookies from "universal-cookie";

const useStyles = makeStyles(theme => {
  return {
    root: {
      position: "fixed",
      bottom: 0,
      left: 0,
      width: "100%",
      height: 150,
      background: "white",
      borderTop: `1px solid ${theme.palette.secondary.main}`,
      paddingTop: theme.spacing(1)
    },
    headline: {
      fontWeight: "bold",
      marginBottom: theme.spacing(1)
    },
    buttons: {
      float: "right"
    },
    leftButton: {
      marginRight: theme.spacing(1)
    }
  }
})

export default function CookieBanner() {
  const classes = useStyles()
  const [checked, setChecked] = React.useState({necessary: true, statistics: false})
  const cookies = new Cookies(); 
  
  const onStatisticsChange = () => {
    setChecked({...checked, statistics: !checked.statistics})
  }

  const confirmSelection = () => {
    console.log('setting selection cookies')
    cookies.set(
      "acceptedNecessary", 
      true,
      { path: "/", sameSite: true }
    )
  }

  const enableAll = () => {
    console.log('setting cookies')
    cookies.set(
      "acceptedNecessary", 
      true,
      { path: "/", sameSite: true }
    )
    cookies.set(
      "acceptedStatistics", 
      true,
      { path: "/", sameSite: true }
    )
  }

  return (
    <div className={classes.root}>
      <Container maxWidth="lg">
        <Typography variant="h6" color="secondary" className={classes.headline}>Cookie information and settings</Typography>
        <Typography variant="body2">We use cookies in order to offer you an optimal service and to further improve our websites on the basis of statistics.</Typography>
        <Typography variant="body2">For more information check out our <a href="privacy" target="_blank">privacy policy</a> and <a href="terms" target="_blank">terms of use</a></Typography>
        <Checkbox defaultChecked checked={checked.necessary} disabled color="primary"/>Necessary
        <Checkbox color="primary" checked={checked.statistics} onChange={onStatisticsChange}/>Statistics
        <span className={classes.buttons}>
        <Button variant="contained" className={classes.leftButton} onClick={confirmSelection}>
          Confirm Selection
        </Button>
        <Button color="primary" variant="contained" onClick={enableAll}>
          Enable all cookies
        </Button>
        </span>
      </Container>
    </div>
  )


}