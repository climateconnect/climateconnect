import { Link } from "@material-ui/core";
import { getLocalePrefix } from "../../public/lib/apiOperations";

const getFragmentsWithMentions = (content, linkify, locale) => {
  // this matches all future markdown substrings in the string
  let r = /@@@__([^\^]*)\^\^__([^\@]*)@@@\^\^\^/g;

  // this one only matches at the beginning of the string
  let g = /^@@@__([^\^]*)\^\^__([^\@]*)@@@\^\^\^/g;

  let fragments = [];
  for (let i = 0; i < content.length; i++) {
    let m = content.substring(i);
    let greedyMatch = [...m.matchAll(g)];
    let fullMatch = [...m.matchAll(r)];

    if (greedyMatch.length !== 0) {
      // the next substring matches the markdown, so turn it into a link
      let display = greedyMatch[0][2];
      let id = greedyMatch[0][1];
      if (linkify) {
        fragments.push(<Link href={getLocalePrefix(locale) + "/profiles/" + id}>@{display}</Link>);
      } else {
        fragments.push(`@${display}`);
      }
      i += greedyMatch[0][0].length - 1;
    } else {
      if (fullMatch.length !== 0) {
        // there exists another mention later in the string, find it and render what's in between as text
        fragments.push(m.substring(0, fullMatch[0].index));
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

export { getFragmentsWithMentions };
