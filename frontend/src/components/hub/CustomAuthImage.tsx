import React, { useContext } from "react";
import { makeStyles } from "@mui/styles";
import Image from "next/image";

type Props = { hubUrl: string | undefined; texts: any };

const PRIO1_SLUG = "prio1";

const useStyles = makeStyles((theme) => ({
  prio1root: {
    marginRight: theme.spacing(5),
    fontSize: theme.typography.h5.fontSize,
  },
}));

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
