import { Box, Container, Typography } from "@mui/material";
import NextCookies from "next-cookies";
import { GetServerSideProps } from "next";
import WideLayout from "../../../src/components/layouts/WideLayout";
import { apiRequest } from "../../../public/lib/apiOperations";
import ProjectPreviews from "../../../src/components/project/ProjectPreviews";
import theme from "../../../src/themes/theme";

interface WasseraktionswochenPageProps {
  locale: string;
  projects: any[];
}

const PARENT_SLUG = "wasseraktionswochen-143-2932026";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const locale = context.locale || "en";
  const { auth_token } = NextCookies(context);

  let projects: any[] = [];
  try {
    const resp = await apiRequest({
      method: "get",
      url: `/api/projects/?parent_project_slug=${PARENT_SLUG}`,
      token: auth_token,
      locale,
    });

    const results = resp?.data?.results || [];
    projects = results.map((project) => ({
      ...project,
      sectors: (project.sectors || [])
        .sort((a: any, b: any) => (a?.order || 0) - (b?.order || 0))
        .map((s: any) => s.sector),
    }));
  } catch (err) {
    console.log("Failed to load child events", err?.response?.data || err);
  }

  return {
    props: {
      locale,
      projects,
    },
  };
};

export default function WasseraktionswochenPage({ locale, projects }: WasseraktionswochenPageProps) {
  const isGerman = locale === "de";

  return (
    <WideLayout
      title={isGerman ? "Wasseraktionswochen" : "Water Action Weeks"}
      hideAlert
      isHubPage
      hubUrl="em"
      headerBackground={theme.palette.background.default}
    >
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
            <ProjectPreviews projects={projects} hubUrl="em" displayOnePreviewInRow={false} />
          </Box>
        </Box>
      </Container>
    </WideLayout>
  );
}
