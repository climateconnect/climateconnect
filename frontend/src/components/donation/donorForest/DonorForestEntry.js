import { Avatar, Link, makeStyles, Tooltip } from "@material-ui/core";
import React, { useContext } from "react";
import { getLocalePrefix } from "../../../../public/lib/apiOperations";
import { durationFromMiliseconds } from "../../../../public/lib/dateOperations";
import { getImageUrl } from "../../../../public/lib/imageOperations";
import getTexts from "../../../../public/texts/texts";
import UserContext from "../../context/UserContext";

const useStyles = makeStyles((theme) => ({
  treeImageContainer: (props) => ({
    width: props.width,
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

const getWidthFromStep = (step) => {
  const widths = {
    1: "65px",
    2: "70px",
    3: "75px",
    4: "80px",
    5: "95px",
    6: "100px",
  };
  if (widths[step]) return widths[step];
  return "65px";
};

export default function DonorForestEntry({ donor }) {
  const badge = donor.badges[0];
  const width = getWidthFromStep(badge.step ? badge.step : 1);
  const classes = useStyles({ image: getImageUrl(badge.image), width: width });
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
