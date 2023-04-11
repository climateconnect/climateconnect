import { Link, Typography } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import getTexts from "../../../../public/texts/texts";
import hubTheme from "../../../themes/hubTheme";
import UserContext from "../../context/UserContext";
import SimpleBarChart from "../SimpleBarChart";

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(2),
  },
  chart: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  sources: {
    marginTop: theme.spacing(6),
  },
  callToAction: {
    fontWeight: 600,
  },
}));
export default function FoodDescription() {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "hub", locale: locale, hubName: "Food" });

  const chart1Config = {
    unit: "kg CO2e / day",
    data: [
      {
        label: texts.meat_lover,
        value: 7.19,
      },
      {
        label: texts.low_meat_diet,
        value: 4.67,
      },
      {
        label: texts.vegetarian,
        value: 3.81,
      },
      {
        label: texts.vegan,
        value: 2.89,
      },
    ],
  };

  const chart2Config = {
    unit: "kg",
    data: [
      {
        label: texts.beef_from_beef_herd,
        value: 36.44,
      },
      {
        label: texts.beef_from_dairy_herd,
        value: 12.2,
      },
      {
        label: texts.fish_farmed,
        value: 7.61,
      },
      {
        label: texts.cheese,
        value: 6.17,
      },
      {
        label: texts.pig_meat,
        value: 5.15,
      },
      {
        label: texts.eggs,
        value: 3.24,
      },
      {
        label: texts.rice,
        value: 1.21,
      },
      {
        label: texts.oatmeal,
        value: 0.95,
      },
      {
        label: texts.potatoes,
        value: 0.63,
      },
      {
        label: texts.nuts,
        value: 0.07,
      },
    ],
  };

  return (
    <ThemeProvider theme={hubTheme}>
      <div className={classes.root}>
        <Typography component="h2" variant="h2" className={classes.headline}>
          {texts.food_headline}
        </Typography>
        <Typography className={classes.textContent}>{texts.food_introduction}</Typography>
        <SimpleBarChart
          config={chart2Config}
          labelsOutSideBar
          className={classes.chart}
          title={texts.emissions_per_calories_chart_title}
        />
        <Typography component="h2" variant="h2" className={classes.headline}>
          {texts.vegan_most_climate_friendly}
        </Typography>
        <Typography className={classes.textContent}>
          {texts.vegan_most_climate_friendly_text}
        </Typography>
        <SimpleBarChart
          config={chart1Config}
          className={classes.chart}
          labelsOutSideBar
          title={texts.avg_daily_co2_emissions_chart_title}
        />
        <Typography component="h2" variant="h2" className={classes.headline}>
          {texts.seasonal_more_important_than_local}
        </Typography>
        <Typography className={classes.textContent}>
          {texts.seasonal_more_important_than_local_text}
        </Typography>
        <Typography component="h2" variant="h2" className={classes.headline}>
          {texts.food_waste}
        </Typography>
        <Typography className={classes.textContent}>
          <div>
            <img src="/images/foodwaste.jpg" alt={texts.foodwaste_chart_alt} />
          </div>
          {texts.food_waste_text}
        </Typography>
        <Typography component="h2" variant="h2" className={classes.headline}>
          {texts.lab_grown_meat_could_be_a_game_changer}
        </Typography>
        <Typography className={classes.textContent}>
          {texts.lab_grown_meat_could_be_a_game_changer_text}
        </Typography>
        <Typography component="h2" variant="h2" className={classes.headline}>
          {texts.scalable_solutions_needed}
        </Typography>
        <Typography className={classes.textContent}>
          {texts.scalable_solutions_needed_text}
          <br />
          <Typography className={classes.callToAction}>{texts.food_call_to_action}</Typography>
        </Typography>
        <div className={classes.sources}>
          {texts.sources}:
          <ul>
            <li>
              <Link href="https://ourworldindata.org/food-choice-vs-eating-local">
                https://ourworldindata.org/food-choice-vs-eating-local
              </Link>
            </li>
            <li>
              <Link href="https://ourworldindata.org/environmental-impacts-of-food">
                https://ourworldindata.org/environmental-impacts-of-food
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </ThemeProvider>
  );
}
