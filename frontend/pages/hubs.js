import React from "react";
import axios from "axios";
import { Typography, Container, makeStyles, useMediaQuery } from "@material-ui/core";

import WideLayout from "../src/components/layouts/WideLayout";
import HubHeaderImage from "../src/components/hub/HubHeaderImage";
import NavigationSubHeader from "../src/components/hub/NavigationSubHeader";
import HubPreviews from "../src/components/hub/HubPreviews";
import theme from "../src/themes/theme";

const useStyles = makeStyles((theme) => ({
  h1: {
    fontSize: 30,
    fontWeight: 700,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(0.5),
    [theme.breakpoints.down("sm")]: {
      fontSize: 25,
    },
    [theme.breakpoints.down("xs")]: {
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

export default function Hubs({ hubs }) {
  const classes = useStyles();
  const isNarrowScreen = useMediaQuery(theme.breakpoints.down("xs"));
  return (
    <WideLayout largeFooter noSpaceBottom title="Climate Solution Hubs">
      <NavigationSubHeader />
      <HubHeaderImage
        image="/images/hubs_background.jpg"
        alt="Beautiful flat landscape with many hot air balloons taking off"
        fullWidth
      />
      <Container>
        <Typography color="primary" component="h1" className={classes.h1}>
          Find climate solutions in each hub
        </Typography>
        {!isNarrowScreen && (
          <Typography component="h2" className={classes.h2}>
            Find the best ways to tackle climate change in each sector
          </Typography>
        )}
        {isNarrowScreen ? <MobileExplainerText /> : <LargeScreenExplainerText />}
        <HubPreviews hubs={hubs} className={classes.hubPreviews} />
      </Container>
    </WideLayout>
  );
}

const MobileExplainerText = () => {
  const classes = useStyles();
  return (
    <Typography className={classes.explainerText}>
      Find information and concrete solutions on how to effectively fight climate change in each
      sector.
    </Typography>
  );
};

const LargeScreenExplainerText = () => {
  const classes = useStyles();
  return (
    <Typography className={classes.explainerText}>
      On the hub pages you can find information on how to effectively fight climate change in each
      sector. You can find concrete and impactful solutions created by Climate Connect users. Get
      inspired and see possible actions how to fight climate change and get involved in a project
      you like. Who knows, maybe you will even find a really cool project that is already working
      great somewhere else and can reproduce it in your home town! Contact the {"solutions'"}{" "}
      creators directly on the {"solutions'"} pages to start a conversation!
      <span className={classes.callToAction}>
        Have fun exploring what is possible to save our planet! Remember: The clock is ticking and
        every tenth of an degree matters.
      </span>
    </Typography>
  );
};

Hubs.getInitialProps = async () => {
  return {
    hubs: await getHubs(),
  };
};

const getHubs = async () => {
  try {
    const resp = await axios.get(`${process.env.API_URL}/api/hubs/`);
    return resp.data.results;
  } catch (err) {
    if (err.response && err.response.data)
      console.log("Error in getHubData: " + err.response.data.detail);
    console.log(err);
    return null;
  }
};
