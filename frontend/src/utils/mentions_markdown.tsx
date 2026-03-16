import { Link } from "@mui/material";
import React, { JSXElementConstructor, ReactElement, ReactFragment, ReactPortal } from "react";
import { getLocalePrefix } from "../../public/lib/apiOperations";

const displayedMention = (
  locale: any,
  id: string,
  display:
    | string
    | number
    | boolean
    | ReactElement<any, string | JSXElementConstructor<any>>
    | ReactFragment
    | ReactPortal
    | null
    | undefined
) => (
  <Link href={getLocalePrefix(locale) + "/profiles/" + id} target="_blank" underline="hover">
    @{display}
  </Link>
);

const getFragmentsWithMentions = (content: string, linkify: boolean, locale: any) => {
  if (!content) {
    return null;
  }

  // this matches all future markdown substrings in the string
  const r = /@@@__([^^]*)\^\^__([^@]*)@@@\^\^\^/g;

  // this one only matches at the beginning of the string
  const g = /^@@@__([^^]*)\^\^__([^@]*)@@@\^\^\^/g;

  const fragments: (string | ReactElement)[] = [];
  for (let i = 0; i < content.length; i++) {
    const m = content.substring(i);
    const greedyMatch = [...m.matchAll(g)];
    const fullMatch = [...m.matchAll(r)];

    if (greedyMatch.length !== 0) {
      // the next substring matches the markdown, so turn it into a link
      const display = greedyMatch[0][2];
      const id = greedyMatch[0][1];
      if (linkify) {
        fragments.push(displayedMention(locale, id, display));
      } else {
        fragments.push(`@${display}`);
      }
      i += greedyMatch[0][0].length - 1;
    } else {
      if (fullMatch.length !== 0) {
        // there exists another mention later in the string, find it and render what's in between as text
        fragments.push(m.substring(0, fullMatch[0].index));
        if (!fullMatch[0].index) throw Error("impossible");
        i += fullMatch[0].index - 1;
      } else {
        // there aren't any more mentions, so render the rest of the string as text
        fragments.push(m);
        i += m.length - 1;
      }
    }
  }
  return fragments;
};

export { getFragmentsWithMentions, displayedMention };
