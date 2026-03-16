import React, { ReactElement } from "react";
import { makeStyles } from "@mui/styles";
import Image from "next/legacy/image";
import { Theme } from "@mui/material/styles";

type Props = { hubUrl: string | undefined; texts: any | null; authStep?: string };

const PRIO1_SLUG = "prio1";
const PERTH_SLUG = "perth";

const useStyles = makeStyles((theme: Theme) => ({
  prio1root: {
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
    marginTop: theme.spacing(6),
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
  prio1_text: {
    marginTop: theme.spacing(4),
    [theme.breakpoints.up("xl")]: {
      marginRight: "clamp(2rem,15rem - 2vw, 15rem)",
    },
  },
}));

function isNumber(value: any): boolean {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

export default function CustomAuthImage({ hubUrl, texts, authStep }: Props): ReactElement | null {
  if (!hubUrl) {
    return <DefaultAuthImage authStep={authStep} />;
  }

  switch (hubUrl.toLowerCase()) {
    case PRIO1_SLUG: {
      return <AuthImage texts={texts} hubSlug={PRIO1_SLUG} logoSrc="/images/logo_white.png" />;
    }
    case PERTH_SLUG: {
      return (
        <AuthImage
          texts={texts}
          hubSlug={PERTH_SLUG}
          authStep={authStep}
          logoSrc="/images/logo.svg"
        />
      );
    }
    default: {
      return <DefaultAuthImage authStep={authStep} />;
    }
  }
}

function AuthImage({
  texts,
  hubSlug,
  authStep,
  logoSrc,
}: {
  texts: any;
  hubSlug: string;
  authStep?: string;
  logoSrc: string;
}): ReactElement {
  const classes = useStyles();
  return authStep ? (
    <DefaultAuthImage authStep={authStep} />
  ) : (
    <div className={classes.prio1root}>
      <div className={classes.prio1_imageContainer}>
        <img
          src={`/images/hub_logos/ch_${hubSlug}_logo.svg`}
          alt={texts.climate_connect_logo}
          className={classes.prio1_image}
        />
        <div className={classes.prio1_X}>X</div>
        <img src={logoSrc} alt={texts.climate_connect_logo} className={classes.prio1_image} />
      </div>

      <p className={classes.prio1_text}>
        <b>
          <i>{texts.auth_image_subtitle}</i>
        </b>
      </p>
    </div>
  );
}

function DefaultAuthImage({ authStep }: { authStep?: string }): ReactElement {
  const finalSrc =
    authStep === "interestAreaInfo"
      ? "/images/sign_up/Questions-pana.svg"
      : "/images/sign_up/mobile-login-pana.svg";

  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: "1" }}>
      <Image
        src={finalSrc}
        alt="Sign Up"
        layout="fill" // Image will cover the container
        objectFit="contain" // Ensures it fills without stretching
      />
    </div>
  );
}
