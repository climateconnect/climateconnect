import { List, ListItem, ListItemIcon, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import UserContext from "../../context/UserContext";
import ProfileBadge from "../../profile/ProfileBadge";

const useStyles = makeStyles((theme) => ({
  image: {
    width: 30,
    border: `1px solid`,
  },
  listItemIcon: {
    marginRight: theme.spacing(1),
  },
  list: {
    display: "grid",
    width: "100%",
    gridTemplateColumns: "repeat(2, 1fr)",
    gridColumnGap: 2,
    gridRowGap: 5,
    [theme.breakpoints.down("sm")]: {
      gridTemplateColumns: "repeat(1, 1fr)",
    },
  },
  badgeExplainerText: {
    fontSize: 15.5,
  },
}));

export default function DonorBadgeExplainerList({ possibleBadges }) {
  const classes = useStyles();
  return (
    <List className={classes.list}>
      {possibleBadges
        .sort((a, b) => a.min_days_donated - b.min_days_donated)
        .map((b, i) => (
          <DonorBadgeListEntry badge={b} key={i} />
        ))}
    </List>
  );
}

const DonorBadgeListEntry = ({ badge }) => {
  const classes = useStyles();
  const { locale } = useContext(UserContext);

  const badgeText = {
    en: `Donate ${badge.min_days_donated} days 
    ${
      badge.instantly_awarded_over_amount > 5
        ? `(Instant with >${badge.instantly_awarded_over_amount}€)`
        : ""
    }`,
    de: `Spende ${badge.min_days_donated} Tage
    ${
      badge.instantly_awarded_over_amount > 5
        ? `(Direkt bei >${badge.instantly_awarded_over_amount}€)`
        : ""
    }`,
  };
  return (
    <ListItem /* TODO(undefined) className={classes.listItem} */>
      <ListItemIcon className={classes.listItemIcon}>
        <ProfileBadge contentOnly badge={badge} />
      </ListItemIcon>
      <Typography className={classes.badgeExplainerText}>{badgeText[locale]}</Typography>
    </ListItem>
  );
};
