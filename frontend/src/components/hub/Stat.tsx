import React from "react";
import { Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import theme from "../../themes/theme";
import { PieChart } from "react-minimal-pie-chart";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const useStyles = makeStyles((theme) => ({
  pieChartContainer: {
    display: "flex",
    marginBottom: theme.spacing(2),
  },
  chartInfo: {
    marginLeft: theme.spacing(2),
  },
  chartInfoHeadline: {
    fontWeight: "bold",
    fontSize: 25,
  },
  pieChart: {
    maxWidth: 100,
  },
  chartInfoDescription: {
    fontSize: 16,
  },
  footnote: {
    fontSize: 14,
  },
  infoIcon: {
    fontSize: 19,
    marginBottom: -4,
    marginRight: theme.spacing(0.25),
  },
}));

export default function Stat({ statData }) {
  const classes = useStyles();
  const data = [
    { value: parseInt(statData.value), title: statData.name, color: theme.palette.primary.main },
    { value: 100 - parseInt(statData.value), title: "Rest", color: "#D6D6D6" },
  ];
  return (
    <div>
      <div className={classes.pieChartContainer}>
        <PieChart data={data} lineWidth={30} startAngle={270} className={classes.pieChart} />
        <div className={classes.chartInfo}>
          <Typography color="primary" className={classes.chartInfoHeadline}>
            {statData.value}
          </Typography>
          <div>
            <Typography className={classes.chartInfoDescription}>
              {statData.value_description}
            </Typography>
          </div>
        </div>
      </div>
      {statData.description && (
        <Typography className={classes.footnote}>
          <InfoOutlinedIcon className={classes.infoIcon} />
          {`${statData.description}`}
        </Typography>
      )}
    </div>
  );
}
