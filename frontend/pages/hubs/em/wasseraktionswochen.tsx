import { Box, Container } from "@mui/material";
import { GetServerSideProps } from "next";
import WideLayout from "../../../src/components/layouts/WideLayout";
import { apiRequest } from "../../../public/lib/apiOperations";
import WasseraktionswochenEvents from "../../../src/components/hub/WasseraktionswochenEvents";
import theme from "../../../src/themes/theme";
import { Wasseraktionswochen } from "../../../devlink";

interface WasseraktionswochenPageProps {
  locale: string;
  projects: any[];
}

const PARENT_SLUG = "wasseraktionswochen-143-2932026";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const locale = context.locale || "en";

  let projects: any[] = [];
  try {
    const resp = await apiRequest({
      method: "get",
      url: `/api/projects/?parent_project_slug=${PARENT_SLUG}&page_size=100`,
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

export default function WasseraktionswochenPage({
  locale,
  projects,
}: WasseraktionswochenPageProps) {
  const isGerman = locale === "de";

  return (
    <WideLayout
      title={isGerman ? "Wasseraktionswochen" : "Water Action Weeks"}
      hideAlert
      isHubPage
      hasHubLandingPage={true}
      hubUrl="em"
      headerBackground={theme.palette.background.default}
    >
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Wasseraktionswochen />
          <WasseraktionswochenEvents projects={projects} isGerman={isGerman} />
        </Box>
      </Container>
    </WideLayout>
  );
}
