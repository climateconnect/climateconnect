import React from "react";
import EmojiObjectsIcon from "@material-ui/icons/EmojiObjects";
import { makeStyles, Tab, Tabs } from "@material-ui/core";
import ContactAmbassadorButton from "../hub/ContactAmbassadorButton";
import AssignmentIcon from "@material-ui/icons/Assignment";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import GroupIcon from "@material-ui/icons/Group";
import DateRangeRoundedIcon from "@material-ui/icons/DateRangeRounded";

const useStyles = makeStyles(() => ({
  root: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    background: "#f0f2f5",
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
          indicatorColor="primary"
          textColor="primary"
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
            return <Tab label={<typeIcon.icon />} {...tabProps} key={index} />;
          })}
        </Tabs>
      </>
    </div>
  );
}
