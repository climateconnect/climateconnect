import { Avatar, Link, makeStyles, Tooltip } from "@material-ui/core";
import React, { useContext } from "react";
import { getLocalePrefix } from "../../../../public/lib/apiOperations";
import { durationFromMiliseconds } from "../../../../public/lib/dateOperations";
import { getImageUrl } from "../../../../public/lib/imageOperations";
import getTexts from "../../../../public/texts/texts";
import UserContext from "../../context/UserContext";

const useStyles = makeStyles((theme) => ({
  treeImageContainer: (props) => ({
    width: 70,
    backgroundImage: `url('${props.image}')`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "bottom",
  }),
  treeImage: {
    visibility: "hidden",
  },
  avatar: {
    marginLeft: theme.spacing(4.5),
    marginTop: theme.spacing(-1),
    width: 50,
    height: 50,
    border: `2px solid ${theme.palette.primary.main}`,
  },
}));

export default function DonorForestEntry({ donor }) {
  const badge = donor.badges[0];
  const classes = useStyles({ image: getImageUrl(badge.image) });
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "donate", locale: locale });
  const now = new Date();
  const timeSinceFirstDonation = now - new Date(donor.started_donating);
  return (
    <Tooltip
      title={`${donor.first_name} ${donor.last_name} ${
        texts.has_been_a_supporter_for
      } ${durationFromMiliseconds(timeSinceFirstDonation, texts)}`}
    >
      <div>
        <div className={classes.treeImageContainer}>
          <img className={classes.treeImage} src={getImageUrl(badge.image)} />
        </div>
        <Link href={`${getLocalePrefix(locale)}/profiles/${donor.url_slug}`} target="_blank">
          <Avatar
            size="large"
            src={getImageUrl(donor.thumbnail_image ?? donor.image)}
            className={classes.avatar}
          />
        </Link>
      </div>
    </Tooltip>
  );
}
