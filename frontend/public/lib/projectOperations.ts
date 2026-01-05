import { CcLocale } from "../../src/types";
import { apiRequest } from "./apiOperations";

/**
 * Calls endpoint to return a current list
 * of users that have requested to
 * join a specific project (i.e. requested membership).
 *
 * Note that the response includes a list of requests
 * (with corresponding request ID), and the users themselves.
 */
export async function getMembershipRequests(url_slug: string, locale: CcLocale, token: string) {
  const resp = await apiRequest({
    method: "get",
    url: `/api/projects/${url_slug}/requesters/`,
    locale: locale,
    token: token,
  });

  // TODO: we should probably have an associated timestamp with each request too.
  return resp.data.results;
}
