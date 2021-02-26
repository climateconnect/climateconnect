import React from "react";
import { makeStyles, Typography, Link, ThemeProvider } from "@material-ui/core";
import SimpleBarChart from "../SimpleBarChart";
import hubTheme from "../../../themes/hubTheme";

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
  return (
    <ThemeProvider theme={hubTheme}>
      <div className={classes.root}>
        <Typography component="h2" variant="h2" className={classes.headline}>
          Animal products are especially harmful to our climate
        </Typography>
        <Typography className={classes.textContent}>
          So what is causing the environmental footprint of food to be so large? By rule of thumb
          animal products usually cause more greenhouse gasses than plants. This is because
          additionally to keeping the animals you also need to grow plants to feed them. This
          results in much higher emissions than just eating the plants directly. Every day forests
          are cut down to grow animal feed and create new grazing land. Beef and dairy products are
          especially bad for the climate because cows produce large amounts of methane, a much more
          potent greenhouse gas than CO2.
        </Typography>
        <SimpleBarChart
          config={chart2Config}
          labelsOutSideBar
          className={classes.chart}
          title="Greenhouse gas emissions per 1000 kilocalories"
        />
        <Typography component="h2" variant="h2" className={classes.headline}>
          Vegan and vegetarian diets are most climate-friendly
        </Typography>
        <Typography className={classes.textContent}>
          As countries became more wealthy their meat consumption also increased drastically. As
          seen in the graph below we can drastically lower the carbon footprint of food by eating a
          vegan or vegatarian diet. But even lowering meat and dairy products can have a great
          impact and at scale can be more effective than a few people going vegan. Currently a diet
          harmful to the climate is incentivized more than a climate friendly diet. According to{" "}
          <Link href="https://www.greenpeace.org/eu-unit/issues/nature-food/1803/feeding-problem-dangerous-intensification-animal-farming/">
            research by Greenpeace
          </Link>{" "}
          the EU is currently spending around 71% of its farmland to feed livestock which is only
          possible because animal agriculture is subsidised with over € 28 billion per year.
        </Typography>
        <SimpleBarChart
          config={chart1Config}
          className={classes.chart}
          labelsOutSideBar
          title="Average daily CO2e-emissions of different diets"
        />
        <Typography component="h2" variant="h2" className={classes.headline}>
          Buying seasonal food has a bigger climate impact than buying local food
        </Typography>
        <Typography className={classes.textContent}>
          Transport only accounts for 6% of the greenhouse gas emissions caused by food. In beef
          from beef herds it is only 0.5%! Buying local contributes to the local econogy (which is
          great too) but considering the urgency of fixing our climate it is very important to focus
          on what actually makes a difference. It’s even sometimes more climate friendly to buy
          products from other countries, produced in acquaintance with the local climate, than in
          your country but using greenhouses. To illustrate this with some numbers:{" "}
          <Link src="https://www.sciencedirect.com/science/article/abs/pii/S0921800902002616">
            a study{" "}
          </Link>{" "}
          from Sweden shows that tomatoes produced in local greenhouses in Sweden outside of the
          season use 10 times more energy as importing tomatoes from Southern europe where they were
          in-season. This is mainly because heating greenhouses uses a lot of energy.
        </Typography>
        <Typography component="h2" variant="h2" className={classes.headline}>
          Food waste is responsible for 23% of emissions caused by food
        </Typography>
        <Typography className={classes.textContent}>
          <div>
            <img src="/images/foodwaste.jpg" alt="Bar chart shows that foodproduction is responsible for 26% of co2 emissions from which 6% food is never eaten" />
          </div>
          Around 30% of all food is wasted. This accounts for 6% of total greenhouse gas emissions!
          Other than the enormous and pointless aspect of those emissions, it seems important to
          remind that, today, more than 800 million people are still suffering from
          undernourishment. But food wastes could no longer be a problem. As consumers it’s pretty
          easy to take individual action by looking after our food and avoiding losses. And we are
          not alone in this fight. Many public and private actors are already taking actions, by
          creating mobile apps to manage individual and private food waste, by giving the food you
          don’t need to those who do, or buying the unsolds from restaurants and supermarkets. If we
          collectively start pressing big actors so they change their practices, or bring effective
          concepts to fight food waste to our location, we will be able to greatly reduce these
          pointless losses.
        </Typography>
        <Typography component="h2" variant="h2" className={classes.headline}>
          Lab-grown meat could be a game changer
        </Typography>
        <Typography className={classes.textContent}>
          Additionally to improving our current ways of producing food there are also some
          innovative and potentially game-changing solutions that think out of the box. One example
          that could have a huge impact is lab-grown meat. Lab-grown meat is a real animal muscle
          being grown without having to grow the animal around it. While it sounds a bit weird at
          first producing it on large scale would allow us to stop wasting land and energy and
          forcing animals to grow up in horrible conditions while still being able to eat a product
          that is exactly the same as meat from an animal. Just recently the Singapore Food Acency
          was{" "}
          <Link href="https://www.theguardian.com/environment/2020/dec/02/no-kill-lab-grown-meat-to-go-on-sale-for-first-time">
            the first authority to approve a lab-grown meat product as safe for market
          </Link>
          . While lab-grown meat will be much more expensive when it starts being sold (likely in
          2021) the price will rapidly decrease as larger amounts are produced and more competition
          enters the market. According to{" "}
          <Link href="https://edu.gcfglobal.org/en/thenow/what-is-labgrown-meat/1/">GCFGlobal</Link>{" "}
          Lab grown meat is significantly more climate-friendly as it requires 45% less energy,
          99%(!) less land use, and produces 96% fewer greenhouse gas emissions.
        </Typography>
        <Typography component="h2" variant="h2" className={classes.headline}>
          We need scalable solution to reduce emissions from food in time
        </Typography>
        <Typography className={classes.textContent}>
          Making changes in our personal life makes a difference but we {"don't"} have time to wait
          for a cultural change of behavior to happen. We need to get active beyond the scope of our
          personal lifes and support innovative climate solutions. On Climate Connect you can find
          climate solutions in the food sector that other climate actors are working on. If you find
          a solution that could also work in your location, contact the creator of the solution
          directly through Climate Connect and ask them what it would take for you to bring this
          solution to your location. Only by spreading the most effective solutions we have a chance
          to stay under 1.5 °C temperature change. If you find an impactful solution from your
          location, contact them to offer them your help or give them some valuable feedback through
          the comments.
          <br />
          <Typography className={classes.callToAction}>
            {"Let's"} work together on fixing out planet! Click on {'"Show solution"'} below!
          </Typography>
        </Typography>
        <div className={classes.sources}>
          Sources:
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

const chart1Config = {
  unit: "kg CO2e / day",
  data: [
    {
      label: "Meat lover",
      value: 7.19,
    },
    {
      label: "Low meat diet",
      value: 4.67,
    },
    {
      label: "Vegetarian",
      value: 3.81,
    },
    {
      label: "Vegan",
      value: 2.89,
    },
  ],
};

const chart2Config = {
  unit: "kg",
  data: [
    {
      label: "Beef (beef herd)",
      value: 36.44,
    },
    {
      label: "Beef (dairy herd)",
      value: 12.2,
    },
    {
      label: "Fish (farmed)",
      value: 7.61,
    },
    {
      label: "Cheese",
      value: 6.17,
    },
    {
      label: "Pig Meat",
      value: 5.15,
    },
    {
      label: "Eggs",
      value: 3.24,
    },
    {
      label: "Rice",
      value: 1.21,
    },
    {
      label: "Oatmeal",
      value: 0.95,
    },
    {
      label: "Potatoes",
      value: 0.63,
    },
    {
      label: "Nuts",
      value: 0.07,
    },
  ],
};
