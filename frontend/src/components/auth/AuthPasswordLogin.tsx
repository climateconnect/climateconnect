import { useContext } from "react";
import { Button, Typography } from "@mui/material";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";

interface AuthPasswordLoginPlaceholderProps {
  email: string;
  onBack: () => void;
  hubUrl?: string;
}

export default function AuthPasswordLogin({
  email,
  onBack,
  hubUrl,
}: AuthPasswordLoginPlaceholderProps) {
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "profile", locale: locale, hubName: hubUrl });

  return (
    <div>
      <Typography variant="h1" style={{ fontWeight: "bold", marginBottom: 16 }}>
        {texts.log_in || "Log in"}
      </Typography>
      <Typography variant="body1" style={{ marginBottom: 24 }}>
        {texts.password_login_coming_soon ||
          "Password login coming soon (US-7). Your email: " + email}
      </Typography>
      <Button variant="outlined" onClick={onBack}>
        {texts.back || "Back"}
      </Button>
    </div>
  );
}
