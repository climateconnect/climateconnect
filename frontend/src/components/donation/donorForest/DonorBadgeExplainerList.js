import { List, ListItem, ListItemIcon, makeStyles, Typography } from "@material-ui/core";
import React, { useContext } from "react";
import { getImageUrl } from "../../../../public/lib/imageOperations";
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
    [theme.breakpoints.down("xs")]: {
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
    <ListItem className={classes.listItem}>
      <ListItemIcon className={classes.listItemIcon}>
        <ProfileBadge contentOnly image={getImageUrl(badge.image)} name={badge.name} />
      </ListItemIcon>
      <Typography className={classes.badgeExplainerText}>{badgeText[locale]}</Typography>
    </ListItem>
  );
};
