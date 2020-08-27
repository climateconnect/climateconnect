import React from "react";
import HeaderImage from "../src/components/staticpages/HeaderImage";
import WideLayout from "../src/components/layouts/WideLayout";
import { makeStyles } from "@material-ui/core/styles";
import { Typography, Container, Link, Divider } from "@material-ui/core";
import QuoteSlideShow from "../src/components/about/QuoteSlideShow";
import quotes_with_images from "../public/data/quotes_with_images.js";

const useStyles = makeStyles(theme => {
  return {
    headerImageContainer: {
      marginBottom: theme.spacing(5)
    },
    headerTextContainer: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      background: "rgba(255, 255, 255, 0.6)",
      width: "100%",
      height: "100%",
      [theme.breakpoints.down("md")]: {
        background: "rgba(255, 255, 255, 0.8)"
      }
    },
    headerTextInnerContainer: {
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: theme.spacing(4)
    },
    headerTextBig: {
      fontWeight: "bold",
      fontSize: 80,
      [theme.breakpoints.down("md")]: {
        fontSize: 60
      },
      [theme.breakpoints.down("xs")]: {
        fontSize: 40
      },
      textAlign: "left"
    },
    headerTextSmall: {
      color: "white",
      fontWeight: "bold",
      textAlign: "left",
      [theme.breakpoints.down("md")]: {
        fontSize: 40
      },
      [theme.breakpoints.down("xs")]: {
        fontSize: 25
      },
      textShadow: "3px 3px 3px #484848C2"
    },
    content: {
      textAlign: "center",
      fontWeight: "bold"
    },
    boldText: {
      fontSize: 30,
      fontWeight: 600,
      lineHeight: 1.5,
      [theme.breakpoints.down("md")]: {
        fontSize: 23
      }
    },
    twingle: {
      width: "100%",
      border: "none",
      overflow: "visible",
      display: "block",
      marginBottom: theme.spacing(5),
      marginTop: theme.spacing(2),
      height: 550
    },
    block: {
      display: "block",
      marginBottom: theme.spacing(3)
    },
    mediumSizeText: {
      fontSize: 22,
      [theme.breakpoints.down("md")]: {
        fontSize: 18
      }
    },
    badgeImage: {
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(3)
    },
    divider: {
      marginTop: theme.spacing(5),
      marginBottom: theme.spacing(5)
    },
    smallWidthText: {
      maxWidth: 800,
      margin: "0 auto"
    },
    paypalLink: {
      marginBottom: theme.spacing(7),
      display: "block"
    },
    quoteSlideShow: {
      marginBottom: theme.spacing(5)
    }
  };
});

export default function Support() {
  const classes = useStyles();
  return (
    <>
      <WideLayout title="Support us" isStaticPage>
        <HeaderImage src={"images/supportusheader.jpg"} className={classes.headerImageContainer}>
          <div className={classes.headerTextContainer}>
            <div className={classes.headerTextInnerContainer}>
              <div>
                <Typography color="primary" variant="h1" className={classes.headerTextBig}>
                  Support us
                </Typography>
                <Typography variant="h1" className={classes.headerTextSmall}>
                  Help us to stay free and independent
                </Typography>
              </div>
            </div>
          </div>
        </HeaderImage>
        <Container size="lg" className={classes.content}>
          <div className={classes.block}>
            <Typography variant="h5" className={classes.boldText} color="secondary">
              We rely on your contributions to keep Climate Connect up and running!
            </Typography>
            <Typography variant="h5" className={classes.boldText} color="secondary">
              {" "}
              Support us with a donation to enable us to bring the global climate action community
              together in a strong network of worldwide collaboration.
            </Typography>
          </div>
          <Typography variant="h5" color="secondary" className={classes.mediumSizeText}>
            If you{" "}
            <Link href="#banktransfer" color="primary" underline="always">
              donate directly to our donations account
            </Link>
            , we {"won't"} need to pay any fees.
          </Typography>
          <iframe
            className={classes.twingle}
            src="https://spenden.twingle.de/climate-connect-gug-haftungsbeschrankt/climate-connect/tw5ee1f393e9a58/widget"
          />
          <script src="https://spenden.twingle.de/embed/generic" />
          <Typography
            variant="h5"
            className={`${classes.boldText} ${classes.mediumSizeText}`}
            color="secondary"
          >
            A one time donation is awesome. <br /> <b>Continuous support</b> will give us the
            freedoom to plan our actions with foresight.
          </Typography>
          <Typography
            variant="h5"
            className={`${classes.boldText} ${classes.mediumSizeText}`}
            color="secondary"
          >
            Donate <b>directly to our bank account below </b>to make the biggest impact.{" "}
          </Typography>
          <Typography
            variant="h5"
            className={`${classes.boldText} ${classes.mediumSizeText}`}
            color="secondary"
          >
            Also: <b>receive an awesome badge</b> (as below) on Climate Connect to show your
            support! (Will be implemented soon!)
          </Typography>
          <img src="/images/badge.png" className={classes.badgeImage} />
          <Typography
            variant="h5"
            id="banktransfer"
            className={`${classes.boldText} ${classes.mediumSizeText} ${classes.block}`}
          >
            <div>
              Donate directly to our donations account. This way we {"don't"} need to pay any fees
              on your donation.
            </div>
            <div>
              <b>Recurring donations help us plan our actions with foresight.</b>
            </div>
          </Typography>
          <Typography color="primary" className={classes.boldText}>
            <div>Climate Connect gUG (haftungsbeschränkt)</div>
            <div>IBAN: DE02430609671072519500</div>
            <div>BIC: GENODEM1GLS</div>
          </Typography>
          <Typography className={classes.boldText}>Bank: GLS Gemeinschaftsbank eG</Typography>
          <Divider className={classes.divider} />
          <Link
            href="https://paypal.me/climateconnect"
            color="primary"
            variant="h4"
            className={`${classes.boldText} ${classes.paypalLink}`}
            target="_blank"
          >
            Donate directly with PayPal
          </Link>
        </Container>
        <QuoteSlideShow
          image={quotes_with_images[1].image_path}
          className={classes.quoteSlideShow}
        />
        <Container maxWidth="lg" className={classes.content}>
          <Typography
            className={`${classes.boldText} ${classes.mediumSizeText} ${classes.smallWidthText} ${classes.block}`}
          >
            Donations pay for server cost, marketing and mainly for the salaries of our employees
            who make sure that Climate Connect is working and expanding. Since transparency is very
            important for us we will start issueing monthly financial reports starting from
            September 2020.
          </Typography>
        </Container>
      </WideLayout>
    </>
  );
}
