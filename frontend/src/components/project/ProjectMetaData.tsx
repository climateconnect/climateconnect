import { Box, Collapse, Container, Theme, Tooltip, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import PlaceIcon from "@mui/icons-material/Place";
import React, { useContext } from "react";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import MiniOrganizationPreview from "../organization/MiniOrganizationPreview";
import MiniProfilePreview from "../profile/MiniProfilePreview";
import LocationDisplay from "./LocationDisplay";
import ProjectSectorsDisplay from "./ProjectSectorsDisplay";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ModeCommentIcon from "@mui/icons-material/ModeComment";
import { Project } from "../../types";
import BrowseContext from "../context/BrowseContext";
import ProjectTypeDisplay from "./ProjectTypeDisplay";

const useStyles = makeStyles<Theme, { hovering?: boolean }>((theme) => ({
  creatorImage: {
    height: 20,
    marginRight: theme.spacing(1),
    marginBottom: -5,
  },
  creator: {
    wordBreak: "break-word",
    marginBottom: theme.spacing(0.25),
  },
  cardIcon: {
    verticalAlign: "bottom",
    marginRight: theme.spacing(0.5),
    marginLeft: theme.spacing(-0.25),
    fontSize: "default",
    color: theme.palette.background.default_contrastText,
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
    marginLeft: theme.spacing(0.25),
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
  involvedOrganizationsContainer: {
    display: "flex",
    flexDirection: "row",
    marginBottom: theme.spacing(0.5),
  },
  horizontalSpacing: {
    marginLeft: theme.spacing(1),
  },
  additionalInfoIcon: {
    marginRight: theme.spacing(1),
    display: "flex",
    alignItems: "center",
    color: theme.palette.background.default_contrastText,
  },
  additionalInfoContainer: {
    display: "flex",
    flexDirection: "row",
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(-0.25),
  },
  additionalInfoCounter: {
    marginLeft: theme.spacing(0.5),
    color: theme.palette.text.primary,
  },
  typeIcon: {
    width: 20,
    height: 20,
    marginLeft: 2,
    marginRight: 6,
  },
}));

type Props = { project: Project; hovering: boolean; withDescription?: boolean };
export default function ProjectMetaData({ project, hovering, withDescription }: Props) {
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale: locale });
  const project_parent = project.project_parents![0];
  const main_project_sector = project.sectors!.map((t) => t.name)[0];
  console.log("ProjectMetaData", project, project_parent, main_project_sector);
  if (withDescription) {
    return (
      <WithDescription
        // className={classes.WithDescription}
        project_parent={project_parent}
        project={project}
        hovering={hovering}
        main_project_sector={main_project_sector}
        texts={texts}
      />
    );
  }

  return (
    <WithOutDescription
      // className={classes.WithDescription}
      project_parent={project_parent}
      project={project}
      main_project_sector={main_project_sector}
      texts={texts}
    />
  );
}

const WithDescription = ({
  className,
  project_parent,
  hovering,
  project,
  main_project_sector,
}: any) => {
  const classes = useStyles({});
  return (
    <Box className={className}>
      <Container className={classes.wrapper}>
        <CreatorAndCollaboratorPreviews
          collaborating_organization={project.collaborating_organizations}
          project_parent={project_parent}
        />
        <Box>
          <LocationDisplay
            textClassName={classes.metadataText}
            iconClassName={classes.cardIcon}
            location={project.location}
          />
          {/* Defer to MUI's best guess on height calculation for timeout: https://material-ui.com/api/collapse/ */}
          <Collapse in={hovering} timeout="auto">
            <Typography className={classes.shortDescription}>
              {project.short_description}
            </Typography>
          </Collapse>
          {!hovering && (
            <ProjectSectorsDisplay
              main_project_sector={main_project_sector}
              projectSectorClassName={classes.metadataText}
              iconClassName={classes.cardIcon}
            />
          )}
          <AdditionalPreviewInfo project={project} />
        </Box>
      </Container>
      {hovering && (
        <ProjectSectorsDisplay
          main_project_sector={main_project_sector}
          hovering={hovering}
          projectSectorClassName={classes.metadataText}
          iconClassName={classes.cardIcon}
        />
      )}
    </Box>
  );
};

const WithOutDescription = ({
  className,
  project_parent,
  project,
  main_project_sector,
  texts,
}: any) => {
  const classes = useStyles({});
  return (
    <Box className={className}>
      <Container className={classes.wrapper}>
        <CreatorAndCollaboratorPreviews
          collaborating_organization={project.collaborating_organizations}
          project_parent={project_parent}
        />
        <Box>
          <Tooltip title={texts.location}>
            <PlaceIcon className={classes.cardIcon} />
          </Tooltip>
          <Typography className={classes.metadataText}>{project.location}</Typography>
          <ProjectSectorsDisplay
            main_project_sector={main_project_sector}
            projectSectorClassName={classes.metadataText}
            iconClassName={classes.cardIcon}
          />
          <AdditionalPreviewInfo project={project} />
        </Box>
      </Container>
    </Box>
  );
};

const CreatorAndCollaboratorPreviews = ({ collaborating_organization, project_parent }) => {
  const collaborating_organizations = collaborating_organization.slice(0, 2); // only show 2 collaborating orgs
  const classes = useStyles({});
  return (
    <>
      {project_parent && project_parent.parent_organization && (
        <div className={classes.involvedOrganizationsContainer}>
          <MiniOrganizationPreview
            className={classes.creator}
            organization={project_parent.parent_organization}
            size="tiny"
            nolink
          />
          {collaborating_organizations.length > 0 && (
            <>
              <div className={classes.horizontalSpacing} />
              <>{"+"}</>
              <div className={classes.horizontalSpacing} />
              {collaborating_organizations.map((co, index) => (
                <MiniOrganizationPreview
                  key={index}
                  className={classes.creator}
                  organization={co.collaborating_organization}
                  size="tiny"
                  nolink
                  doNotShowName
                />
              ))}
            </>
          )}
        </div>
      )}

      {project_parent && !project_parent.parent_organization && project_parent.parent_user && (
        <MiniProfilePreview
          className={classes.creator}
          profile={project_parent.parent_user}
          size="small"
          nolink
        />
      )}
    </>
  );
};

const AdditionalPreviewInfo = ({ project }) => {
  const classes = useStyles({});
  const { projectTypes } = useContext(BrowseContext);
  const projectType =
    projectTypes && projectTypes.length > 0
      ? projectTypes.find((t) => t.type_id === project.project_type)
      : { name: project.project_type, type_id: project.project_type };

  return (
    <Box className={classes.additionalInfoContainer}>
      {project.number_of_comments > 0 && (
        <Box className={classes.additionalInfoIcon}>
          <ModeCommentIcon />
          <span className={classes.additionalInfoCounter}> {project.number_of_comments} </span>
        </Box>
      )}
      {project.number_of_likes > 2 && (
        <Box className={classes.additionalInfoIcon}>
          <FavoriteIcon />
          <span className={classes.additionalInfoCounter}> {project.number_of_likes}</span>
        </Box>
      )}
      <Box className={classes.additionalInfoIcon}>
        {(project.number_of_comments > 0 || project.number_of_likes > 2) && (
          <>
            {" • "}
            <div className={classes.horizontalSpacing} />
          </>
        )}
        <ProjectTypeDisplay
          projectType={projectType}
          iconClassName={classes.typeIcon}
          textClassName={classes.metadataText}
        />
      </Box>
    </Box>
  );
};
