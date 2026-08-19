import { useRouter } from "next/router";
import { getBrowsePathForType, getHubBrowsePathForType } from "../../public/lib/urlOperations";
import { BrowseEntity } from "../types";

// The four entries shown in the main page nav (desktop top, mobile bottom).
// `BrowseEntity` covers the three entity browsers; the events calendar is
// added as a sibling because it shares the nav row and the same URL-rewriting
// conventions, even though it is a different view on the data.
export type PageNavEntry = BrowseEntity | "events";

const BROWSE_ENTRIES: readonly BrowseEntity[] = ["projects", "organizations", "members"] as const;

export function usePageNavEntries(args: { hubUrl?: string; subHubSegment?: string }) {
  const router = useRouter();
  const { hubUrl = "", subHubSegment } = args;

  const getHref = (entry: PageNavEntry): string => {
    if (entry === "events") {
      return hubUrl
        ? `/hubs/${hubUrl}${subHubSegment ? `/${subHubSegment}` : ""}/events`
        : "/events";
    }
    return hubUrl
      ? getHubBrowsePathForType(entry, hubUrl, subHubSegment)
      : getBrowsePathForType(entry);
  };

  /**
   * Whether the given entry is the one the user is currently on. `activeEntry`
   * is the entity-browser entry that the page reports as active; the events
   * entry is derived from the URL pathname (it has no semantic prop on the
   * events page because it is the only entry in its own nav row).
   */
  const isActive = (entry: PageNavEntry, activeEntry: BrowseEntity | null): boolean => {
    if (entry === "events") return router.pathname.includes("/events");
    return activeEntry === entry;
  };

  return { browseEntries: BROWSE_ENTRIES, getHref, isActive };
}
