import { useContext, useEffect, useState } from "react";
import { CircularProgress, Box } from "@mui/material";
import UserContext from "../context/UserContext";
import SignupPersonalInfoStep from "./SignupPersonalInfoStep";
import SignupInterestsStep from "./SignupInterestsStep";
import { apiRequest } from "../../../public/lib/apiOperations";
import { parseLocation } from "../../../public/lib/locationOperations";
import { getSectorOptions } from "../../../public/lib/getOptions";
import { Sector } from "../../types";
import getTexts from "../../../public/texts/texts";

interface AuthSignupStepProps {
  email: string;
  onBack: () => void;
  onSignupComplete: () => void;
  hubUrl?: string;
}

type SignupStep = "personal_info" | "interests";

interface PersonalInfoData {
  first_name: string;
  last_name: string;
  location: any;
  send_newsletter: boolean;
}

export default function AuthSignupStep({
  email,
  onBack,
  onSignupComplete,
  hubUrl,
}: AuthSignupStepProps) {
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "profile", locale: locale, hubName: hubUrl });

  const [currentStep, setCurrentStep] = useState<SignupStep>("personal_info");
  const [personalInfo, setPersonalInfo] = useState<PersonalInfoData | null>(null);
  const [sectorOptions, setSectorOptions] = useState<Sector[]>([]);
  const [isLoadingSectors, setIsLoadingSectors] = useState(true);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch sector options on mount
  useEffect(() => {
    const fetchSectors = async () => {
      try {
        const sectors = await getSectorOptions(locale, hubUrl);
        setSectorOptions(sectors || []);
      } catch (err) {
        console.error("Error fetching sector options:", err);
        setSectorOptions([]);
      } finally {
        setIsLoadingSectors(false);
      }
    };

    fetchSectors();
  }, [locale, hubUrl]);

  const handlePersonalInfoContinue = (data: PersonalInfoData) => {
    setPersonalInfo(data);
    setCurrentStep("interests");
  };

  const handleBackToPersonalInfo = () => {
    setCurrentStep("personal_info");
    setErrorMessage(null);
  };

  const handleCreateAccount = async (data: { interest_sectors: string[] }) => {
    if (!personalInfo) return;

    setIsCreatingAccount(true);
    setErrorMessage(null);

    try {
      // Create account via POST /api/signup/
      const signupPayload = {
        email: email.trim().toLowerCase(),
        first_name: personalInfo.first_name,
        last_name: personalInfo.last_name,
        location: parseLocation(personalInfo.location),
        send_newsletter: personalInfo.send_newsletter,
        source_language: locale,
        sectors: data.interest_sectors,
        hub: hubUrl || "",
        // Note: password field is intentionally omitted for OTP-based signup
      };

      await apiRequest({
        method: "post",
        url: "/signup/",
        payload: signupPayload,
        locale: locale,
      });

      // Notify parent to transition to OTP entry
      // Note: OTP request will be handled by AuthOtp component on mount
      onSignupComplete();
    } catch (err: any) {
      console.error("Signup error:", err);

      // Handle signup errors
      if (err.response?.data?.message) {
        setErrorMessage(err.response.data.message);
      } else if (err.response?.data?.detail) {
        setErrorMessage(err.response.data.detail);
      } else if (err.response?.data && typeof err.response.data === "string") {
        setErrorMessage(err.response.data);
      } else if (Array.isArray(err.response?.data) && err.response.data.length > 0) {
        setErrorMessage(err.response.data[0]);
      } else {
        setErrorMessage(
          texts.an_error_occurred_please_try_again || "An error occurred. Please try again."
        );
      }
    } finally {
      setIsCreatingAccount(false);
    }
  };

  // Show loading state while fetching sectors
  if (isLoadingSectors) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  // Render appropriate step
  if (currentStep === "personal_info") {
    return (
      <SignupPersonalInfoStep
        email={email}
        onContinue={handlePersonalInfoContinue}
        onBack={onBack}
        hubUrl={hubUrl}
      />
    );
  }

  if (currentStep === "interests" && personalInfo) {
    return (
      <SignupInterestsStep
        email={email}
        firstName={personalInfo.first_name}
        lastName={personalInfo.last_name}
        location={personalInfo.location}
        sectorOptions={sectorOptions}
        onSubmit={handleCreateAccount}
        onBack={handleBackToPersonalInfo}
        hubUrl={hubUrl}
        isLoading={isCreatingAccount}
        errorMessage={errorMessage || undefined}
      />
    );
  }

  return null;
}
