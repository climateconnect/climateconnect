import React from "react";
import { Typography, makeStyles, ThemeProvider, useMediaQuery, Link } from "@material-ui/core";
import hubTheme from "../../../themes/hubTheme";
import Chart from "react-google-charts";
import theme from "../../../themes/theme";

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
  const isNarrowScreen = useMediaQuery(theme.breakpoints.down("xs"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down("sm"));
  console.log(isMediumScreen);
  return (
    <ThemeProvider theme={hubTheme}>
      <div>
        <Typography component="h2" variant="h2" className={classes.headline}>
          Fast fashion is harming our planet
        </Typography>
        <Typography className={classes.textContent}>
          The increase in textile production and fashion consumption is reflected in the success of
          fast fashion, a business model that offers trendy novelties with a high frequency, usually
          at very low costs. This mechanism impels customers to buy more, wear the product maybe a
          couple of times and then get rid of it, resulting in large amounts of textile waste, most
          of which is incinerated, landfilled or exported to developing countries. As a result,
          fashion brands are now producing almost twice the amount of clothing today compared with
          before the year 2000.
          <br />
          <br />
          As globalization opened up commerce worldwide, the supply chain and the management of
          resources have become increasingly complex and difficult to track down. Each production
          step has an environmental impact due to water, material, chemical and energy use and the
          consequences are clearly visible.
        </Typography>
        <div className={classes.pieChartsContainer}>
          <Chart
            width={isNarrowScreen ? "330px" : isMediumScreen ? "400px" : "500px"}
            height={"300px"}
            chartType="PieChart"
            loader={<div>Loading Chart</div>}
            data={[
              ["Production step", "Percent of total ghg emissions"],
              ["Garment production", 50],
              ["Yarn production", 19],
              ["User phase", 19],
              ["Distribution and retailing", 4],
              ["Cotton production", 8],
            ]}
            options={{
              title: "CO2-emissions of a T-shirt",
              pieStartAngle: 180,
            }}
            rootProps={{ "data-testid": "1" }}
          />
          <Chart
            width={isNarrowScreen ? "330px" : isMediumScreen ? "400px" : "500px"}
            height={"300px"}
            chartType="PieChart"
            loader={<div>Loading Chart</div>}
            data={[
              ["Production step", "Percent of total ghg emissions"],
              ["Garment production", 57],
              ["Yarn production", 10],
              ["User phase", 20],
              ["Distribution and retailing", 4],
              ["Cotton production", 9],
            ]}
            options={{
              title: "CO2-emissions of a pair of jeans",
              pieStartAngle: 180,
            }}
            rootProps={{ "data-testid": "2" }}
          />
        </div>
        <Typography>
          Source:{" "}
          <Link href="https://www.nature.com/articles/s43017-020-0039-9.epdf" target="_blank">
            Nature
          </Link>{" "}
          (2020)
        </Typography>
        <Typography component="h2" variant="h2" className={classes.headline}>
          Massive increase in carbon emissions
        </Typography>
        <Typography>
          The latest reports estimate the fashion sector to be responsible for an average between
          <b> 8-10% of global greenhouse gas emissions</b>. The data vary according to the source of
          energy used (as coal-based energy accounts for a larger footprint if compared to others).
          The most carbon-heavy production step is the fiber production, regardless of natural or
          synthetic. Cotton fibers, are to be preferred as their plants absorb carbon. Here you can
          choose between conventional and organic cultivation. Conventional cultivation has higher
          CO2-emissions than organic cultivation but the latter requires more water. Transportation,
          moreover, plays an important role as the different production steps occur in different
          countries. When shipping by container boat, transport only accounts for 1% of
          CO2-emissions of a piece of clothing. But when shipping through air cargo to save time,
          transportation in comparison accounts for the 35% in Co2 emissions. Ultimately, the
          emissions during the “use” phase of the clothes (washing, drying and ironing), merge into
          the natural resources consumption.
          <br />
          <b>Solutions:</b>
          <br /> Choosing natural fibers, cultivated with climate friendly agricultural practices
          and processed with renewable energy, grouping the production steps and producing locally
        </Typography>
        <Typography component="h2" variant="h2">
          Water consumption and pollution of natural resources
        </Typography>
        <Typography>
          The fashion industry is a major consumer of water (79 trillion litres per year),
          responsible for around the 20% of industrial water pollution from textile processing, and
          contributes around 35% (190,000 tonnes per year) of oceanic primary microplastic
          pollution. The cultivation of cotton (entailing also land use issues in developing
          countries) represents another important factor, as it contributes to the drain of water
          resources that could be used to improve the {"locals'"} lives. As a matter of fact, the
          environmental damages are most visible in the countries where the production takes place,
          as the lack of regulations allow companies to overlook social responsibility. In Cambodia,
          for example, the fashion industry, which is responsible for 88% of all industrial
          manufacturing (as of 2008), has caused an estimated 60% of water pollution and 34% of
          chemical pollution.
          <br />
          <b>Solutions:</b>
          <br /> It is vital to introduce regulation for the manufacturing of clothing in producing
          countries. Natural resources need to be used consciously
        </Typography>
        <Typography component="h2" variant="h2">
          Chemical pollution and health risks
        </Typography>
        <Typography>
          The textile industry uses over 15,000 different chemicals during the manufacturing
          process, starting from the fibre production. Data reports that, in terms of financial
          value, 6% of global pesticide production is applied to cotton crops, including 16% of
          insecticide use, 4% of herbicides, and more. However, it is very difficult to verify the
          total chemical usage because of the different regulations in each country. As an example,
          approximately 80% of textiles imported in the EU are manufactured outside of the EU,
          making it almost impossible to track down the correct data. As some of these chemicals
          represent a risk to human health, they should be completely avoided in order to protect
          both workers and consumers.
          <br />
          <b>Solutions:</b>
          <br /> It is important to apply safety standards in clothing production. Furthermore
          clothing should be produced without chemicals that pose a risk to human health.
        </Typography>
        <Typography component="h2" variant="h2">
          Textile waste and lack of recycling in the fashion industry
        </Typography>
        <Typography>
          In the life cycle of clothes, waste production starts at the very beginning. Up to 15% of
          fibers and fabrics are wasted in the manufacturing process. This happens due to wrong
          calculations and communications mistakes that often take place because of the distance
          between the design and production facilities. The stock arriving in the shops often
          remains unsold, or is returned becoming mostly a “waste”. This is a fundamental problem
          that every company is facing: Swedish fast-fashion brand{" "}
          <b>H&M was reported to hold $4.3 billion worth of unsold products</b> in warehouses,
          following reports of the company incinerating them at a waste-to-energy plant in Denmark.
          Online shopping returns, in particular clothes, have a massive return rate, between 40-50%
          as people order different products just to try the best fitting as they would do in a
          shop, thinking that the product will go back directly on the shelf again but in reality
          the majority can’t be resold as new. According to Optoro, a company that helps manage the
          returns, Americans send back each year 3.5 billion products, of which 5 billion pounds of
          them go to the landfill, causing 15 million metric tons of carbon dioxide into the
          atmosphere.
          <br />
          Finally, used clothes end up in landfills, accounting for up to 22% of mixed waste
          worldwide. Exporting these items is no longer an option as developing countries are
          banning its import to protect their production or due to oversaturation. Recycling is a
          practice that remains still low: only 15% of textile waste was collected separately for
          recycling purposes in 2015, and less than 1% of total production was recycled in closed
          loop.
          <b>Solutions:</b>
          <br /> Buying and returning less is a big way to lower ghg emissions from textile waste.
          By finding ways to extend the life of a product the demand will naturally go down as new
          clothes will be needed less often.
          <Typography component="h2" variant="h2">
            Multiple solutions for a common goal
          </Typography>
          <Typography>
            To prevent clothing waste and implement sustainable models require a double action:
            proactive, which means preventing and reducing, and reactive, in terms of reusing,
            recycling and disposing.
            <br />
            <br />
            The first priority to change the fashion industry is the proactive prevention of waste
            production, which requires new design–production–marketing logic. The textile industry
            needs to rethink its business models, using renewable energy and reducing production
            volumes as natural resources are scarce by definition. As customers, we should change
            our habits and avoid impulsive shopping, by consciously choosing sustainable brands and
            investing in durability.
            <br />
            <br />
            The second priority is to establish a circular economy model in order to develop a
            sustainable production. Recycling needs to be addressed at every step in order to
            minimize waste, as well as supporting a sharing economy through second-hand shops,
            swaps, repairing and all the activities that aim to extend the lifetime of our clothes.
            <br />
            <br />
            The financial pressure and the tough competition makes it difficult for companies to
            change this model, that’s why we need also to address policymakers to help in the
            transition. We need to understand that the only possible solution is to take
            responsibility not only as consumers, but especially as citizens. The first step towards
            progress begins with us!
          </Typography>
          <div className={classes.imgWrapper}>
            <img src="/images/circular_economy.jpg" className={classes.img} />
          </div>
        </Typography>
      </div>
    </ThemeProvider>
  );
}
