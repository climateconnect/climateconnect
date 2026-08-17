import { GetServerSidePropsContext } from "next";
import {
  getOrganizationTagsOptions,
  getSkillsOptions,
  getSectorOptions,
} from "../../../public/lib/getOptions";
import { getLocationFilteredBy } from "../../../public/lib/locationOperations";
import { extractHubUrlsFromContext, getAllHubs } from "../../../public/lib/hubOperations";
import { getHubData, getLinkedHubsData } from "../../../public/lib/getHubData";
import getHubTheme from "../../themes/fetchHubTheme";
import { retrieveDescriptionFromWebflow } from "../../utils/webflow";
import isLocationHubLikeHub from "../../../public/lib/isLocationHubLikeHub";
import { isWasseraktionswochenEnabled } from "../../../public/data/wasseraktionswochen_config.js";
import { LocaleType } from "../../types";

export async function getHubBrowseTypeServerSideProps(
  ctx: GetServerSidePropsContext,
  internalType: string
) {
  const locale = ctx.locale as LocaleType;
  let hubUrl = Array.isArray(ctx.query.hubUrl) ? ctx.query.hubUrl[0] : ctx.query.hubUrl ?? "";
  const subHubSegment = Array.isArray(ctx.query.subHub)
    ? ctx.query.subHub[0]
    : ctx.query.subHub ?? null;
  const parentHubUrl = hubUrl;
  const { subHub } = extractHubUrlsFromContext(ctx);
  if (subHub) hubUrl = subHub;

  const [
    hubData,
    organization_types,
    skills,
    location_filtered_by,
    allHubs,
    hubDescription,
    hubThemeData,
    linkedHubs,
    sectorOptions,
  ] = await Promise.all([
    getHubData(hubUrl, locale),
    getOrganizationTagsOptions(locale),
    getSkillsOptions(locale),
    getLocationFilteredBy(ctx.query, locale),
    getAllHubs(locale, false),
    retrieveDescriptionFromWebflow(ctx.query, locale),
    getHubTheme(parentHubUrl),
    getLinkedHubsData(hubUrl),
    getSectorOptions(locale, hubUrl),
  ]);

  const filterChoices: any = {};
  if (internalType === "projects") {
    filterChoices.organization_types = organization_types;
    filterChoices.sectors = sectorOptions;
    filterChoices.skills = skills;
  } else if (internalType === "organizations") {
    filterChoices.organization_types = organization_types;
    filterChoices.sectors = sectorOptions;
    filterChoices.skills = skills;
  } else if (internalType === "members") {
    filterChoices.sectors = sectorOptions;
    filterChoices.skills = skills;
  }

  return {
    props: {
      hubUrl: ctx.query.hubUrl,
      subHubUrl: subHub || null,
      subHubSegment: subHubSegment || null,
      isLocationHub: isLocationHubLikeHub(hubData?.hub_type, hubData?.parent_hub),
      hubData,
      name: hubData?.name ?? null,
      headline: hubData?.headline ?? null,
      subHeadline: hubData?.sub_headline ?? null,
      welcomeMessageLoggedIn: hubData?.welcome_message_logged_in ?? null,
      welcomeMessageLoggedOut: hubData?.welcome_message_logged_out ?? null,
      image: hubData?.image ?? null,
      quickInfo: hubData?.quick_info ?? null,
      stats: hubData?.stats ?? null,
      statBoxTitle: hubData?.stat_box_title ?? null,
      image_attribution: hubData?.image_attribution ?? null,
      filterChoices,
      initialLocationFilter: location_filtered_by,
      sectorHubs: allHubs ? allHubs.filter((h: any) => h?.hub_type === "sector hub") : null,
      allHubs,
      hubDescription,
      hubThemeData,
      linkedHubs: linkedHubs || [],
      showWasseraktionswochen: isWasseraktionswochenEnabled(),
    },
  };
}
