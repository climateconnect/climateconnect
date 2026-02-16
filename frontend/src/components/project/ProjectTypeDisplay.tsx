import { Typography, Tooltip } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import LayersIcon from "@mui/icons-material/Layers";
import React, { useContext } from "react";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    alignItems: "center",
  },
  typeIcon: {
    width: 20,
    height: 20,
    marginLeft: 0,
    marginRight: 8,
  },
  layersIcon: {
    fontSize: 18,
    marginLeft: 4,
    color: theme.palette.primary.main,
  },
}));

type Props = {
  projectType: any; //TODO: create projectType type
  className?: any;
  iconClassName?: any;
  textClassName?: any;
  hasChildren?: boolean;
};

export default function ProjectTypeDisplay({
  projectType,
  className,
  iconClassName,
  textClassName,
  hasChildren,
}: Props) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale: locale });

  // Get the localized name based on type_id
  const getLocalizedTypeName = () => {
    if (projectType?.type_id) {
      const translationKey = `project_type_${projectType.type_id}`;
      return texts[translationKey] || projectType.name;
    }
    return projectType?.name || "";
  };

  const typeName = getLocalizedTypeName();

  return (
    <div className={`${className} ${classes.root}`}>
      <img
        src={`/images/project_types/${projectType.type_id}.png`}
        className={iconClassName ? iconClassName : classes.typeIcon}
        alt={typeName}
      />
      <Typography className={textClassName}>{typeName}</Typography>
      {hasChildren && (
        <Tooltip title="This event contains multiple sub-events">
          <LayersIcon className={classes.layersIcon} />
        </Tooltip>
      )}
    </div>
  );
}
