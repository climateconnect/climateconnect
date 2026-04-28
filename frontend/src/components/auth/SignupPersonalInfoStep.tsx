import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  FormHelperText,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import { useContext, useRef, useState } from "react";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import LocationSearchBar from "../search/LocationSearchBar";
import { isLocationValid } from "../../../public/lib/locationOperations";

interface SignupPersonalInfoStepProps {
  email: string;
  onContinue: (_data: {
    first_name: string;
    last_name: string;
    location: any;
    send_newsletter: boolean;
  }) => void;
  onBack: () => void;
  hubUrl?: string;
}

export default function SignupPersonalInfoStep({
  email,
  onContinue,
  onBack,
  hubUrl,
}: SignupPersonalInfoStepProps) {
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "profile", locale: locale, hubName: hubUrl });

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [location, setLocation] = useState<any>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [locationOptionsOpen, setLocationOptionsOpen] = useState(false);

  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    location?: string;
    terms?: string;
  }>({});

  const locationInputRef = useRef(null);

  const handleLocationChange = (newLocation: any) => {
    setLocation(newLocation);
    if (errors.location) {
      setErrors({ ...errors, location: undefined });
    }
  };

  const handleContinue = () => {
    const newErrors: typeof errors = {};

    // Validate required fields
    if (!firstName.trim()) {
      newErrors.firstName = texts.first_name_is_required || "First name is required";
    }
    if (!lastName.trim()) {
      newErrors.lastName = texts.last_name_is_required || "Last name is required";
    }
    if (!isLocationValid(location)) {
      newErrors.location =
        texts.please_choose_one_of_the_location_options ||
        "Please choose a valid location from the dropdown";
    }
    if (!termsAccepted) {
      newErrors.terms =
        texts.you_must_accept_terms_and_privacy_policy ||
        "You must accept the terms of service and privacy policy";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // All valid - proceed
    onContinue({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      location: location,
      send_newsletter: true, // Both set to true when combined checkbox is checked
    });
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", mb: 3 }}>
        {texts.create_your_account || "Create your account"}
      </Typography>

      <Typography variant="body1" sx={{ mb: 3 }}>
        {texts.signup_step_1_headline ||
          "Tell us a bit about yourself to get started on Climate Connect."}
      </Typography>

      {/* Email field - read-only */}
      <TextField
        fullWidth
        label={texts.email || "Email"}
        value={email}
        disabled
        sx={{ mb: 2 }}
        helperText={texts.email_cannot_be_changed || "This is the email you'll use to log in"}
      />

      {/* First name */}
      <TextField
        fullWidth
        required
        label={texts.first_name || "First name"}
        value={firstName}
        onChange={(e) => {
          setFirstName(e.target.value);
          if (errors.firstName) {
            setErrors({ ...errors, firstName: undefined });
          }
        }}
        error={!!errors.firstName}
        helperText={errors.firstName}
        sx={{ mb: 2 }}
      />

      {/* Last name */}
      <TextField
        fullWidth
        required
        label={texts.last_name || "Last name"}
        value={lastName}
        onChange={(e) => {
          setLastName(e.target.value);
          if (errors.lastName) {
            setErrors({ ...errors, lastName: undefined });
          }
        }}
        error={!!errors.lastName}
        helperText={errors.lastName}
        sx={{ mb: 2 }}
      />

      {/* Location */}
      <LocationSearchBar
        label={texts.location || "Location"}
        required
        value={location}
        onSelect={handleLocationChange}
        locationInputRef={locationInputRef}
        open={locationOptionsOpen}
        handleSetOpen={setLocationOptionsOpen}
      />
      {errors.location && (
        <FormHelperText error sx={{ mt: 0.5, mb: 2 }}>
          {errors.location}
        </FormHelperText>
      )}

      {/* Combined terms + newsletter checkbox */}
      <Box sx={{ mt: 3, mb: 2 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={termsAccepted}
              onChange={(e) => {
                setTermsAccepted(e.target.checked);
                if (errors.terms) {
                  setErrors({ ...errors, terms: undefined });
                }
              }}
              color="primary"
            />
          }
          label={
            <Typography variant="body2">
              {texts.i_agree_to_the || "I agree to the"}{" "}
              <Link href="/terms" target="_blank" rel="noopener">
                {texts.terms_of_service || "terms of service"}
              </Link>{" "}
              {texts.and || "and"}{" "}
              <Link href="/privacy" target="_blank" rel="noopener">
                {texts.privacy_policy || "privacy policy"}
              </Link>{" "}
              {texts.and_would_like_to_receive_emails ||
                "and would like to receive emails about updates, news and interesting projects"}
            </Typography>
          }
        />
        {errors.terms && (
          <FormHelperText error sx={{ ml: 0 }}>
            {errors.terms}
          </FormHelperText>
        )}
      </Box>

      {/* Action buttons */}
      <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
        <Button variant="outlined" onClick={onBack}>
          {texts.back || "Back"}
        </Button>
        <Button variant="contained" color="primary" onClick={handleContinue} sx={{ flex: 1 }}>
          {texts.continue || "Continue"}
        </Button>
      </Box>
    </Box>
  );
}
