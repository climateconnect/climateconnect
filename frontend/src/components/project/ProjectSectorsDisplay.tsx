import { Theme, Tooltip, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import ExploreIcon from "@mui/icons-material/Explore";
import React, { useContext } from "react";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";

const useStyles = makeStyles<Theme, { hovering?: boolean }>((theme) => ({
  sectors: (props) => ({
    display: "flex",
    marginBottom: theme.spacing(0.75),
    background: props.hovering ? "#e1e1e147" : "auto",
    padding: props.hovering ? theme.spacing(2) : 0,
    paddingTop: props.hovering ? theme.spacing(1) : 0,
    paddingBottom: props.hovering ? theme.spacing(1) : 0,
    alignItems: "center",
  }),
  sectorText: {
    marginLeft: theme.spacing(0.5),
    fontSize: 15,
    maxWidth: "250px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  icon: {
    fontSize: 17,
  },
}));

export default function ProjectSectorsDisplay({
  main_project_sector,
  hovering,
  projectSectorClassName,
  color,
  iconClassName,
  className,
}: any) {
  const classes = useStyles({ hovering: hovering });
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale: locale });
  return (
    <Tooltip title={texts.sectors}>
      <div className={`${classes.sectors} ${className}`}>
        <ExploreIcon
          className={`${iconClassName ? iconClassName : classes.icon}`}
          color={color && color}
        />{" "}
        <Typography className={`${classes.sectorText} ${projectSectorClassName}`}>
          {main_project_sector}
        </Typography>
      </div>
    </Tooltip>
  );
}
