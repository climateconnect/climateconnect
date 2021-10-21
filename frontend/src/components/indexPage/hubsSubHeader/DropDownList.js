import { Link, makeStyles, MenuItem, MenuList, Paper, Popper } from "@material-ui/core";
import React, { useContext } from "react";
import { getLocalePrefix } from "../../../../public/lib/apiOperations";
import UserContext from "../../context/UserContext";

const useStyles = makeStyles(theme => ({
  cityHubOption: {
    textAlign: "center",
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    fontWeight: 600,
    width: "100%",
    display: "flex",
    justifyContent: "center",
  }
}))

export default function DropDownList({ buttonRef, handleOpen, handleClose, hubs, open }){
  const classes = useStyles();
  const { locale, startLoading } = useContext(UserContext);
  const handleClickLink = () => {
    startLoading();
  };

  return (
    <Popper open={open} anchorEl={buttonRef.current}>
      <Paper onMouseEnter={handleOpen} onMouseLeave={handleClose}>
        <MenuList>
          {hubs?.map((h) => (
            <Link
              key={h.url_slug}
              href={`${getLocalePrefix(locale)}/hubs/${h.url_slug}/`}
              onClick={handleClickLink}
            >
              <MenuItem component="button" className={classes.cityHubOption}>
                {h.name}
              </MenuItem>
            </Link>
          ))}
        </MenuList>
      </Paper>
    </Popper>
  );
}