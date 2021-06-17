import { Button, Container, Link, makeStyles, MenuItem, MenuList, Paper, Popper, useMediaQuery } from "@material-ui/core";
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import React, { useContext, useRef, useState } from "react";
import { getLocalePrefix } from "../../../public/lib/apiOperations";
import getTexts from "../../../public/texts/texts";
import theme from "../../themes/theme";
import UserContext from "../context/UserContext";

const useStyles = makeStyles((theme) => ({
  root: {
    background: theme.palette.primary.main,    
  },
  link: {
    color: "white",
    display: "inline-block",
    fontWeight: 600,
    marginRight: theme.spacing(2),
    marginLeft: theme.spacing(2),
    fontSize: 16,
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  container: {
    display: "flex",
    justifyContent: "flex-end",
    [theme.breakpoints.down("xs")]: {
      justifyContent: "center",
    },
  },
  viewHubsButton: {
    background: "white",
  },
  popover: {
    pointerEvents: "none",
  },
  popoverContent: {
    pointerEvents: "auto",
  },
  cityHubOption: {
    textAlign: "center",
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    fontWeight: 600,
    width: "100%",
    display: "flex",
    justifyContent: "center"
  },
  hubsDropDownButton: {
    textTransform: "none",
    color: "white",
    fontSize: 16,
    height: 54,
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
}));

export default function HubsSubHeader({ hubs, subHeaderRef }) {
  const classes = useStyles();
  const isNarrowScreen = useMediaQuery(theme.breakpoints.down("xs"));  
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "navigation", locale: locale });
  return (
    <div className={classes.root} ref={subHeaderRef}>
      <Container className={classes.container}>
        {isNarrowScreen ? (
          <Button
            className={classes.viewHubsButton}
            variant="contained"
            href={`${getLocalePrefix(locale)}/hubs/`}
          >
            {texts.view_sector_hubs}
          </Button>
        ) : (
          <Link className={classes.link} key={"/hubs"} href={`${getLocalePrefix(locale)}/hubs/`}>
            {texts.all_hubs}
          </Link>
        )}
        {hubs &&
          !isNarrowScreen &&
          <HubLinks hubs={hubs} locale={locale}/>
        }
      </Container>
    </div>
  );
}

function HubLinks({hubs, locale}) {
  const classes = useStyles()        
  
  const sectorHubs = hubs.filter(h => h.hub_type === "sector hub")
  const locationHubs = hubs.filter(h => h.hub_type === "location hub")
  const isMediumScreen = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <>
      {!isMediumScreen && sectorHubs.slice(0,3).map((hub) => (
        <Link
          className={classes.link}
          key={hub.url_slug}
          href={`${getLocalePrefix(locale)}/hubs/${hub.url_slug}`}
        >
          {hub.name}
        </Link>
      ))}
      {sectorHubs?.length > 3 && (
        <HubsDropDown 
          hubs={sectorHubs}
          label="SectorHubs"
        />
      )}
      {
        locationHubs?.length > 0 && (
          <HubsDropDown 
            hubs={locationHubs}
            label="CityHubs"
          />
        )
      }
    </>
  )
}

const HubsDropDown = ({hubs, label}) => {
  const classes = useStyles()
  const buttonRef = useRef(null)
  const [open, setOpen] = useState(false)

  const handleOpen = (e) => {
    e.preventDefault()
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  
  return (
    <>
      <Button 
        onClick={handleOpen} 
        onMouseEnter={handleOpen}
        onMouseLeave={handleClose}
        aria-haspopup="true"
        ref={buttonRef}
        className={classes.hubsDropDownButton}
      >
        {label}
        <ArrowDropDownIcon />        
      </Button>
      <DropDownList 
        buttonRef={buttonRef}
        handleOpen={handleOpen}
        hubs={hubs}
        handleClose={handleClose}
        open={open}
      />
    </>
  )
}

const DropDownList = ({buttonRef, handleOpen, handleClose, hubs, open}) => {
  const classes = useStyles()
  const { locale, startLoading } = useContext(UserContext)
  const handleClickLink = () => {
    startLoading()
  }
  
  return (
    <Popper
      open={open}
      anchorEl={buttonRef.current}
    >
      <Paper 
        onMouseEnter={handleOpen}
        onMouseLeave={handleClose}
        className={classes.menu}
      >
        <MenuList>
          {hubs?.map(h => (
            <Link key={h.url_slug} href={`${getLocalePrefix(locale)}/hubs/${h.url_slug}/`} onClick={handleClickLink}>
              <MenuItem
                component="button"
                className={classes.cityHubOption}              
              >
                {h.name}
              </MenuItem>
            </Link>
          ))}            
        </MenuList>
      </Paper>
    </Popper>
  )
}