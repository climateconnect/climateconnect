import { Container, Theme, Typography, useMediaQuery } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import { getAllHubs } from "../public/lib/hubOperations";
import getTexts from "../public/texts/texts";
import UserContext from "../src/components/context/UserContext";
import HubHeaderImage from "../src/components/hub/HubHeaderImage";
import HubPreviews from "../src/components/hub/HubPreviews";
import NavigationSubHeader from "../src/components/hub/NavigationSubHeader";
import WideLayout from "../src/components/layouts/WideLayout";
import theme from "../src/themes/theme";

const useStyles = makeStyles((theme) => ({
  h1: {
    fontSize: 30,
    fontWeight: 700,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(0.5),
    [theme.breakpoints.down("md")]: {
      fontSize: 25,
    },
    [theme.breakpoints.down("sm")]: {
      fontSize: 20,
    },
  },
  h2: {
    fontSize: 20,
    fontWeight: 600,
    marginBottom: theme.spacing(2),
  },
  explainerText: {
    marginBottom: theme.spacing(2),
    fontSize: 18,
  },
  callToAction: {
    display: "block",
    marginTop: theme.spacing(0.5),
  },
  hubPreviews: {
    marginBottom: theme.spacing(2),
  },
}));

export async function getServerSideProps(ctx: { locale: any }) {
  return {
    props: {
      hubs: await getAllHubs(ctx.locale),
    },
  };
}

export default function Hubs({ hubs }) {
  const classes = useStyles();
  const isNarrowScreen = useMediaQuery<Theme>(theme.breakpoints.down("sm"));
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "hub", locale: locale });
  return (
    <WideLayout largeFooter noSpaceBottom title={texts.climate_action_hubs}>
      <HubHeaderImage
        image="/images/hubs_background.jpg"
        // TODO(unused) alt={texts.hubs_overview_image_alt}
        fullWidth
      />
      <NavigationSubHeader type={"browse"} allHubs={hubs} />
      <Container>
        <Typography color="primary" component="h1" className={classes.h1}>
          {texts.find_climate_solutions_in_each_hub}
        </Typography>
        {!isNarrowScreen && (
          <Typography component="h2" className={classes.h2}>
            {texts.find_the_best_ways_to_tackle_climate_change_in_each_sector}
          </Typography>
        )}
        {isNarrowScreen ? (
          <MobileExplainerText texts={texts} />
        ) : (
          <LargeScreenExplainerText texts={texts} />
        )}
        <HubPreviews hubs={hubs} className={classes.hubPreviews} />
      </Container>
    </WideLayout>
  );
}

const MobileExplainerText = ({ texts }) => {
  const classes = useStyles();
  return (
    <Typography className={classes.explainerText}>
      {texts.hubs_overview_mobile_explainer_text}
    </Typography>
  );
};

const LargeScreenExplainerText = ({ texts }) => {
  const classes = useStyles();
  return (
    <Typography className={classes.explainerText}>
      {texts.hubs_overview_largescreen_explainer_text_first_part}
      <span className={classes.callToAction}>
        {texts.hubs_overview_largescreen_explainer_text_last_part}
      </span>
    </Typography>
  );
};
