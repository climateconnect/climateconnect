import { GetServerSideProps } from "next";
import React, { useContext } from "react";
import { useRouter } from "next/router";
import { getHubBrowseTypeServerSideProps } from "../../../src/components/hub/getHubBrowseTypeServerSideProps";
import HubPageLayout from "../../../src/components/hub/HubPageLayout";
import BrowseMembersContent from "../../../src/components/browse/BrowseMembersContent";
import { FilterProvider } from "../../../src/components/provider/FilterProvider";
import UserContext from "../../../src/components/context/UserContext";
import Cookies from "universal-cookie";

export const getServerSideProps: GetServerSideProps = (ctx) =>
  getHubBrowseTypeServerSideProps(ctx, "members");

const TYPES = ["projects", "organizations", "members"];

export default function HubMembersPage({
  hubUrl,
  subHubUrl,
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
  const effectiveHubUrl = subHubUrl || hubUrl;
  const browsePath = subHubSegment ? `/hubs/${hubUrl}/${subHubSegment}` : `/hubs/${hubUrl}`;

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    const tab = TYPES[newValue];
    const targetPath =
      tab === "projects"
        ? `${browsePath}/projects`
        : tab === "organizations"
        ? `${browsePath}/organisations`
        : `${browsePath}/members`;
    const params = new URLSearchParams(window.location.search);
    router.push(`${targetPath}${params.toString() ? `?${params}` : ""}`);
  };

  return (
    <HubPageLayout
      activeTab={2}
      TYPES_BY_TAB_VALUE={TYPES}
      handleTabChange={handleTabChange}
      hubUrl={effectiveHubUrl}
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
      >
        <BrowseMembersContent
          filterChoices={filterChoices}
          initialLocationFilter={initialLocationFilter}
        />
      </FilterProvider>
    </HubPageLayout>
  );
}
