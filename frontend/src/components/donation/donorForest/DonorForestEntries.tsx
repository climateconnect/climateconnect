import { Container } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React from "react";
import DonorForestEntry from "./DonorForestEntry";

const useStyles = makeStyles((theme) => ({
  forest: {
    display: "grid",
    gridTemplateColumns: "repeat(12, 1fr)",
    gridColumnGap: "2px",
    gridRowGap: 5,
    alignItems: "baseline",
    justifyItems: "center",
    "& div": {
      gridColumn: "span 2",
      [theme.breakpoints.down("md")]: {
        gridColumn: "span 3",
      },
    },
    "& div:nth-child(12n+7), div:nth-child(12n+11)": {
      [theme.breakpoints.up("md")]: {
        gridColumn: "span 3",
      },
    },
    "& div:nth-child(7n+5), & div:nth-child(7n+6), div:nth-child(7n+7)": {
      [theme.breakpoints.down("md")]: {
        gridColumn: "span 4",
      },
    },
    paddingBottom: theme.spacing(10),
  },
}));

export default function DonorForestEntries({ donors }) {
  const classes = useStyles();
  return (
    <Container className={classes.forest}>
      {donors.map((d, i) => (
        <DonorForestEntry donor={d} key={i} />
      ))}
    </Container>
  );
}
