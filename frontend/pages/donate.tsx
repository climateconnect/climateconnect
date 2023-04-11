import { Container, Theme, Typography, useMediaQuery } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import { apiRequest } from "../public/lib/apiOperations";
import getTexts from "../public/texts/texts";
import UserContext from "../src/components/context/UserContext";
import WideLayout from "../src/components/layouts/WideLayout";
import FloatingWidget from "../src/components/staticpages/donate/FloatingWidget";
import TextBox from "../src/components/staticpages/donate/TextBox";
import ToggleWidgetButton from "../src/components/staticpages/donate/ToggleWidgetButton";
import WhoWeAreContent from "../src/components/staticpages/donate/WhoWeAreContent";
import QuoteBox from "../src/components/staticpages/QuoteBox";
import TopSection from "../src/components/staticpages/TopSection";
import theme from "../src/themes/theme";

const useStyles = makeStyles((theme) => {
  return {
    root: {
      position: "relative",
    },
    topImageContainer: {
      width: "100%",
      height: 450,
      background: "url('/images/drought.jpg')",
      backgroundRepeat: "no-repeat",
      backgroundSize: "100% auto",
      backgroundPosition: "0px 50%",
      [theme.breakpoints.down("lg")]: {
        height: 350,
        backgroundPosition: "0px 70%",
      },
      [theme.breakpoints.down("md")]: {
        height: 260,
        backgroundPosition: "0px 85%",
      },
      [theme.breakpoints.down("sm")]: {
        height: 160,
        display: "none",
      },
    },
    imageTextContainer: {
      position: "relative",
      height: "100%",
      width: "100%",
    },
    headlineClass: {
      fontSize: 25,
      fontWeight: 700,
      marginBottom: theme.spacing(1.5),
      color: theme.palette.primary.main,
      [theme.breakpoints.down("sm")]: {
        fontSize: 20,
      },
    },
    imageText: {
      position: "absolute",
      bottom: theme.spacing(4),
      color: theme.palette.yellow.main,
      paddingRight: `max(24px, 472px - ((100% - 1280px) / 2))`,
      marginBottom: 0,
      [theme.breakpoints.down("lg")]: {
        paddingRight: 472,
      },
      [theme.breakpoints.down("md")]: {
        padding: 0,
      },
      [theme.breakpoints.down("sm")]: {
        display: "none",
      },
    },
    textBodyClass: {
      color: theme.palette.secondary.main,
    },
    textSection: {
      marginTop: theme.spacing(5),
      marginBottom: theme.spacing(5),
      paddingRight: `max(24px, 472px - ((100% - 1280px) / 2))`,
      [theme.breakpoints.down("lg")]: {
        paddingRight: 472,
      },
      [theme.breakpoints.down("md")]: {
        padding: theme.spacing(4),
      },
      [theme.breakpoints.down("sm")]: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
        paddingTop: theme.spacing(3),
        paddingBottom: theme.spacing(3),
      },
    },
    subHeadline: {
      color: theme.palette.primary.main,
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(1),
      fontWeight: 700,
      fontSize: 20,
      [theme.breakpoints.down("sm")]: {
        fontSize: 16,
      },
    },
  };
});

export async function getServerSideProps(ctx) {
  if (process.env.DONATION_CAMPAIGN_RUNNING !== "true")
    return {
      props: {},
    };
  const { goal_name, goal_amount, current_amount } = (await getDonations(ctx.locale))!;
  return {
    props: {
      goal_name: goal_name,
      goal_amount: goal_amount,
      current_amount: current_amount,
    },
  };
}

export default function Donate({ goal_name, goal_amount, current_amount }) {
  const classes = useStyles();
  const isLargeScreen = useMediaQuery<Theme>(theme.breakpoints.up("md"));
  const isNarrowScreen = useMediaQuery<Theme>(theme.breakpoints.down("sm"));
  const [overlayOpen, setOverlayOpen] = React.useState(false);
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "donate", locale: locale });
  return (
    <WideLayout title={texts.your_donation_counts} isStaticPage noSpaceBottom noFeedbackButton>
      <div className={classes.root}>
        {isLargeScreen ? (
          <FloatingWidget
            goal_name={goal_name}
            current_amount={current_amount}
            goal_amount={goal_amount}
          />
        ) : (
          <ToggleWidgetButton
            overlayOpen={overlayOpen}
            setOverlayOpen={setOverlayOpen}
            goal_name={goal_name}
            current_amount={current_amount}
            goal_amount={goal_amount}
          />
        )}
        <TopSection
          headline={texts.donate_infinitive}
          subHeader={texts.support_growing_a_global_network_of_climate_actors}
          fixedHeight={!isNarrowScreen}
          noMarginBottom
        />
        <div className={classes.topImageContainer}>
          <Container className={classes.imageTextContainer}>
            <Typography className={`${classes.imageText} ${classes.headlineClass}`} component="h1">
              {texts.a_new_way_to_fight_climate_change_donate_today}
            </Typography>
          </Container>
        </div>
        <TextBox
          className={classes.textSection}
          headlineClass={classes.headlineClass}
          textBodyClass={classes.textBodyClass}
          headline={texts.why_donate}
          text={texts.why_donate_text}
          subPoints={[
            {
              headline: texts.your_donation_helps_scale_up_effective_climate_solutions,
              text: texts.your_donation_helps_scale_up_effective_climate_solutions_text,
            },
            {
              headline: texts.your_donation_multiplies_the_impact_of_climate_actors,
              text: texts.your_donation_multiplies_the_impact_of_climate_actors_text,
            },
            {
              headline: texts.your_support_keeps_climate_connect_independent_and_free_for_everyone,
              text: texts.your_support_keeps_climate_connect_independent_and_free_for_everyone_text,
            },
          ]}
          subHeadlineClass={classes.subHeadline}
          icon="/icons/floating_sign_heart.svg"
        />
        <TextBox
          className={classes.textSection}
          headlineClass={classes.headlineClass}
          textBodyClass={classes.textBodyClass}
          headline={texts.donate_with_cryptocurrency}
          text={texts.donate_with_cryptocurrency_text}
          icon="/icons/bitcoin.svg"
          subPoints={[
            {
              text: (
                <>
                  <Typography color="primary" component="span">
                    {texts.our_bitcoin_address}:{" "}
                  </Typography>
                  <Typography component="span">1BTKuBx78uSGBkNcS8pCkvLKwXTH1NyJ23</Typography>
                </>
              ),
            },
          ]}
        />
        <QuoteBox
          className={classes.textSection}
          text={texts.we_can_only_prevent_a_global_climate_catastrophe_if_everyone}
        />
        <TextBox
          className={classes.textSection}
          headlineClass={classes.headlineClass}
          textBodyClass={classes.textBodyClass}
          headline={texts.what_we_need_to_pay_for}
          text={texts.what_we_need_to_pay_for_text}
          subPoints={[
            {
              headline: texts.improving_and_updating_climate_connect,
              text: texts.improving_and_updating_climate_connect_text,
            },
            {
              headline: texts.growing_the_community_and_sparking_collaboration,
              text: texts.growing_the_community_and_sparking_collaboration_text,
            },
            {
              headline: texts.ongoing_expenses,
              text: texts.ongoing_expenses_text,
            },
          ]}
          subHeadlineClass={classes.subHeadline}
          icon="/icons/floating_sign_expenses.svg"
        />
        <TextBox
          className={classes.textSection}
          headlineClass={classes.headlineClass}
          textBodyClass={classes.textBodyClass}
          headline={texts.long_term_sustainability}
          text={texts.long_term_sustainability_text}
          icon="/icons/floating_sign_infinity.svg"
        />
        <TextBox
          className={classes.textSection}
          headlineClass={classes.headlineClass}
          textBodyClass={classes.textBodyClass}
          headline={texts.who_we_are}
          text={
            <>
              <Typography>{texts.who_we_are_text}</Typography>
            </>
          }
          icon="/icons/floating_sign_group.svg"
        >
          <WhoWeAreContent />
        </TextBox>
        <TextBox
          className={classes.textSection}
          headlineClass={classes.headlineClass}
          textBodyClass={classes.textBodyClass}
          headline={texts.donation_receipts}
          text={
            <>
              <Typography>
                {texts.donation_receipts_text_first_part}
                {texts.donation_receipts_text_middle_part}
                <br />
                {texts.donation_receipts_text_last_part}
              </Typography>
            </>
          }
          icon="/icons/floating_sign_letter.svg"
        />
      </div>
    </WideLayout>
  );
}

const getDonations = async (locale) => {
  try {
    const resp = await apiRequest({
      method: "get",
      url: "/api/donation_goal_progress/",
      locale: locale,
    });
    return {
      goal_name: resp.data.name ? resp.data.name : null,
      goal_start: resp.data.start_date ? resp.data.start_date : null,
      goal_end: resp.data.end_date ? resp.data.end_date : null,
      goal_amount: resp.data.amount ? resp.data.amount : null,
      current_amount: resp.data.current_amount ? resp.data.current_amount : null,
    };
  } catch (err: any) {
    if (err.response && err.response.data) {
      console.log(err.response.data);
    } else console.log(err);
    return null;
  }
};
