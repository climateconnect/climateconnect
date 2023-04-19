import React from "react";
import makeStyles from "@mui/styles/makeStyles";

type MakeStylesProps = {
  noPadding?: boolean;
};

const useStyles = makeStyles((theme) => ({
  iconContainer: {
    width: 40,
  },
  icon: {
    width: "100%",
  },
  leftWrapper: (props: MakeStylesProps) => ({
    padding: props.noPadding ? 0 : theme.spacing(4),
    paddingTop: props.noPadding ? 0 : theme.spacing(1),
    paddingBottom: 0,
  }),
}));

type Props = {
  src: string;
  noPadding?: boolean;
};

export default function IconWrapper({ src, noPadding }: Props) {
  const classes = useStyles({ noPadding: noPadding });
  return (
    <div className={classes.leftWrapper}>
      <div className={classes.iconContainer}>
        <img className={classes.icon} src={src} />
      </div>
    </div>
  );
}
