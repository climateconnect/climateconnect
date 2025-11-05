import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import ArrowBack from "@mui/icons-material/ArrowBack";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import { Box, Card, CardContent, IconButton, Typography, Button } from "@mui/material";
import ActiveSectorsSelector from "../hub/ActiveSectorsSelector";
import { Sector } from "../../types";

type AddInterestAreaProps = {
  handleSubmit: (event: React.FormEvent, values: any) => void;
  errorMessage?: string;
  values: any;
  handleGoBack: (event: any, values: any) => void;
  isSmallScreen: boolean;
  sectorOptions: Sector[];
};

const useStyles = makeStyles((theme) => ({
  root: {
    [theme.breakpoints.down("sm")]: {
      padding: 0,
      borderRadius: 0,
      boxShadow: "none",
    },
  },
  smallScreenHeadline: {
    fontSize: 35,
    textAlign: "center",
    fontWeight: "bold",
    padding: theme.spacing(4),
    color: theme.palette.background.default_contrastText,
  },
  cardHeaderBox: {
    display: "flex",
    gap: "2rem",
    alignItems: "center",
    marginBottom: 2,
  },
  rightAlignedButton: {
    float: "right",
    marginTop: theme.spacing(4),
  },
  textColor: {
    color: theme.palette.background.default_contrastText,
  },
}));

/**
 * AddInterestArea component allows users to select their areas of interest during signup
 * It displays a list of sectors that users can select from and manages the selection state
 */
export default function AddInterestArea({
  values,
  handleSubmit,
  handleGoBack,
  isSmallScreen,
  sectorOptions,
}: AddInterestAreaProps) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "profile", locale: locale });

  const GoBackArrow = () => (
    <IconButton
      aria-label="go-back"
      onClick={() =>
        handleGoBack(
          undefined,
          selectedSectors.map((sector) => sector.key)
        )
      }
    >
      <ArrowBack />
    </IconButton>
  );

  const StepCounter = () => (
    <Typography variant="subtitle1" component="div">
      {isSmallScreen && <GoBackArrow />}
      {texts.step_3_of_3_sign_up}
    </Typography>
  );

  const getInitialSelectedSectors = () => {
    if (values.sectors && Array.isArray(values.sectors) && values.sectors.length > 0) {
      return sectorOptions.filter((sector) => values.sectors.includes(sector.key));
    }
    return [];
  };

  const [selectedSectors, setSelectedSectors] = React.useState<Sector[]>(
    getInitialSelectedSectors()
  );

  const [formValues, setFormValues] = React.useState({
    ...values,
    sectors: values.sectors || [],
  });

  const handleSectorSelection = (
    event: React.ChangeEvent<HTMLSelectElement | { value: string }>
  ) => {
    event.preventDefault();
    const sectorName = event.target.value;
    const selectedSector = sectorOptions.find((s) => s.name === sectorName);

    if (selectedSector && !selectedSectors.some((s) => s.key === selectedSector.key)) {
      const updatedSectors = [...selectedSectors, selectedSector];
      const sectorKeys = updatedSectors.map((sector) => sector.key);

      setSelectedSectors(updatedSectors);
      setFormValues({
        ...formValues,
        sectors: sectorKeys,
      });
    }
  };

  const handleSectorRemoval = (sectorToRemove: any) => {
    if (!sectorToRemove) {
      console.warn("handleSectorRemoval was called without a sector.");
      return;
    }
    const updatedSectors = selectedSectors.filter((sector) => sector.key !== sectorToRemove.key);
    const sectorKeys = updatedSectors.map((sector) => sector.key);

    setSelectedSectors(updatedSectors);
    setFormValues({
      ...formValues,
      sectors: sectorKeys,
    });
  };

  // Filter out sectors that are already in the selectedSectors array.
  const availableSectors = sectorOptions.filter(
    (sector) => !selectedSectors.some((selected) => selected.key === sector.key)
  );

  return (
    <Card className={classes.root}>
      {isSmallScreen && (
        <>
          <Typography variant="h1" className={classes.smallScreenHeadline}>
            {texts.sign_up}
          </Typography>
          <Typography>{texts.signup_step_3_headline}</Typography>
        </>
      )}

      <Box className={classes.cardHeaderBox}>
        {!isSmallScreen && <GoBackArrow />}
        <StepCounter />
      </Box>

      <CardContent>
        {!isSmallScreen && (
          <>
            <Typography className={classes.textColor} variant="h1">
              {texts.your_area_of_interest}
            </Typography>
            <Typography>{texts.signup_step_3_headline}</Typography>
          </>
        )}

        <ActiveSectorsSelector
          selectedSectors={selectedSectors}
          sectorsToSelectFrom={availableSectors}
          onSelectNewSector={handleSectorSelection}
          onClickRemoveSector={handleSectorRemoval}
          hideTitle={true}
        />
        <Button
          fullWidth
          variant="contained"
          type="submit"
          color="primary"
          onClick={(event) => handleSubmit(event, formValues)}
        >
          {texts.submit}
        </Button>
      </CardContent>
    </Card>
  );
}
