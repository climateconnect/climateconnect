import { List, ListItem, ListItemIcon, makeStyles, Typography } from "@material-ui/core";
import React from "react";
import { getImageUrl } from "../../../../public/lib/imageOperations";
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
    }
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
  return (
    <ListItem className={classes.listItem}>
      <ListItemIcon className={classes.listItemIcon}>
        <ProfileBadge contentOnly image={getImageUrl(badge.image)} name={badge.name} />
      </ListItemIcon>
      <Typography>{badge.name}</Typography>
    </ListItem>
  );
};
