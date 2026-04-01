import React, { useContext, useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import SettingsIcon from "@mui/icons-material/Settings";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import DangerousIcon from "@mui/icons-material/Dangerous";
import SearchIcon from "@mui/icons-material/Search";
import {
  DataGrid,
  GridColDef,
  GridColumnMenu,
  GridColumnMenuProps,
  GridToolbarContainer,
  GridToolbarExport,
} from "@mui/x-data-grid";
import { deDE, enUS } from "@mui/x-data-grid/locales";
import dayjs from "dayjs";
import Cookies from "universal-cookie";
import { apiRequest, getLocalePrefix } from "../../../public/lib/apiOperations";

import getTexts from "../../../public/texts/texts";
import { EventRegistrationData, Project } from "../../types";
import UserContext from "../context/UserContext";
import EditEventRegistrationModal from "./EditEventRegistrationModal";

type EventParticipant = {
  id: string; // derived from user_url_slug for DataGrid row identity
  user_first_name: string;
  user_last_name: string;
  user_url_slug: string;
  user_thumbnail_image: string | null;
  registered_at: string;
};

const useStyles = makeStyles((theme) => ({
  settingsGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(3),
    marginBottom: theme.spacing(3),
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
    fontSize: "1rem",
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: theme.spacing(2),
  },
  editButton: {
    marginBottom: theme.spacing(4),
  },
  listSection: {
    marginTop: theme.spacing(2),
  },
}));

type Props = {
  project: Project;
  eventRegistration: EventRegistrationData | null;
  onEventRegistrationUpdated: (_updated: EventRegistrationData) => void;
};

type ToolbarProps = {
  search: string;
  onSearchChange: (_value: string) => void;
  placeholder: string;
};

function CustomColumnMenu(props: GridColumnMenuProps) {
  return <GridColumnMenu {...props} slots={{ columnMenuColumnsItem: null }} />;
}

function RegistrationsToolbar({ search, onSearchChange, placeholder }: ToolbarProps) {
  return (
    <GridToolbarContainer sx={{ display: "flex", alignItems: "center", gap: 1, p: 1 }}>
      <TextField
        size="small"
        placeholder={placeholder}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        InputProps={{
          startAdornment: <SearchIcon fontSize="small" sx={{ mr: 0.5, color: "text.secondary" }} />,
        }}
        aria-label={placeholder}
        sx={{ flex: 1, maxWidth: 360 }}
      />
      <Box sx={{ flex: 1 }} />
      <GridToolbarExport
        csvOptions={{ fileName: "event-registrations" }}
        printOptions={{ hideFooter: true, hideToolbar: true }}
      />
    </GridToolbarContainer>
  );
}

export default function ProjectRegistrationsContent({
  project,
  eventRegistration,
  onEventRegistrationUpdated,
}: Props) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale });

  const [editModalOpen, setEditModalOpen] = useState(false);

  const [participants, setParticipants] = useState<EventParticipant[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(true);
  const [participantsError, setParticipantsError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const token = new Cookies().get("auth_token");
    setLoadingParticipants(true);
    setParticipantsError(null);
    apiRequest({
      method: "get",
      url: `/api/projects/${project.url_slug}/registrations/`,
      token,
      locale,
    })
      .then((resp) => {
        const rows: EventParticipant[] = resp.data.map(
          (p: Omit<EventParticipant, "id">, idx: number) => ({
            ...p,
            // DataGrid requires a unique `id` field
            id: p.user_url_slug || String(idx),
          })
        );
        setParticipants(rows);
      })
      .catch(() => {
        setParticipantsError(texts.error_loading_registrations);
      })
      .finally(() => {
        setLoadingParticipants(false);
      });
  }, [project.url_slug]);

  const isEventEnded = project.end_date ? dayjs(project.end_date).isBefore(dayjs()) : false;

  if (!eventRegistration) {
    return (
      <Typography color="textSecondary" sx={{ mt: 2 }}>
        {texts.no_registration_settings_found}
      </Typography>
    );
  }

  const STATUS_CONFIG = {
    open: {
      label: texts.registration_status_open,
      color: "success" as const,
      icon: CheckCircleOutlineIcon,
    },
    full: {
      label: texts.registration_status_full,
      color: "warning" as const,
      icon: PauseCircleOutlineIcon,
    },
    ended: {
      label: texts.registration_status_ended,
      color: "error" as const,
      icon: StopCircleIcon,
    },
    closed: {
      label: texts.registration_status_closed,
      color: "error" as const,
      icon: DangerousIcon,
    },
  };

  const statusConfig = STATUS_CONFIG[eventRegistration.status];
  const StatusIcon = statusConfig.icon;

  return (
    <>
      {/* Registration settings summary */}
      <Box className={classes.settingsGrid}>
        <Box className={classes.settingItem}>
          <Typography className={classes.settingLabel}>{texts.max_participants}</Typography>
          <Typography className={classes.settingValue}>
            {eventRegistration.max_participants ?? "—"}
          </Typography>
        </Box>

        <Box className={classes.settingItem}>
          <Typography className={classes.settingLabel}>{texts.registration_end_date}</Typography>
          <Typography className={classes.settingValue}>
            {eventRegistration.registration_end_date
              ? dayjs(eventRegistration.registration_end_date)
                  .locale(locale)
                  .format("DD MMM YYYY, HH:mm")
              : "—"}
          </Typography>
        </Box>

        <Box className={classes.settingItem}>
          <Typography className={classes.settingLabel}>{texts.registration_status}</Typography>
          <Chip
            size="small"
            label={statusConfig.label}
            color={statusConfig.color}
            icon={<StatusIcon fontSize="small" />}
            sx={{ fontWeight: 600 }}
          />
        </Box>
      </Box>

      {!isEventEnded && (
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

      {/* Registered guests list */}
      <Box className={classes.listSection}>
        <Typography variant="h6" component="h2" className={classes.sectionTitle}>
          {texts.registered_guests}
        </Typography>

        {loadingParticipants && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 2 }}>
            <CircularProgress size={20} />
            <Typography color="textSecondary">{texts.loading_registrations}</Typography>
          </Box>
        )}

        {!loadingParticipants && participantsError && (
          <Typography color="error">{participantsError}</Typography>
        )}

        {!loadingParticipants && !participantsError && (
          <DataGrid
            autoHeight
            rows={participants.filter((p) => {
              const q = search.toLowerCase();
              return (
                p.user_first_name.toLowerCase().includes(q) ||
                p.user_last_name.toLowerCase().includes(q)
              );
            })}
            columns={
              [
                {
                  field: "user_thumbnail_image",
                  headerName: "",
                  width: 56,
                  sortable: false,
                  disableExport: true,
                  disableColumnMenu: true,
                  filterable: false,
                  renderCell: (params) => (
                    <Link
                      href={`${getLocalePrefix(locale)}/profiles/${params.row.user_url_slug}`}
                      underline="none"
                      aria-label={`${params.row.user_first_name} ${params.row.user_last_name}`}
                    >
                      <Avatar
                        src={params.row.user_thumbnail_image ?? undefined}
                        alt={`${params.row.user_first_name} ${params.row.user_last_name}`}
                        sx={{ width: 32, height: 32 }}
                      />
                    </Link>
                  ),
                },
                {
                  field: "user_first_name",
                  headerName: texts.first_name,
                  flex: 1,
                  minWidth: 120,
                  renderCell: (params) => (
                    <Link href={`${getLocalePrefix(locale)}/profiles/${params.row.user_url_slug}`}>
                      {params.value}
                    </Link>
                  ),
                },
                {
                  field: "user_last_name",
                  headerName: texts.last_name,
                  flex: 1,
                  minWidth: 120,
                  renderCell: (params) => (
                    <Link href={`${getLocalePrefix(locale)}/profiles/${params.row.user_url_slug}`}>
                      {params.value}
                    </Link>
                  ),
                },
                {
                  field: "registered_at",
                  headerName: texts.registration_date,
                  type: "dateTime",
                  flex: 1,
                  minWidth: 160,
                  valueGetter: (params) => (params.value ? new Date(params.value as string) : null),
                  valueFormatter: (params) =>
                    params.value
                      ? dayjs(params.value as Date)
                          .locale(locale)
                          .format("DD MMM YYYY, HH:mm")
                      : "—",
                },
              ] as GridColDef[]
            }
            initialState={{
              sorting: {
                sortModel: [{ field: "registered_at", sort: "asc" }],
              },
              pagination: {
                paginationModel: { pageSize: 25 },
              },
            }}
            localeText={{
              ...(locale === "de" ? deDE : enUS).components.MuiDataGrid.defaultProps.localeText,
              noRowsLabel: texts.no_registrations_yet,
            }}
            disableRowSelectionOnClick
            slots={{ toolbar: RegistrationsToolbar, columnMenu: CustomColumnMenu }}
            slotProps={{
              toolbar: {
                search,
                onSearchChange: setSearch,
                placeholder: texts.search_guests,
              } as ToolbarProps,
            }}
            sx={{ border: "none" }}
          />
        )}
      </Box>

      {!isEventEnded && (
        <EditEventRegistrationModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onSaved={onEventRegistrationUpdated}
          project={project}
          eventRegistration={eventRegistration}
        />
      )}
    </>
  );
}
