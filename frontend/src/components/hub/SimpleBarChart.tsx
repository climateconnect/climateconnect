import React from "react";
import { Typography } from "@mui/material";

import makeStyles from "@mui/styles/makeStyles";

const useStyles = makeStyles((theme) => ({
  title: {
    color: theme.palette.secondary.main,
    fontWeight: 700,
  },
  chartContainer: {
    display: "flex",
  },
  labels: {
    height: 40,
  },
  bars: {
    flexGrow: 100,
  },
  barContainer: {
    height: 40,
    display: "flex",
    alignItems: "center",
  },
  bar: (props) => ({
    width: `${props.barWidth}%`,
    height: 25,
    background: theme.palette.primary.main,
    display: "flex",
    justifyContent: "flex-end",
  }),
  label: {
    display: "flex",
    alignItems: "center",
    height: 40,
    marginRight: theme.spacing(2),
    color: theme.palette.primary.main,
    justifyContent: "flex-end",
    fontWeight: 600,
  },
  unit: {
    color: "white",
    marginRight: theme.spacing(1),
  },
  unitOutsideBar: {
    color: theme.palette.secondary.main,
    marginLeft: theme.spacing(1),
    fontWeight: 600,
  },
}));

export default function SimpleBarChart({ config, className, labelsOutSideBar, title }) {
  const classes = useStyles();
  const data = config.data;
  const biggestValue = Math.max.apply(
    Math,
    data.map((d) => parseFloat(d.value))
  );
  const maxValue = labelsOutSideBar ? biggestValue * 1.3 : biggestValue * 1.1;
  return (
    <div className={`${classes.root} ${className}`}>
      <Typography className={classes.title}>{title}</Typography>
      <div className={classes.chartContainer}>
        <div className={classes.labels}>
          {data.map((dp, index) => (
            <Typography className={classes.label} key={index}>
              {dp.label}
            </Typography>
          ))}
        </div>
        <div className={classes.bars}>
          {data.map((dp, index) => {
            return (
              <React.Fragment key={index}>
                <Bar
                  value={dp.value}
                  unit={config.unit}
                  maxValue={maxValue}
                  labelsOutSideBar={labelsOutSideBar}
                />
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const Bar = ({ value, unit, maxValue, labelsOutSideBar }) => {
  const classes = useStyles({ barWidth: (value / maxValue) * 100 });
  return (
    <div className={classes.barContainer}>
      <div className={classes.bar}>
        {!labelsOutSideBar && (
          <Typography className={classes.unit}>{`${value} ${unit}`}</Typography>
        )}
      </div>
      {labelsOutSideBar && (
        <Typography className={classes.unitOutsideBar}>{`${value} ${unit}`}</Typography>
      )}
    </div>
  );
};
