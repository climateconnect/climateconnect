import { Container } from "@mui/material";
import { GetServerSideProps } from "next";
import WideLayout from "../../../src/components/layouts/WideLayout";
import { apiRequest } from "../../../public/lib/apiOperations";
import WasseraktionswochenEvents from "../../../src/components/hub/WasseraktionswochenEvents";
import theme from "../../../src/themes/theme";
import { Wasseraktionswochen } from "../../../devlink";
import makeStyles from "@mui/styles/makeStyles";
import LocalAmbassadorInfoBox from "../../../src/components/hub/LocalAmbassadorInfoBox";
import { getHubAmbassadorData, getHubData } from "../../../public/lib/getHubData";
import { getImageUrl } from "../../../public/lib/imageOperations";

interface WasseraktionswochenPageProps {
  locale: string;
  projects: any[];
  hubAmbassador: any;
  hubData: any;
  parentProject: any;
}

const PARENT_SLUG = "wasseraktionswochen-143-2932026";
const HUB_URL = "em";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const locale = context.locale || "en";

  let projects: any[] = [];
  let hubAmbassador = null;
  let hubData = null;
  let parentProject = null;

  try {
    // Fetch child projects and parent project in parallel
    const [childResp, parentResp] = await Promise.all([
      apiRequest({
        method: "get",
        url: `/api/projects/?parent_project_slug=${PARENT_SLUG}&page_size=100`,
        locale,
      }),
      apiRequest({
        method: "get",
        url: `/api/projects/${PARENT_SLUG}/`,
        locale,
      }),
    ]);

    // Process child projects
    const results = childResp?.data?.results || [];
    projects = results.map((project) => ({
      ...project,
      sectors: (project.sectors || [])
        .sort((a: any, b: any) => (a?.order || 0) - (b?.order || 0))
        .map((s: any) => s.sector),
    }));

    // Store parent project
    parentProject = parentResp?.data || null;
  } catch (err) {
    console.log("Failed to load project data", err?.response?.data || err);
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
      parentProject,
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
  parentProject,
}: WasseraktionswochenPageProps) {
  const isGerman = locale === "de";
  const classes = useStyles();

  // Get SEO metadata from parent project
  const pageTitle =
    parentProject?.name || (isGerman ? "Wasseraktionswochen" : "Water Action Weeks");
  const pageDescription =
    parentProject?.short_description ||
    (isGerman
      ? "Entdecke alle Veranstaltungen der Wasseraktionswochen im Landkreis Emmendingen"
      : "Discover all events of the Water Action Weeks in the Emmendingen District");
  const pageImage = parentProject?.image ? getImageUrl(parentProject.image) : undefined;

  return (
    <WideLayout
      title={pageTitle}
      description={pageDescription}
      image={pageImage}
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
