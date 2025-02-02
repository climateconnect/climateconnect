import { Link, MenuItem, MenuList, Paper, Popper } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import { getLocalePrefix } from "../../../public/lib/apiOperations";
import UserContext from "../context/UserContext";
import { getStaticLinkFromItem } from "../../../public/lib/headerLink";

const useStyles = makeStyles((theme) => ({
  climateHubOption: {
    textAlign: "center",
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    fontWeight: 600,
    width: "100%",
    display: "flex",
    justifyContent: "center",
    color: theme.palette.background.default_contrastText,
  },
  popper: {
    zIndex: 25,
  },
  hoverBorderColor: {
    "&:hover": {
      color: theme.palette.background.default_contrastText,
    },
  },
}));

export default function DropDownList({
  buttonRef,
  handleOpen,
  handleClose,
  items,
  open,
  loadOnClick,
  popperRef,
  target,
}: any) {
  const classes = useStyles();
  const { locale, startLoading } = useContext(UserContext);
  const handleClickLink = () => {
    startLoading();
  };

  return (
    <Popper open={open} anchorEl={buttonRef.current} className={classes.popper}>
      <Paper ref={popperRef} onMouseEnter={handleOpen} onMouseLeave={handleClose}>
        <MenuList>
          {items?.map((item, index) => (
            <Link
              key={index}
              href={getStaticLinkFromItem(locale, item)} // add isExternalLink
              onClick={loadOnClick && handleClickLink}
              underline="hover"
              className={classes.hoverBorderColor}
              target={item.target || "_self"}
            >
              <MenuItem component="button" className={classes.climateHubOption}>
                {item.text}
              </MenuItem>
            </Link>
          ))}
        </MenuList>
      </Paper>
    </Popper>
  );
}
