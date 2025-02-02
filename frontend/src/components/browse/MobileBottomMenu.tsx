import React from "react";
import EmojiObjectsIcon from "@mui/icons-material/EmojiObjects";
import { Tab, Tabs } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import ContactAmbassadorButton from "../hub/ContactAmbassadorButton";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import GroupIcon from "@mui/icons-material/Group";
import DateRangeRoundedIcon from "@mui/icons-material/DateRangeRounded";
import { Theme } from "@mui/material/styles";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    background: "#f0f2f5",
  },
  tabs: {
    "& .MuiTabs-indicator": {
      backgroundColor: theme.palette.background.default_contrastText,
    },
  },
  tab: {
    color: theme.palette.background.default_contrastText,
  },
}));

export default function MobileBottomMenu({
  tabValue,
  handleTabChange,
  TYPES_BY_TAB_VALUE,
  organizationsTabRef,
  hubAmbassador,
}) {
  const type_icons = {
    projects: AssignmentIcon,
    organizations: GroupIcon,
    events: DateRangeRoundedIcon, // TODO: after updating material-icon to v5+, replace with "CalendarMonthRoundedIcon"
    members: AccountCircleIcon,
    ideas: EmojiObjectsIcon,
  };
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <ContactAmbassadorButton mobile hubAmbassador={hubAmbassador} />
      <>
        <Tabs
          variant="fullWidth"
          value={tabValue}
          onChange={handleTabChange}
          className={classes.tabs}
          centered={true}
        >
          {TYPES_BY_TAB_VALUE.map((t, index) => {
            const tabProps: any = {
              //TODO(unused)  className: classes.tab,
            };
            const typeIcon = {
              icon: type_icons[t],
            };
            if (index === 1) tabProps.ref = organizationsTabRef;
            return (
              <Tab label={<typeIcon.icon className={classes.tab} />} {...tabProps} key={index} />
            );
          })}
        </Tabs>
      </>
    </div>
  );
}
