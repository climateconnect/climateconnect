import { makeStyles, Tooltip, Typography } from "@material-ui/core";
import ExploreIcon from "@material-ui/icons/Explore";
import React, { useContext } from "react";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";

const useStyles = makeStyles((theme) => ({
  categories: (props) => ({
    display: "flex",
    marginTop: theme.spacing(0.5),
    background: props.hovering ? "#e1e1e147" : "auto",
    padding: props.hovering ? theme.spacing(2) : 0,
    paddingTop: props.hovering ? theme.spacing(1) : 0,
    paddingBottom: props.hovering ? theme.spacing(1) : 0,
    alignItems: "center",
  }),
  categoryText: {
    marginLeft: theme.spacing(0.5),
    fontSize: 15,
  },
  icon: {
    fontSize: 17,
  },
}));

export default function ProjectCategoriesDisplay({
  main_project_tag,
  hovering,
  projectTagClassName,
  color,
  iconClassName,
  className,
}) {
  const classes = useStyles({ hovering: hovering });
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale: locale });
  return (
    <Tooltip title={texts.categories}>
      <div className={`${classes.categories} ${className}`}>
        <ExploreIcon
          className={`${iconClassName ? iconClassName : classes.icon}`}
          color={color && color}
        />{" "}
        <Typography className={`${classes.categoryText} ${projectTagClassName}`}>
          {main_project_tag}
        </Typography>
      </div>
    </Tooltip>
  );
}
