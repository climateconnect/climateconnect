import Link from "next/link";
import { useRouter } from "next/router";
import React, { ComponentProps, useContext } from "react";
import { appHref } from "../../../public/lib/appLink";
import { HubContext } from "../context/HubContext";

type NextLinkProps = ComponentProps<typeof Link>;

export interface AppLinkProps extends Omit<NextLinkProps, "href"> {
  /**
   * Destination href. Relative paths (starting with `/`) receive the locale
   * prefix and — unless `leaveHub` is set — the active `?hub=` slug. Absolute /
   * external URLs are passed through untouched.
   */
  href: NextLinkProps["href"];
  /**
   * When true, the active hub is *not* appended (Category B — "intentionally
   * leave hub"). Greppable so reviewers can audit leave-hub decisions.
   */
  leaveHub?: boolean;
}

/**
 * The standard internal-navigation link: a thin wrapper over `next/link` that
 * builds a hub- and locale-aware href so callers never hand-concatenate
 * `?hub=` or the locale prefix.
 *
 * "Preserve hub" is the default: the active hub slug (read from `HubContext`)
 * is appended as `?hub=<slug>` for internal cross-entity navigation, and the
 * locale prefix is applied to relative paths. Both transformations are
 * delegated to the shared `appHref` helper, so query strings, fragments and
 * encoding are always well-formed.
 *
 * The resolved href is pre-prefixed and passed to `next/link` *without* a
 * `locale` prop — matching the existing `next/link` call sites, so no double
 * prefix is produced. All other props are forwarded unchanged.
 */
export default function AppLink({ href, leaveHub = false, ...rest }: AppLinkProps) {
  const router = useRouter();
  const { hubUrl } = useContext(HubContext);

  // `appHref` only operates on string hrefs; a `UrlObject` href is forwarded
  // as-is (this link machinery is for string paths).
  const resolvedHref =
    typeof href === "string" ? appHref(href, { leaveHub, hubUrl, locale: router.locale }) : href;

  return <Link href={resolvedHref} {...rest} />;
}
