import React, { useContext, useEffect, useRef, useState } from "react";
import { Alert, Box, Button, CircularProgress, TextField, Typography } from "@mui/material";
import { apiRequest } from "../../../public/lib/apiOperations";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";

const SESSION_KEY = "auth_session_key";
const RESEND_COOLDOWN_SECONDS = 60;

interface AuthOtpProps {
  email: string;
  onBack: () => void;
  onSuccess?: () => void;
  hubUrl?: string;
  showHeader?: boolean;
}

export default function AuthOtp({
  email,
  onBack,
  onSuccess,
  hubUrl,
  showHeader = true,
}: AuthOtpProps) {
  const { locale, signIn } = useContext(UserContext);
  const texts = getTexts({ page: "profile", locale, hubName: hubUrl });

  const [sessionKey, setSessionKey] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState<number | null>(null);

  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCountdown = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setResendCountdown(RESEND_COOLDOWN_SECONDS);
    countdownRef.current = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev !== null && prev > 1) return prev - 1;
        clearInterval(countdownRef.current!);
        countdownRef.current = null;
        return null;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const requestToken = async () => {
    setIsSendingCode(true);
    try {
      const response = await apiRequest({
        method: "post",
        url: "/api/auth/request-token",
        payload: { email },
        locale,
      });
      const key = response.data.session_key;
      setSessionKey(key);
      sessionStorage.setItem(SESSION_KEY, key);
      startCountdown();
    } catch (err: any) {
      if (err.response?.status === 429) {
        setErrorMessage(
          texts.please_wait_before_requesting_a_new_code ||
            "Please wait before requesting a new code."
        );
      } else {
        setErrorMessage(
          texts.connection_error_please_try_again || "Connection error. Please try again."
        );
      }
    } finally {
      setIsSendingCode(false);
    }
  };

  // Request token on mount
  useEffect(() => {
    const existingKey = sessionStorage.getItem(SESSION_KEY);
    if (existingKey) {
      setSessionKey(existingKey);
      startCountdown();
    } else {
      requestToken();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionKey || code.length !== 6) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await apiRequest({
        method: "post",
        url: "/api/auth/verify-token",
        payload: { session_key: sessionKey, code },
        locale,
      });

      const { token, expiry } = response.data;
      sessionStorage.removeItem(SESSION_KEY);
      await signIn(token, expiry);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const detail: string = err.response?.data?.detail ?? "";
      setCode("");

      if (detail.toLowerCase().includes("expired")) {
        setErrorMessage(
          texts.this_code_has_expired_please_request_a_new_one ||
            "This code has expired. Please request a new one."
        );
        startCountdown();
      } else if (detail.toLowerCase().includes("too many")) {
        setErrorMessage(
          texts.too_many_attempts_please_request_a_new_code ||
            "Too many attempts. Please request a new code."
        );
        startCountdown();
      } else if (detail.toLowerCase().includes("invalid")) {
        setErrorMessage(
          texts.incorrect_code_please_try_again || "Incorrect code. Please try again."
        );
      } else if (err.response?.status === 429) {
        setErrorMessage(
          texts.please_wait_before_requesting_a_new_code ||
            "Please wait before requesting a new code."
        );
      } else {
        setErrorMessage(
          texts.connection_error_please_try_again || "Connection error. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setCode("");
    setErrorMessage(null);
    await requestToken();
  };

  const handleBack = () => {
    sessionStorage.removeItem(SESSION_KEY);
    onBack();
  };

  const isResendDisabled = resendCountdown !== null && resendCountdown > 0;
  const resendLabel = isResendDisabled
    ? `${texts.resend_code || "Resend code"} (${resendCountdown}s)`
    : texts.resend_code || "Resend code";

  return (
    <Box component="form" onSubmit={handleSubmit} aria-busy={isLoading}>
      {showHeader && (
        <Typography variant="h1" style={{ fontWeight: "bold", marginBottom: 8 }}>
          {texts.enter_your_code || "Enter your code"}
        </Typography>
      )}
      <Typography variant="body1" style={{ marginBottom: 24 }}>
        {texts.we_sent_a_code_to.replace("{email}", email)}
      </Typography>

      {errorMessage && (
        <Alert severity="error" role="alert" style={{ marginBottom: 16 }}>
          {errorMessage}
        </Alert>
      )}

      <TextField
        label={texts.enter_your_code || "Enter your code"}
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
        inputProps={{
          maxLength: 6,
          inputMode: "numeric",
          autoComplete: "one-time-code",
          "aria-label": "6-digit code",
        }}
        fullWidth
        disabled={isLoading || isSendingCode}
        style={{ marginBottom: 16 }}
        autoFocus
      />

      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        disabled={isLoading || isSendingCode || code.length !== 6}
        style={{ marginBottom: 12 }}
      >
        {isLoading ? <CircularProgress size={24} color="inherit" /> : texts.verify || "Verify"}
      </Button>

      <Button
        variant="text"
        fullWidth
        onClick={handleResend}
        disabled={isResendDisabled || isLoading || isSendingCode}
        aria-disabled={isResendDisabled}
        style={{ marginBottom: 8 }}
      >
        {isSendingCode ? <CircularProgress size={20} color="inherit" /> : resendLabel}
      </Button>

      <Button variant="outlined" fullWidth onClick={handleBack} disabled={isLoading}>
        {texts.back || "Back"}
      </Button>
    </Box>
  );
}
