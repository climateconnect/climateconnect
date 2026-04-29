import { Box, Button, Typography } from "@mui/material";
import { ChangeEvent, useContext, useEffect, useState } from "react";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import ActiveSectorsSelector from "../hub/ActiveSectorsSelector";
import { Sector } from "../../types";
import { getSectorOptions } from "../../../public/lib/getOptions";
import LoadingSpinner from "../general/LoadingSpinner";

interface SignupInterestsStepProps {
  email: string;
  onSubmit: (_data: { interest_sectors: string[] }) => void;
  onBack: () => void;
  hubUrl?: string;
  isLoading?: boolean;
  errorMessage?: string;
}

export default function SignupInterestsStep({
  email: _email,
  onSubmit,
  onBack,
  hubUrl,
  isLoading = false,
  errorMessage,
}: SignupInterestsStepProps) {
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "profile", locale: locale, hubName: hubUrl });

  const [selectedSectors, setSelectedSectors] = useState<Sector[]>([]);
  const [sectorOptions, setSectorOptions] = useState<Sector[]>([]);
  const [isLoadingSectors, setIsLoadingSectors] = useState(true);

  // Fetch sector options when component mounts
  useEffect(() => {
    const fetchSectors = async () => {
      setIsLoadingSectors(true);
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

  const handleSectorSelection = (event: ChangeEvent<HTMLSelectElement | { value: string }>) => {
    event.preventDefault();
    const sectorName = event.target.value;
    const selectedSector = sectorOptions.find((s) => s.name === sectorName);

    if (selectedSector && !selectedSectors.some((s) => s.key === selectedSector.key)) {
      const updatedSectors = [...selectedSectors, selectedSector];
      setSelectedSectors(updatedSectors);
    }
  };

  const handleSectorRemoval = (sectorToRemove: any) => {
    if (!sectorToRemove) {
      console.warn("handleSectorRemoval was called without a sector.");
      return;
    }
    const updatedSectors = selectedSectors.filter((sector) => sector.key !== sectorToRemove.key);
    setSelectedSectors(updatedSectors);
  };

  const handleCreateAccount = () => {
    const sectorIds = selectedSectors.map((sector) => sector.key);
    onSubmit({ interest_sectors: sectorIds });
  };

  // Filter out sectors that are already selected
  const availableSectors = sectorOptions.filter(
    (sector) => !selectedSectors.some((selected) => selected.key === sector.key)
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", mb: 3 }}>
        {texts.your_area_of_interest}
      </Typography>

      <Typography variant="body1" sx={{ mb: 3 }}>
        {texts.signup_step_3_headline}
      </Typography>
      {/* Interest sectors selection */}
      <Box sx={{ mb: 3 }}>
        {isLoadingSectors ? (
          <LoadingSpinner isLoading />
        ) : (
          <ActiveSectorsSelector
            selectedSectors={selectedSectors}
            sectorsToSelectFrom={availableSectors}
            onSelectNewSector={handleSectorSelection}
            onClickRemoveSector={handleSectorRemoval}
            hideTitle={false}
            title={texts.select_your_interest_areas}
          />
        )}
      </Box>

      {/* Error message */}
      {errorMessage && (
        <Typography color="error" variant="body2" sx={{ mb: 2 }}>
          {errorMessage}
        </Typography>
      )}

      {/* Action buttons */}
      <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
        <Button variant="outlined" onClick={onBack} disabled={isLoading}>
          {texts.back}
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreateAccount}
          disabled={isLoading}
          sx={{ flex: 1 }}
        >
          {isLoading ? texts.creating_account : texts.create_account}
        </Button>
      </Box>
    </Box>
  );
}
