import { Box, Container, Typography } from "@mui/material";
import { GetServerSideProps } from "next";
import WideLayout from "../../../src/components/layouts/WideLayout";

interface WasseraktionswochenPageProps {
  locale: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const locale = context.locale || "en";

  return {
    props: {
      locale,
    },
  };
};

export default function WasseraktionswochenPage({ locale }: WasseraktionswochenPageProps) {
  const isGerman = locale === "de";

  return (
    <WideLayout title={isGerman ? "Wasseraktionswochen" : "Water Action Weeks"}>
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            {isGerman ? "Wasseraktionswochen" : "Water Action Weeks"}
          </Typography>

          <Typography variant="body1" sx={{ mb: 4 }}>
            {isGerman ? "Landkreis Emmendingen" : "Emmendingen District"}
          </Typography>

          <Box
            sx={{
              p: 4,
              border: "2px dashed #ccc",
              borderRadius: 2,
              textAlign: "center",
              backgroundColor: "#f5f5f5",
            }}
          >
            <Typography variant="h6" gutterBottom>
              {isGerman
                ? "Platzhalter für Webflow-Komponente"
                : "Placeholder for Webflow Component"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isGerman
                ? "Webflow-Inhalte werden hier integriert"
                : "Webflow content will be integrated here"}
            </Typography>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              {isGerman ? "Veranstaltungen" : "Events"}
            </Typography>
            <Box
              sx={{
                p: 4,
                border: "2px dashed #ccc",
                borderRadius: 2,
                textAlign: "center",
                backgroundColor: "#f5f5f5",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {isGerman
                  ? "Hier erscheint das Raster der Unterveranstaltungen"
                  : "Sub-events grid will appear here"}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>
    </WideLayout>
  );
}
