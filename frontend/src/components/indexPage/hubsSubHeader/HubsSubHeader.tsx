import { Container, Link, Theme, useMediaQuery } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import { getLocalePrefix } from "../../../../public/lib/apiOperations";
import getTexts from "../../../../public/texts/texts";
import theme from "../../../themes/theme";
import UserContext from "../../context/UserContext";
import GoBackFromProjectPageButton from "../../project/Buttons/GoBackFromProjectPageButton";
import HubLinks from "./HubLinks";
const PRIO1_SLUG = "prio1";

type StyleProps = {
  hubSlug?: string;
};

const useStyles = makeStyles<Theme, StyleProps>((theme: Theme) => ({
  root: (props: any) => ({
    background:
      props.hubSlug === PRIO1_SLUG ? theme.palette.secondary.main : theme.palette.primary.main,
  }),
  link: {
    color: theme.palette.primary.contrastText,
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
    justifyContent: "space-between",
    alignItems: "center",
  },
  hubsContainer: {
    display: "flex",
    justifyContent: "flex-end",
    [theme.breakpoints.down("sm")]: {
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
}));

export default function HubsSubHeader({ hubs, onlyShowDropDown, isCustomHub, hubSlug }: any) {
  const classes = useStyles({ hubSlug: hubSlug });
  const isNarrowScreen = useMediaQuery<Theme>(theme.breakpoints.down("sm"));
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "navigation", locale: locale });
  return (
    <div className={classes.root}>
      <Container className={classes.container}>
        <div>
          {!isNarrowScreen && onlyShowDropDown && (
            <GoBackFromProjectPageButton
              /*TODO(undefined) containerClassName={classes.goBackButtonContainer} */
              texts={texts}
              locale={locale}
              tinyScreen={isNarrowScreen}
              hubSlug={hubSlug}
            />
          )}
        </div>
        <div className={classes.hubsContainer}>
          {!isNarrowScreen && !onlyShowDropDown && !isCustomHub && (
            <Link
              className={classes.link}
              key={"/hubs"}
              href={`${getLocalePrefix(locale)}/hubs/`}
              underline="hover"
            >
              {texts.all_hubs}
            </Link>
          )}
          {hubs && !isCustomHub && (
            <HubLinks
              linkClassName={classes.link}
              hubs={hubs}
              locale={locale}
              isNarrowScreen={isNarrowScreen}
              onlyShowDropDown={onlyShowDropDown}
            />
          )}
        </div>
      </Container>
    </div>
  );
}
