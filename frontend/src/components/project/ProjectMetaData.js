import React from "react";
import { Box, Tooltip, Typography, Container, Collapse } from "@material-ui/core";
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
  status: {
    marginTop: theme.spacing(1)
  },
  categories: props => ({
    display: "flex",
    marginTop: theme.spacing(0.5),
    background: props.hovering ? "#E1E1E1" : "auto",
    padding: props.hovering ? theme.spacing(2) : 0,
    paddingTop: props.hovering ? theme.spacing(1) : 0,
    paddingBottom: props.hovering ? theme.spacing(1) : 0
  }),
  categoryText: {
    marginTop: theme.spacing(0.5)
  },
  metadataText: {
    display: "inline",
    fontSize: 14
  },
  shortDescription: {
    fontSize: 13,
    marginTop: theme.spacing(1.5),
    marginBottom: theme.spacing(1)
  },
  wrapper: props => ({
    padding: theme.spacing(2),
    paddingTop: 0,
    paddingBottom: props.hovering ? theme.spacing(0.5) : "auto"
  })
}));

export default function ProjectMetaData({ project, hovering, withDescription }) {
  const classes = useStyles({ hovering: hovering });
  const project_parent = project.project_parents[0];
  const main_project_tag = project.tags.map(t => t.project_tag.name)[0];
  return (
    <div>
      {withDescription ?
        <WithDescription
          className={classes.WithDescription}
          project_parent={project_parent}
          project={project}
          hovering={hovering}
          main_project_tag={main_project_tag}
        />
      :
        <WithOutDescription 
          className={classes.WithDescription}
          project_parent={project_parent}
          project={project}
          main_project_tag={main_project_tag}
        />
      }
    </div>
  );
}

const WithDescription = ({ className, project_parent, hovering, project, main_project_tag}) => {
  const classes = useStyles()
  return (
    <Box className={className}>
      <Container className={classes.wrapper}>
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
          <Typography className={classes.metadataText}>{project.location}</Typography>
          <Collapse in={hovering} timeout={500}>
            <Typography className={classes.shortDescription}>
              {project.short_description}
            </Typography>
          </Collapse>
          {!hovering && <Categories main_project_tag={main_project_tag} />}
        </Box>
      </Container>
      {hovering && <Categories main_project_tag={main_project_tag} hovering={hovering} />}
    </Box>
  )
}

const WithOutDescription = ({ className, project_parent, project, main_project_tag}) => {
  const classes = useStyles()
  return (
    <Box className={className}>
      <Container className={classes.wrapper}>
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
          <Typography className={classes.metadataText}>{project.location}</Typography>
          <Categories main_project_tag={main_project_tag} />
        </Box>
      </Container>
    </Box>
  )
}

const Categories = ({ main_project_tag, hovering }) => {
  const classes = useStyles({ hovering: hovering });
  return (
    <div className={classes.categories}>
      <Tooltip title="Categories">
        <ExploreIcon className={classes.cardIcon} />
      </Tooltip>{" "}
      <Typography className={`${classes.categoryText} ${classes.metadataText}`}>
        {main_project_tag}
      </Typography>
    </div>
  );
};
