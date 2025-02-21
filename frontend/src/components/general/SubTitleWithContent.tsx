import makeStyles from "@mui/styles/makeStyles";
import { Theme } from "@mui/material";

const useStyles = makeStyles<Theme>((theme) => ({
  subtitleWithIcon: {
    display: "flex",
    alignItems: "center",
    fontWeight: 700,
    minWidth: 200,
    fontSize: 15,
  },
  subtitle: {
    fontWeight: "bold",
  },
  content: {
    paddingBottom: theme.spacing(2),
    // color: `${theme.palette.secondary.main}`,
    fontSize: 16,
    wordBreak: "break-word",
  },
  marginRight: {
    marginRight: theme.spacing(0.5),
  },
  iconAndTitleWrapper: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(0.5),
  },
}));

export default function SubTitleWithContent({
  subTitleIcon,
  subtitle,
  content,
}: {
  subTitleIcon?: { icon: any };
  subtitle: string;
  content: string;
}) {
  const classes = useStyles();
  return (
    <>
      <div className={`${subTitleIcon ? classes.subtitleWithIcon : classes.subtitle}`}>
        {subTitleIcon?.icon ? (
          <div className={classes.iconAndTitleWrapper}>
            <subTitleIcon.icon />
            <div className={classes.marginRight} />
            {subtitle}
          </div>
        ) : (
          <>{subtitle}</>
        )}
      </div>
      <div className={classes.content}>{content}</div>
    </>
  );
}
