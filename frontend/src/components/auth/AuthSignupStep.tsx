import { useContext } from "react";
import { Button, Typography } from "@mui/material";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";

interface AuthSignupStepPlaceholderProps {
  email: string;
  onBack: () => void;
  onSuccess?: () => void;
  hubUrl?: string;
}

export default function AuthSignupStep({
  email,
  onBack,
  onSuccess: _onSuccess,
  hubUrl,
}: AuthSignupStepPlaceholderProps) {
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "profile", locale: locale, hubName: hubUrl });

  return (
    <div>
      <Typography variant="h1" style={{ fontWeight: "bold", marginBottom: 16 }}>
        {texts.create_account || "Create your account"}
      </Typography>
      <Typography variant="body1" style={{ marginBottom: 24 }}>
        {texts.signup_coming_soon || "Signup form coming soon (US-8). Your email: " + email}
      </Typography>
      <Button variant="outlined" onClick={onBack}>
        {texts.back || "Back"}
      </Button>
    </div>
  );
}
