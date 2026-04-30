import React, { useContext, useState } from "react";
import { Alert, Box, Button, CircularProgress, TextField, Typography } from "@mui/material";
import { apiRequest } from "../../../public/lib/apiOperations";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";

interface AuthPasswordLoginProps {
  email: string;
  onBack: () => void;
  onSuccess: () => void;
  onForgotPassword: () => void;
  onSwitchToOtp: () => void;
  hubUrl?: string;
  showHeader?: boolean;
}

export default function AuthPasswordLogin({
  email,
  onBack,
  onSuccess,
  onForgotPassword,
  onSwitchToOtp,
  hubUrl,
  showHeader = true,
}: AuthPasswordLoginProps) {
  const { locale, signIn } = useContext(UserContext);
  const texts = getTexts({ page: "profile", locale: locale, hubName: hubUrl });

  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<React.ReactNode | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password) {
      setErrorMessage(texts.please_enter_your_password || "Please enter your password.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await apiRequest({
        method: "post",
        url: "/login/",
        payload: { username: email.toLowerCase(), password },
        locale: locale,
      });
      await signIn(response.data.token, response.data.expiry);
      onSuccess();
    } catch (err: any) {
      setPassword("");
      if (err.response?.data?.type === "not_verified") {
        setErrorMessage(texts.not_verified_error_message);
      } else if (err.response?.status === 429) {
        setErrorMessage(texts.too_many_attempts || "Too many attempts. Please try again later.");
      } else if (err.response?.data?.message) {
        setErrorMessage(err.response.data.message);
      } else {
        setErrorMessage(texts.server_error || "Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {showHeader && (
        <Typography variant="h1" style={{ fontWeight: "bold", marginBottom: 8 }}>
          {texts.log_in || "Log in"}
        </Typography>
      )}

      <Typography variant="body1" style={{ marginBottom: 24 }}>
        {texts.enter_password}
      </Typography>

      <form onSubmit={handleSubmit} noValidate aria-busy={isLoading}>
        <TextField
          label={texts.password || "Password"}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
          autoComplete="current-password"
          inputProps={{ "aria-label": texts.password || "Password" }}
          disabled={isLoading}
          style={{ marginBottom: 16 }}
          autoFocus
        />

        {errorMessage && (
          <Alert severity="error" role="alert" style={{ marginBottom: 16 }}>
            {errorMessage}
          </Alert>
        )}

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={isLoading}
          aria-busy={isLoading}
          style={{ marginBottom: 12 }}
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : texts.log_in || "Log in"}
        </Button>
      </form>

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        style={{ marginBottom: 16 }}
      >
        <Button variant="text" size="small" onClick={onForgotPassword} disabled={isLoading}>
          {texts.forgot_your_password || "Forgot your password?"}
        </Button>

        <Button variant="text" size="small" onClick={onSwitchToOtp} disabled={isLoading}>
          {texts.use_a_code_instead || "Use a code instead"}
        </Button>
      </Box>

      <Button variant="outlined" onClick={onBack} disabled={isLoading} fullWidth>
        {texts.back || "Back"}
      </Button>
    </>
  );
}
