import NextLink from "next/link";
import { useRouter } from "next/router";
import React, { useContext } from "react";
import MuiLink, { LinkProps as MuiLinkProps } from "@mui/material/Link";
import { appHref } from "../../../public/lib/appLink";
import { HubContext } from "../context/HubContext";

/**
 * The standard internal-navigation link. It is an extension of MUI's `Link`:
 * every MUI `Link` prop (`color`, `underline`, `variant`, `typography`, ...)
 * keeps working exactly as before, and we only add `leaveHub`.
 *
 * Under the hood it renders MUI's `Link` with `next/link` as the underlying
 * component, so clicks are handled by the Next.js router. The `href` is built
 * by `appHref` from the active hub (read from `HubContext`) and the current
 * locale, so callers never hand-concatenate `?hub=` or the locale prefix.
 *
 * "Preserve hub" is the default: the active hub slug is appended as
 * `?hub=<slug>` for internal cross-entity navigation. External / absolute URLs
 * are passed through untouched. `leaveHub` opts out of the `?hub=` append
 * (Category B — intentionally leaving the hub) and is greppable so reviewers
 * can audit leave-hub decisions.
 */
export type AppLinkProps = MuiLinkProps & {
  href: string | object;
  leaveHub?: boolean;
};

export default function AppLink({ href, leaveHub = false, ...rest }: AppLinkProps) {
  const router = useRouter();
  const { hubUrl } = useContext(HubContext);

  // `appHref` only operates on string hrefs; a `UrlObject` href is forwarded
  // as-is (this link machinery is for string paths).
  const resolvedHref =
    typeof href === "string" ? appHref(href, { leaveHub, hubUrl, locale: router.locale }) : href;

  return <MuiLink component={NextLink} href={resolvedHref} {...rest} />;
}
