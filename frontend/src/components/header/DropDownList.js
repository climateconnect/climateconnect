import { Link, makeStyles, MenuItem, MenuList, Paper, Popper } from "@material-ui/core";
import React, { useContext } from "react";
import { getLocalePrefix } from "../../../public/lib/apiOperations";
import UserContext from "../context/UserContext";

const useStyles = makeStyles((theme) => ({
  cityHubOption: {
    textAlign: "center",
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    fontWeight: 600,
    width: "100%",
    display: "flex",
    justifyContent: "center",
  },
  popper: {
    zIndex: 25,
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
}) {
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
              href={`${getLocalePrefix(locale)}${item.href}`}
              onClick={loadOnClick && handleClickLink}
            >
              <MenuItem component="button" className={classes.cityHubOption}>
                {item.text}
              </MenuItem>
            </Link>
          ))}
        </MenuList>
      </Paper>
    </Popper>
  );
}
