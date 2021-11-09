import { Container, Link, makeStyles, useMediaQuery } from "@material-ui/core";
import React, { useContext } from "react";
import { getLocalePrefix } from "../../../../public/lib/apiOperations";
import getTexts from "../../../../public/texts/texts";
import theme from "../../../themes/theme";
import UserContext from "../../context/UserContext";
import GoBackButton from "../../project/Buttons/GoBackButton";
import HubLinks from "./HubLinks";

const useStyles = makeStyles((theme) => ({
  root: {
    background: theme.palette.primary.main,
  },
  link: {
    color: "white",
    display: "inline-block",
    fontWeight: 600,
    marginRight: theme.spacing(2),
    marginLeft: theme.spacing(2),
    fontSize: 16,
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  container: {
    display: "flex",
    justifyContent: "flex-end",
    [theme.breakpoints.down("xs")]: {
      justifyContent: "center",
    },
  },
  viewHubsButton: {
    background: "white",
  },
  popover: {
    pointerEvents: "none",
  },
  popoverContent: {
    pointerEvents: "auto",
  },
  goBackButtonContainer: {
    alignSelf: "center",
    width: "100%",
  },
}));

export default function HubsSubHeader({ hubs, subHeaderRef, onProjectPage }) {
  const classes = useStyles();
  const isNarrowScreen = useMediaQuery(theme.breakpoints.down("xs"));
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "navigation", locale: locale });
  return (
    <div className={classes.root} ref={subHeaderRef}>
      <Container className={classes.container}>
        {!isNarrowScreen && onProjectPage && (
          <GoBackButton
            containerClassName={classes.goBackButtonContainer}
            texts={texts}
            locale={locale}
            tinyScreen={isNarrowScreen}
          />
        )}
        {!isNarrowScreen && !onProjectPage && (
          <Link className={classes.link} key={"/hubs"} href={`${getLocalePrefix(locale)}/hubs/`}>
            {texts.all_hubs}
          </Link>
        )}
        {hubs && (
          <HubLinks
            linkClassName={classes.link}
            hubs={hubs}
            locale={locale}
            isNarrowScreen={isNarrowScreen}
            onProjectPage={onProjectPage}
          />
        )}
      </Container>
    </div>
  );
}
