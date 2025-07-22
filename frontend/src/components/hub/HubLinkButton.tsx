import makeStyles from "@mui/styles/makeStyles";
import { LinkedHub } from "../../types";
import Link from "next/link";
import { Theme } from "@mui/material";

interface StyleProps {
  backgroundColor: string;
  iconUrl: string;
}

const useStyles = makeStyles<Theme, StyleProps>((theme) => ({
  linkedHubsContainer: {
    position: "relative",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    textDecoration: "none",
    width: "100%",
    maxWidth: "200px",
    cursor: "pointer",
    transition: "transform 0.2s ease-out",
    "&:hover": {
      transform: "scale(1.05)",
    },
  },
  title: {
    fontSize: "1.2rem",
    fontWeight: "bold",
    textAlign: "center",
    color: "black",
    width: "100%",
    textDecoration: "none !important",
    backgroundColor: "#EFF5F2",
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(1),
    paddingInline: theme.spacing(3),
    borderRadius: theme.shape.borderRadius,
  },
  iconContainer: {
    position: "absolute",
    left: "50%",
    top: -8,
    transform: "translateX(-50%) translateY(0)",
    alignItems: "center",
    justifyContent: "center",
    width: "50px",
    height: "50px",
    borderRadius: "50%",
  },
  icon: {
    color: "white",
    width: 50,
    border: "3px solid white",
    borderRadius: "100%"
  },

  iconWrapper: {
    width: "70%",
    height: "70%",
    margin: "15%",
    backgroundColor: "lightgray", // this becomes the stroke/fill color
    maskImage: (props) => `url(${props.iconUrl})`,
    maskRepeat: "no-repeat",
    maskSize: "contain",
    maskPosition: "center",
    WebkitMaskImage: (props) => `url(${props.iconUrl})`,
    WebkitMaskRepeat: "no-repeat",
    WebkitMaskSize: "contain",
    WebkitMaskPosition: "center",
  },
}));

export default function HubLinkButton({ hub }: { hub: LinkedHub }) {
  const backgroundColor = hub.backgroundColor || "lightblue";

  const classes = useStyles({ backgroundColor, iconUrl: hub.icon });

  return (
    <Link href={hub.hubUrl}>
      <div className={`btn btn-primary ${classes.linkedHubsContainer}`}>
        <div className={classes.iconContainer}>
          <img className={classes.icon} src={hub.icon} />
        </div>

        <h3 className={classes.title}>{hub.hubName}</h3>
      </div>
    </Link>
  );
}
