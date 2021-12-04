import { Box, Collapse, Container, Tooltip, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import PlaceIcon from "@material-ui/icons/Place";
import React, { useContext } from "react";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import MiniOrganizationPreview from "../organization/MiniOrganizationPreview";
import MiniProfilePreview from "../profile/MiniProfilePreview";
import LocationDisplay from "./LocationDisplay";
import ProjectCategoriesDisplay from "./ProjectCategoriesDisplay";

const useStyles = makeStyles((theme) => ({
  creatorImage: {
    height: 20,
    marginRight: theme.spacing(1),
    marginBottom: -5,
  },
  cardIcon: {
    verticalAlign: "bottom",
    marginBottom: -2,
    marginTop: 2,
    marginRight: theme.spacing(0.5),
    fontSize: "default",
  },
  status: {
    marginTop: theme.spacing(1),
  },
  categories: (props) => ({
    display: "flex",
    marginTop: theme.spacing(0.5),
    background: props.hovering ? "#e1e1e147" : "auto",
    padding: props.hovering ? theme.spacing(2) : 0,
    paddingTop: props.hovering ? theme.spacing(1) : 0,
    paddingBottom: props.hovering ? theme.spacing(1) : 0,
  }),
  categoryText: {
    marginTop: theme.spacing(0.5),
  },
  metadataText: {
    display: "inline",
    fontSize: 14,
  },
  shortDescription: {
    fontSize: 13,
    marginTop: theme.spacing(1.5),
    marginBottom: theme.spacing(1),
  },
  wrapper: (props) => ({
    padding: theme.spacing(2),
    paddingTop: 0,
    paddingBottom: props.hovering ? theme.spacing(0.5) : "auto",
  }),
}));

export default function ProjectMetaData({ project, hovering, withDescription }) {
  const classes = useStyles({ hovering: hovering });
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale: locale });
  const project_parent = project.project_parents[0];
  const main_project_tag = project.tags.map((t) => t.project_tag.name)[0];
  if (withDescription) {
    return (
      <WithDescription
        className={classes.WithDescription}
        project_parent={project_parent}
        project={project}
        hovering={hovering}
        main_project_tag={main_project_tag}
        texts={texts}
      />
    );
  }

  return (
    <WithOutDescription
      className={classes.WithDescription}
      project_parent={project_parent}
      project={project}
      main_project_tag={main_project_tag}
      texts={texts}
    />
  );
}

const WithDescription = ({ className, project_parent, hovering, project, main_project_tag }) => {
  const classes = useStyles();
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
          <LocationDisplay
            textClassName={classes.metadataText}
            iconClassName={classes.cardIconFlex}
            location={project.location}
          />
          {/* Defer to MUI's best guess on height calculation for timeout: https://material-ui.com/api/collapse/ */}
          <Collapse in={hovering} timeout="auto">
            <Typography className={classes.shortDescription}>
              {project.short_description}
            </Typography>
          </Collapse>
          {!hovering && (
            <ProjectCategoriesDisplay
              main_project_tag={main_project_tag}
              projectTagClassName={classes.metadataText}
              iconClassName={classes.cardIcon}
            />
          )}
        </Box>
      </Container>
      {hovering && (
        <ProjectCategoriesDisplay
          main_project_tag={main_project_tag}
          hovering={hovering}
          projectTagClassName={classes.metadataText}
          iconClassName={classes.cardIcon}
        />
      )}
    </Box>
  );
};

const WithOutDescription = ({ className, project_parent, project, main_project_tag, texts }) => {
  const classes = useStyles();
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
          <Tooltip title={texts.location}>
            <PlaceIcon className={classes.cardIcon} />
          </Tooltip>
          <Typography className={classes.metadataText}>{project.location}</Typography>
          <ProjectCategoriesDisplay
            main_project_tag={main_project_tag}
            projectTagClassName={classes.metadataText}
            iconClassName={classes.cardIcon}
          />
        </Box>
      </Container>
    </Box>
  );
};
