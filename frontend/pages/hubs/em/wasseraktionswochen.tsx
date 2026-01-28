import { Box, Container } from "@mui/material";
import { GetServerSideProps } from "next";
import WideLayout from "../../../src/components/layouts/WideLayout";
import { apiRequest } from "../../../public/lib/apiOperations";
import WasseraktionswochenEvents from "../../../src/components/hub/WasseraktionswochenEvents";
import theme from "../../../src/themes/theme";
import { Wasseraktionswochen } from "../../../devlink";
import makeStyles from "@mui/styles/makeStyles";
import LocalAmbassadorInfoBox from "../../../src/components/hub/LocalAmbassadorInfoBox";
import { getHubAmbassadorData, getHubData } from "../../../public/lib/getHubData";

interface WasseraktionswochenPageProps {
  locale: string;
  projects: any[];
  hubAmbassador: any;
  hubData: any;
}

const PARENT_SLUG = "wasseraktionswochen-143-2932026";
const HUB_URL = "em";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const locale = context.locale || "en";

  let projects: any[] = [];
  let hubAmbassador = null;
  let hubData = null;

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

  // Fetch hub data and ambassador
  try {
    hubData = await getHubData(HUB_URL, locale);
    hubAmbassador = await getHubAmbassadorData(HUB_URL, locale);
  } catch (err) {
    console.log("Failed to load hub data", err);
  }

  return {
    props: {
      locale,
      projects,
      hubAmbassador,
      hubData,
    },
  };
};

const useStyles = makeStyles(() => ({
  content: {
    position: "relative",
  },
  ambassadorBox: {
    position: "fixed",
    bottom: 16,
    right: 16,
    zIndex: 1000,
  },
}));

export default function WasseraktionswochenPage({
  locale,
  projects,
  hubAmbassador,
  hubData,
}: WasseraktionswochenPageProps) {
  const isGerman = locale === "de";
  const classes = useStyles();

  return (
    <WideLayout
      title={isGerman ? "Wasseraktionswochen" : "Water Action Weeks"}
      hideAlert
      isHubPage
      hasHubLandingPage={true}
      hubUrl="em"
      headerBackground={theme.palette.background.default}
    >
      <div className={classes.content}>
        <Wasseraktionswochen />
        <Container>
          <WasseraktionswochenEvents projects={projects} isGerman={isGerman} />
        </Container>
        {hubAmbassador && hubData && (
          <div className={classes.ambassadorBox}>
            <LocalAmbassadorInfoBox
              hubAmbassador={hubAmbassador}
              hubData={hubData}
              hubSupportersExists={false}
            />
          </div>
        )}
      </div>
    </WideLayout>
  );
}
