import React from "react";
import { Theme } from "@mui/material/styles";
import makeStyles from "@mui/styles/makeStyles";

const useStyles = makeStyles<Theme>((theme) => {
  return {
    imageContainer: {
      [theme.breakpoints.down("sm")]: {
        marginBottom: theme.spacing(1),
      },
      position: "relative",
      backgroundImage: `url(/images/faq-header-right.png), url(/images/faq-header-left.png)`,
      backgroundSize: "auto 100%, auto 100%",
      backgroundPosition: "100% 100%, 0% 0%",
      backgroundRepeat: "no-repeat, repeat",
      width: "100%",
      height: 95,
    },
  };
});

type HeaderImageProps = {
  children?: React.ReactNode;
  className?: string;
};

export default function HeaderImage({ children, className }: HeaderImageProps) {
  const classes = useStyles();
  return <div className={`${classes.imageContainer} ${className || ""}`}>{children}</div>;
}
