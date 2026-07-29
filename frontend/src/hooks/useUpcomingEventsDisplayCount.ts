import { Theme, useMediaQuery } from "@mui/material";

// Number of upcoming events to display in the dedicated UpcomingEventsGroup
// band. The caller clamps this to the number of events actually returned by
// the API (max 4) and uses the result to decide whether to render the
// separate UpcomingEventsGroup or merge the events into the project grid.
//
// The counts are chosen so events always fit in a single row when using
// the default ProjectPreviews grid (xs:12, sm:6, md:4, lg:3) so we never
// wrap to a second row on tablet/desktop:
//   xs (<600px):  2 events stacked vertically (2 rows of 1)
//   sm (600-900): 2 events, 1 horizontal row (matches grid 2/row)
//   md (900-1200): 3 events, 1 horizontal row (matches grid 3/row)
//   lg+ (>=1200):  4 events, 1 horizontal row (matches grid 4/row)
export function useUpcomingEventsDisplayCount(): number {
  const isXs = useMediaQuery<Theme>((theme) => theme.breakpoints.down("sm"));
  const isMd = useMediaQuery<Theme>((theme) => theme.breakpoints.only("md"));
  const isLgUp = useMediaQuery<Theme>((theme) => theme.breakpoints.up("lg"));

  if (isXs) return 2;
  if (isLgUp) return 4;
  if (isMd) return 3;
  return 2;
}
