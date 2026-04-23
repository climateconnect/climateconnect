import { useContext } from "react";
import { Button, Typography } from "@mui/material";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";

interface AuthOtpPlaceholderProps {
  email: string;
  onBack: () => void;
  hubUrl?: string;
}

export default function AuthOtp({ email, onBack, hubUrl }: AuthOtpPlaceholderProps) {
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "profile", locale: locale, hubName: hubUrl });

  return (
    <div>
      <Typography variant="h1" style={{ fontWeight: "bold", marginBottom: 16 }}>
        {texts.enter_code || "Enter your code"}
      </Typography>
      <Typography variant="body1" style={{ marginBottom: 24 }}>
        {texts.otp_entry_coming_soon || "OTP code entry coming soon (US-6). Your email: " + email}
      </Typography>
      <Button variant="outlined" onClick={onBack}>
        {texts.back || "Back"}
      </Button>
    </div>
  );
}
