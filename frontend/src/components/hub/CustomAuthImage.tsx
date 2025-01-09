import React from "react";
import { makeStyles } from "@mui/styles";
import Image from "next/image";

type Props = { hubUrl: string | undefined; texts: any };

const PRIO1_SLUG = "prio1";

const useStyles = makeStyles((theme) => ({
  prio1root: {
    marginRight: theme.spacing(5),
    fontSize: theme.typography.h5.fontSize,
    lineHeight: isNumber(theme.typography.h5.lineHeight)
      ? (theme.typography.h5.lineHeight as number) - 0.2
      : 0.8,
  },
  prio1_X: {
    fontSize: "8rem",
    fontWeight: "bold",
    fontStyle: "italic",
    [theme.breakpoints.down("xl")]: {
      fontSize: "5rem",
    },
    [theme.breakpoints.down("lg")]: {
      fontSize: "4rem",
    },
  },
  prio1_imageContainer: {
    height: "6rem",
    display: "flex",
    flexDirection: "row",
    gap: "1rem",
    justifyContent: "left",
    alignItems: "center",

    [theme.breakpoints.down("xl")]: {
      height: "5rem",
    },
    [theme.breakpoints.down("lg")]: {
      height: "4rem",
    },
  },
  prio1_image: {
    height: "100%",
  },
}));

function isNumber(value: any): boolean {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

export default function CustomAuthImage({ hubUrl, texts }: Props): JSX.Element | null {
  if (!hubUrl) {
    console.log("undefined");
    return <DefaultAuthImage />;
  }

  switch (hubUrl.toLowerCase()) {
    case PRIO1_SLUG: {
      return <Prio1AuthImage texts={texts} />;
    }
  }

  return <DefaultAuthImage />;
}

function Prio1AuthImage({ texts }) {
  const classes = useStyles();

  return (
    <div className={classes.prio1root}>
      <div className={classes.prio1_imageContainer}>
        <img
          src="/images/prio1.png"
          alt={texts.climate_connect_logo}
          className={classes.prio1_image}
        />
        <div className={classes.prio1_X}>X</div>
        <img
          src="/images/logo_white.png"
          alt={texts.climate_connect_logo}
          className={classes.prio1_image}
        />
      </div>

      <p>
        <b>
          <i>{texts.auth_image_subtitle}</i>
        </b>
      </p>
    </div>
  );
}

function DefaultAuthImage() {
  return (
    <Image
      src="/images/sign_up/mobile-login-pana.svg"
      alt="Sign Up"
      layout="fill" // Image will cover the container
      objectFit="contain" // Ensures it fills without stretching
    />
  );
}
