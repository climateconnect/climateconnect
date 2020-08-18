import React from "react";
import { Box, Tooltip } from "@material-ui/core";
import PlaceIcon from "@material-ui/icons/Place";
import { makeStyles } from "@material-ui/core/styles";
import MiniOrganizationPreview from "../organization/MiniOrganizationPreview";
import MiniProfilePreview from "../profile/MiniProfilePreview";
import ExploreIcon from "@material-ui/icons/Explore";

const useStyles = makeStyles(theme => ({
  creatorImage: {
    height: 20,
    marginRight: theme.spacing(1),
    marginBottom: -5
  },
  cardIcon: {
    verticalAlign: "bottom",
    marginBottom: -2,
    marginTop: 2,
    marginRight: theme.spacing(0.5)
  },
  creator: {
    marginBottom: 5
  },
  status: {
    marginTop: theme.spacing(1)
  },
  infoItem: {
    display: "flex",
    marginTop: theme.spacing(0.5)
  },
  categoryText: {
    marginTop: theme.spacing(0.5)
  }
}));

export default function ProjectMetaData({ project }) {
  const classes = useStyles();
  const project_parent = project.project_parents[0];
  return (
    <Box>
      {project_parent && project_parent.parent_organization && (
        <MiniOrganizationPreview
          className={classes.creator}
          organization={project_parent.parent_organization}
          size="small"
          nolink
        />
      )}
      {project_parent && !project_parent.parent_organization && project_parent.parent_user && (
        <MiniProfilePreview
          className={classes.creator}
          profile={project_parent.parent_user}
          size="small"
          nolink
        />
      )}
      <Box>
        <Tooltip title="Location">
          <PlaceIcon className={classes.cardIcon} />
        </Tooltip>
        {project.location}
        <div className={classes.infoItem}>
          <Tooltip title="Categories">
            <ExploreIcon className={classes.cardIcon} />
          </Tooltip>{" "}
          <span className={classes.categoryText}>
            {project.tags.map(t => t.project_tag.name)[0]}
          </span>
        </div>
      </Box>
    </Box>
  );
}
