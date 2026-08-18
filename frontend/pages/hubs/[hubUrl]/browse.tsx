import { GetServerSideProps } from "next";
import React, { useContext } from "react";
import { useRouter } from "next/router";
import { getHubBrowseTypeServerSideProps } from "../../../src/components/hub/getHubBrowseTypeServerSideProps";
import HubPageLayout from "../../../src/components/hub/HubPageLayout";
import BrowseProjectsContent from "../../../src/components/browse/BrowseProjectsContent";
import { FilterProvider } from "../../../src/components/provider/FilterProvider";
import UserContext from "../../../src/components/context/UserContext";
import Cookies from "universal-cookie";
import { getHubBrowsePathForType } from "../../../public/lib/urlOperations";

export const getServerSideProps: GetServerSideProps = (ctx) =>
  getHubBrowseTypeServerSideProps(ctx, "projects");

const TYPES = ["projects", "organizations", "members"];

export default function HubProjectsPage({
  hubUrl,
  subHubSegment,
  filterChoices,
  initialLocationFilter,
  hubData,
  hubThemeData,
  linkedHubs,
  allHubs,
  isLocationHub,
}: any) {
  const cookies = new Cookies();
  const token = cookies.get("auth_token");
  const { locale } = useContext(UserContext);
  const router = useRouter();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    const targetPath = getHubBrowsePathForType(TYPES[newValue], hubUrl, subHubSegment);
    const params = new URLSearchParams(window.location.search);
    router.push(`${targetPath}${params.toString() ? `?${params}` : ""}`);
  };

  return (
    <HubPageLayout
      activeTab={0}
      TYPES_BY_TAB_VALUE={TYPES}
      handleTabChange={handleTabChange}
      hubUrl={hubUrl}
      subHubSegment={subHubSegment}
      linkedHubs={linkedHubs}
      hubData={hubData}
      hubThemeData={hubThemeData}
      allHubs={allHubs}
      isLocationHub={isLocationHub}
    >
      <FilterProvider
        filterChoices={filterChoices}
        initialLocationFilter={initialLocationFilter}
        locale={locale}
        token={token}
        hubUrl={hubUrl}
      >
        <BrowseProjectsContent
          filterChoices={filterChoices}
          initialLocationFilter={initialLocationFilter}
        />
      </FilterProvider>
    </HubPageLayout>
  );
}
