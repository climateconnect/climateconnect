import { Link, makeStyles, ThemeProvider, Typography, useMediaQuery } from "@material-ui/core";
import React, { useContext } from "react";
import Chart from "react-google-charts";
import getTexts from "../../../../public/texts/texts";
import hubTheme from "../../../themes/hubTheme";
import theme from "../../../themes/theme";
import UserContext from "../../context/UserContext";

const useStyles = makeStyles((theme) => ({
  pieChart: {
    maxWidth: 250,
    padding: 50,
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  chart: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  pieChartsContainer: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  imgWrapper: {
    maxWidth: 600,
    margin: "0 auto",
  },
  img: {
    maxWidth: "100%",
  },
}));

export default function FashionDescription() {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "hub", locale: locale, hubName: "Fashion" });
  const isNarrowScreen = useMediaQuery(theme.breakpoints.down("xs"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <ThemeProvider theme={hubTheme}>
      <div>
        <Typography component="h2" variant="h2" className={classes.headline}>
          {texts.fashion_headline}
        </Typography>
        <Typography className={classes.textContent}>
          {texts.fashion_short_description_first_part}
          <br />
          <br />
          {texts.fashion_short_description_last_part}
        </Typography>
        <div className={classes.pieChartsContainer}>
          <Chart
            width={isNarrowScreen ? "330px" : isMediumScreen ? "400px" : "500px"}
            height={"300px"}
            chartType="PieChart"
            loader={<div>{texts.loading_chart}</div>}
            data={[
              [texts.production_step, texts.percent_of_total_ghg_emissions],
              [texts.garment_production, 50],
              [texts.yarn_production, 19],
              [texts.user_phase, 19],
              [texts.distribution_and_retail, 4],
              [texts.cotton_production, 8],
            ]}
            options={{
              title: texts.t_shirt_chart_title,
              pieStartAngle: 180,
            }}
            rootProps={{ "data-testid": "1" }}
          />
          <Chart
            width={isNarrowScreen ? "330px" : isMediumScreen ? "400px" : "500px"}
            height={"300px"}
            chartType="PieChart"
            loader={<div>{texts.loading_chart}</div>}
            data={[
              [texts.production_step, texts.percent_of_total_ghg_emissions],
              [texts.garment_production, 57],
              [texts.yarn_production, 10],
              [texts.user_phase, 20],
              [texts.distribution_and_retail, 4],
              [texts.cotton_production, 9],
            ]}
            options={{
              title: texts.jeans_chart_title,
              pieStartAngle: 180,
            }}
            rootProps={{ "data-testid": "2" }}
          />
        </div>
        <Typography>
          {texts.source}:{" "}
          <Link href="https://www.nature.com/articles/s43017-020-0039-9.epdf" target="_blank">
            Nature
          </Link>{" "}
          (2020)
        </Typography>
        <Typography component="h2" variant="h2" className={classes.headline}>
          {texts.massive_increase_in_fashion_carbon_emissions}
        </Typography>
        <Typography>
          {texts.massive_increase_in_fashion_carbon_emissions_text}
          <br />
          <b>{texts.solutions}:</b>
          <br /> {texts.massive_increase_in_fashion_carbon_emissions_solutions}
        </Typography>
        <Typography component="h2" variant="h2">
          {texts.water_consumption_and_pollution_of_natural_resources}
        </Typography>
        <Typography>
          {texts.water_consumption_and_pollution_of_natural_resources_text}
          <br />
          <b>{texts.solutions}:</b>
          <br />
          {texts.water_consumption_and_pollution_of_natural_resources_solutions}
        </Typography>
        <Typography component="h2" variant="h2">
          {texts.chemical_pollution_and_health_risks}
        </Typography>
        <Typography>
          {texts.chemical_pollution_and_health_text}
          <br />
          <b>{texts.solutions}:</b>
          <br />
          {texts.chemical_pollution_and_health_solutions}
        </Typography>
        <Typography component="h2" variant="h2">
          {texts.textile_waste_and_lack_of_recycling_in_the_fashion_industry}
        </Typography>
        <Typography>
          {texts.textile_waste_and_lack_of_recycling_in_the_fashion_industry_text_first_part}
          <br />
          {texts.textile_waste_and_lack_of_recycling_in_the_fashion_industry_text_last_part}
          <b>{texts.solutions}:</b>
          <br />
          {texts.textile_waste_and_lack_of_recycling_in_the_fashion_industry_solutions}
          <Typography component="h2" variant="h2">
            {texts.multiple_solutions_for_a_common_goal}
          </Typography>
          <Typography>
            {texts.multiple_solutions_for_a_common_goal_first_part}
            <br />
            <br />
            {texts.multiple_solutions_for_a_common_goal_proactive_action}
            <br />
            <br />
            {texts.multiple_solutions_for_a_common_goal_recycling}
            <br />
            <br />
            {texts.multiple_solutions_for_a_common_goal_last_part}
          </Typography>
          <div className={classes.imgWrapper}>
            <img
              src="/images/circular_economy.jpg"
              alt={texts.circular_economy_alt}
              className={classes.img}
            />
          </div>
        </Typography>
      </div>
    </ThemeProvider>
  );
}
