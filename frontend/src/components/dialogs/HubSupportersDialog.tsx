import React, { useContext } from "react";
import GenericDialog from "./GenericDialog";
import makeStyles from "@mui/styles/makeStyles";
import { getImageUrl } from "../../../public/lib/imageOperations";
import { Link } from "@mui/material";
import { getLocalePrefix } from "../../../public/lib/apiOperations";
import UserContext from "../context/UserContext";
import getTexts from "../../../public/texts/texts";
import { Supporter } from "../../types";

type HubSupportersDialogProps = {
  supporters: Supporter[];
  open: boolean;
  onClose: () => void;
  hubName: string;
};

const useStyles = makeStyles((theme) => ({
  dialogTitle: {
    color: theme.palette.background.default_contrastText,
    marginRight: 0,
    textAlign: "center",
    fontSize: "17px",
    fontWeight: "600",
    paddingTop: "5px",
  },
  closeButtonRightStyle: {
    alignSelf: "flex-start",
    marginTop: "-5px",
    marginRight: "-10px",
    padding: 0,
    color: theme.palette.background.default_contrastText,
    "& svg": {
      fontSize: "17px",
    },
  },
  carouselEntry: {
    backgroundColor: "#F7F7F7",
    padding: "10px",
    display: "flex",
    justifyContent: "left",
    marginBottom: theme.spacing(2),
    border: "1px solid #E0E0E0",
    borderRadius: "14px",
  },
  itemContainer: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  supporterImg: {
    borderRadius: "50%",
  },
  supporterName: () => ({
    fontSize: "17px",
    fontWeight: "600",
    overflow: "hidden",
    color: "black",
    margin: 0,
    wordBreak: "break-word",
  }),
  supporterSubtitle: () => ({
    margin: 0,
    fontSize: "15px",
    fontWeight: "normal",
    color: "#484848",
    overflow: "hidden",
    textOverflow: "ellipsis",
  }),
  donate: {
    color: theme.palette.background.default_contrastText,
    fontWeight: "600",
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2),
    textAlign: "center",
    fontSize: "17px",
    paddingTop: "5px",
  },
}));

const HubSupportersDialog = ({ supporters, open, onClose, hubName }: HubSupportersDialogProps) => {
  const classes = useStyles({});
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "hub", locale: locale });
  const donateText = getTexts({ page: "donate", locale: locale });

  const handleClose = () => {
    onClose();
  };

  const HubSupporterCarouselEntry = ({ supporter }) => (
    <div className={classes.carouselEntry} key={supporter.name}>
      <div className={classes.itemContainer}>
        <img
          src={getImageUrl(supporter?.logo)}
          width={76}
          height={76}
          alt={supporter.name}
          className={classes.supporterImg}
        />
        <div>
          <p className={classes.supporterName}>{supporter?.name}</p>
          <p className={classes.supporterSubtitle}>{supporter.subtitle}</p>
        </div>
      </div>
    </div>
  );

  return (
    <GenericDialog
      onClose={handleClose}
      closeButtonRightSide
      open={open}
      title={texts.all_supporters_and_sponsoring_members + " " + hubName}
      titleTextClassName={classes.dialogTitle}
      closeButtonRightStyle={classes.closeButtonRightStyle}
      applyText={donateText.donate_now}
      buttonAsLink={getLocalePrefix(locale) + "/donate"}
      useApplyButton
      showApplyAtBottom
    >
      {supporters?.length > 0 &&
        supporters.map((supporter) => (
          <>
            {supporter?.organization_url_slug ? (
              <Link
                href={
                  getLocalePrefix(locale) + "/organizations/" + supporter?.organization_url_slug
                }
                underline="none"
                className={classes.supporterName}
              >
                <HubSupporterCarouselEntry supporter={supporter} />
              </Link>
            ) : (
              <HubSupporterCarouselEntry supporter={supporter} />
            )}
          </>
        ))}

      <div className={classes.donate}>{texts.would_you_like_to_support_the_ClimateHub}</div>
    </GenericDialog>
  );
};

export default HubSupportersDialog;
