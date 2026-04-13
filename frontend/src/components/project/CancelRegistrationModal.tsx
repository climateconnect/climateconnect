import React, { useContext, useState } from "react";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { Theme } from "@mui/material/styles";
import makeStyles from "@mui/styles/makeStyles";
import Cookies from "universal-cookie";

import { apiRequest } from "../../../public/lib/apiOperations";
import getTexts from "../../../public/texts/texts";
import { Project } from "../../types";
import UserContext from "../context/UserContext";
import GenericDialog from "../dialogs/GenericDialog";

const useStyles = makeStyles((theme: Theme) => ({
  content: {
    textAlign: "center",
    padding: theme.spacing(2, 0),
  },
  errorText: {
    color: theme.palette.error.main,
    marginTop: theme.spacing(2),
  },
  actions: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1.5),
    marginTop: theme.spacing(3),
    [theme.breakpoints.up("sm")]: {
      flexDirection: "row",
      justifyContent: "center",
    },
  },
  loadingContainer: {
    marginTop: theme.spacing(2),
    textAlign: "center",
  },
}));

interface CancelRegistrationModalProps {
  open: boolean;
  onClose: () => void;
  project: Project;
  onCancellationSuccess: () => void;
}

export default function CancelRegistrationModal({
  open,
  onClose,
  project,
  onCancellationSuccess,
}: CancelRegistrationModalProps) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale, project });
  const cookies = new Cookies();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    if (loading) return;
    setError(null);
    onClose();
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = cookies.get("auth_token");
      await apiRequest({
        method: "delete",
        url: `/api/projects/${project.url_slug}/registrations/`,
        token,
        locale,
      });
      setLoading(false);
      onCancellationSuccess();
      onClose();
    } catch (e: any) {
      setLoading(false);
      setError(
        e?.response?.data?.message || e?.response?.data?.detail || texts.cancel_registration_error
      );
    }
  };

  const confirmMessage = (texts.cancel_registration_confirm as string).replace(
    "{event}",
    project.name ?? ""
  );

  return (
    <GenericDialog
      open={open}
      onClose={handleClose}
      title={texts.cancel_registration}
      maxWidth="sm"
    >
      <Box className={classes.content}>
        <Typography variant="body1">{confirmMessage}</Typography>

        {error && (
          <Typography variant="body2" className={classes.errorText}>
            {error}
          </Typography>
        )}

        {loading ? (
          <Box className={classes.loadingContainer}>
            <CircularProgress size={32} />
          </Box>
        ) : (
          <Box className={classes.actions}>
            <Button variant="contained" color="error" onClick={handleConfirm}>
              {texts.yes_cancel_registration}
            </Button>
            <Button variant="outlined" onClick={handleClose}>
              {texts.keep_registration}
            </Button>
          </Box>
        )}
      </Box>
    </GenericDialog>
  );
}
