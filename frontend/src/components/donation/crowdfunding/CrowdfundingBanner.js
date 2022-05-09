import { Button, Container, Link, makeStyles, useMediaQuery } from "@material-ui/core"
import React from "react"
import theme from "../../../themes/theme"

const useStyles = makeStyles(theme => ({
  link: {
    ["&:hover"]: {
      textDecoration: "inherit"
    }
  },
  root: {
    background: "#5dd382",
    height: 58,
    width: "100%",
    zIndex: -1
  },
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: 58,
    [theme.breakpoints.down("sm")]: {
      justifyContent: "flex-start"
    }
  },
  logo: {
    width: 98,
  },
  text: {
    color: "white",
    fontWeight: 600,
    fontSize: 16,
    textAlign: "center",
    maxWidth: 500,
    [theme.breakpoints.down("xs")]: {
      fontSize: 14
    }    
  }
}))

export default function CrowdfundingBanner({}) {
  const classes = useStyles()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"))
  return (
    <Link href="https://www.startnext.com/climatehubs" className={classes.link}>
      <div className={classes.root}>
        <Container className={classes.container}>
          <div>
            <img src="/images/startnext_logo.svg"  className={classes.logo}/>
          </div>
          <div className={classes.text}>
            Unterstütze unser Crowdfunding, ClimateHubs in ganz Deutschland aufzubauen.
          </div>
          {!isSmallScreen && (
            <div>
              <Button variant="contained" color="primary">Jetzt unterstützen</Button>
            </div>
          )}
        </Container>      
      </div>
    </Link>
  )
}