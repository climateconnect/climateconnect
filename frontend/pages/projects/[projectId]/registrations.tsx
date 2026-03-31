import NextCookies from "next-cookies";
import React, { useContext, useState } from "react";
import { Box, Button, Chip, Container, Divider, Link, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SettingsIcon from "@mui/icons-material/Settings";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import dayjs from "dayjs";

import { apiRequest } from "../../../public/lib/apiOperations";
import getTexts from "../../../public/texts/texts";
import UserContext from "../../../src/components/context/UserContext";
import WideLayout from "../../../src/components/layouts/WideLayout";
import EditEventRegistrationModal from "../../../src/components/project/EditEventRegistrationModal";
import { EventRegistrationData, Project } from "../../../src/types";
import { useFeatureToggles } from "../../../src/components/featureToggle";

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(8),
  },
  backLink: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
    marginBottom: theme.spacing(3),
    color: theme.palette.text.secondary,
    textDecoration: "none",
    "&:hover": {
      textDecoration: "underline",
    },
  },
  pageTitle: {
    marginBottom: theme.spacing(1),
  },
  eventName: {
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(4),
  },
  section: {
    marginBottom: theme.spacing(4),
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: theme.spacing(2),
  },
  settingsGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(3),
    marginBottom: theme.spacing(2),
  },
  settingItem: {
    minWidth: 180,
  },
  settingLabel: {
    color: theme.palette.text.secondary,
    fontSize: "0.75rem",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: theme.spacing(0.5),
  },
  settingValue: {
    fontWeight: 500,
  },
  editButton: {
    marginTop: theme.spacing(1),
  },
  statusChip: {
    fontWeight: 600,
  },
  placeholderBox: {
    padding: theme.spacing(4),
    textAlign: "center",
    border: `1px dashed ${theme.palette.grey[400]}`,
    borderRadius: theme.shape.borderRadius,
    color: theme.palette.text.secondary,
  },
}));

type Props = {
  project: Project | null;
};

export default function RegistrationsPage({ project }: Props) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale });
  const { isEnabled } = useFeatureToggles();
  const isEventRegistrationEnabled = isEnabled("EVENT_REGISTRATION");

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [
    currentEventRegistration,
    setCurrentEventRegistration,
  ] = useState<EventRegistrationData | null>(project?.event_registration ?? null);

  if (!project) {
    return (
      <WideLayout title="Not found">
        <Container>
          <Typography>Event not found.</Typography>
        </Container>
      </WideLayout>
    );
  }

  const handleRegistrationSaved = (updated: EventRegistrationData) => {
    setCurrentEventRegistration(updated);
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return "—";
    return dayjs(iso).locale(locale).format("DD MMM YYYY, HH:mm");
  };

  const statusLabel =
    currentEventRegistration?.status === "open"
      ? texts.registration_status_open
      : texts.registration_status_closed;

  const statusColor = currentEventRegistration?.status === "open" ? "success" : "default";

  const canEdit =
    isEventRegistrationEnabled &&
    project.project_type?.type_id === "event" &&
    currentEventRegistration != null;

  return (
    <WideLayout title={`${texts.registrations} — ${project.name}`}>
      <Container maxWidth="md" className={classes.root}>
        {/* Back link */}
        <Link href={`/projects/${project.url_slug}`} className={classes.backLink}>
          <ArrowBackIcon fontSize="small" />
          {texts.back_to_event}
        </Link>

        <Typography variant="h4" component="h1" className={classes.pageTitle}>
          {texts.registrations}
        </Typography>
        <Typography variant="subtitle1" className={classes.eventName}>
          {project.name}
        </Typography>

        <Divider sx={{ mb: 4 }} />

        {/* Registration settings summary */}
        <Box className={classes.section}>
          <Typography variant="h6" component="h2" className={classes.sectionTitle}>
            {texts.registration_settings}
          </Typography>

          {currentEventRegistration ? (
            <>
              <Box className={classes.settingsGrid}>
                <Box className={classes.settingItem}>
                  <Typography className={classes.settingLabel}>{texts.max_participants}</Typography>
                  <Typography className={classes.settingValue}>
                    {currentEventRegistration.max_participants ?? "—"}
                  </Typography>
                </Box>

                <Box className={classes.settingItem}>
                  <Typography className={classes.settingLabel}>
                    {texts.registration_end_date}
                  </Typography>
                  <Typography className={classes.settingValue}>
                    {formatDate(currentEventRegistration.registration_end_date)}
                  </Typography>
                </Box>

                <Box className={classes.settingItem}>
                  <Typography className={classes.settingLabel}>
                    {texts.registration_status}
                  </Typography>
                  <Chip
                    className={classes.statusChip}
                    label={statusLabel}
                    color={statusColor as any}
                    size="small"
                    icon={
                      currentEventRegistration.status === "open" ? (
                        <CheckCircleOutlineIcon fontSize="small" />
                      ) : (
                        <PauseCircleOutlineIcon fontSize="small" />
                      )
                    }
                  />
                </Box>
              </Box>

              {canEdit && (
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<SettingsIcon />}
                  className={classes.editButton}
                  onClick={() => setEditModalOpen(true)}
                  aria-label={texts.edit_registration_settings}
                >
                  {texts.edit_registration_settings}
                </Button>
              )}
            </>
          ) : (
            <Typography color="textSecondary">{texts.no_registration_settings_found}</Typography>
          )}
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Placeholder for future registration list */}
        <Box className={classes.section}>
          <Typography variant="h6" component="h2" className={classes.sectionTitle}>
            {texts.registrations}
          </Typography>
          <Box className={classes.placeholderBox}>
            <Typography variant="body2">
              {/* TODO: display list of registered participants once EventParticipant data is available */}
              Registration list will be shown here in a future release.
            </Typography>
          </Box>
        </Box>
      </Container>

      {canEdit && currentEventRegistration && (
        <EditEventRegistrationModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onSaved={handleRegistrationSaved}
          project={project}
          eventRegistration={currentEventRegistration}
        />
      )}
    </WideLayout>
  );
}

export async function getServerSideProps(ctx) {
  const { auth_token } = NextCookies(ctx);
  const projectUrl = encodeURI(ctx?.query?.projectId);

  // Require authentication
  if (!auth_token) {
    return {
      redirect: {
        destination: `/signin?redirect=/projects/${projectUrl}/registrations`,
        permanent: false,
      },
    };
  }

  const project = await getProjectByIdIfExists(projectUrl, auth_token, ctx.locale);

  // 404 if the project doesn't exist or isn't an event
  if (!project || project.project_type?.type_id !== "event") {
    return { notFound: true };
  }

  return {
    props: {
      project,
    },
  };
}

async function getProjectByIdIfExists(
  projectUrl: string,
  token: string | undefined,
  locale: string
) {
  try {
    const resp = await apiRequest({
      method: "get",
      url: `/api/projects/${projectUrl}/`,
      token,
      locale: locale as any,
    });
    if (!resp.data) return null;
    return parseProject(resp.data);
  } catch {
    return null;
  }
}

function parseProject(project): Project {
  return {
    name: project.name,
    url_slug: project.url_slug,
    image: project.image,
    location: project.location,
    description: project.description,
    short_description: project.short_description,
    collaborators_welcome: project.collaborators_welcome,
    start_date: project.start_date,
    end_date: project.end_date,
    creator: project.project_parents?.[0]?.parent_organization
      ? project.project_parents[0].parent_organization
      : project.project_parents?.[0]?.parent_user,
    isPersonalProject: !project.project_parents?.[0]?.parent_organization,
    is_organization_project: !!project.project_parents?.[0]?.parent_organization,
    is_draft: project.is_draft,
    sectors: project.sectors?.sort((a, b) => a.order - b.order).map((s) => s.sector) ?? [],
    collaborating_organizations:
      project.collaborating_organizations?.map((o) => o.collaborating_organization) ?? [],
    website: project.website,
    number_of_followers: project.number_of_followers,
    number_of_likes: project.number_of_likes,
    project_type: project.project_type,
    additional_loc_info: project.additional_loc_info,
    is_online: project.is_online,
    event_registration: project.event_registration ?? null,
    team_members: [],
    language: project.language,
    loc: project.loc,
    parent_organization: project.project_parents?.[0]?.parent_organization ?? null,
  };
}
