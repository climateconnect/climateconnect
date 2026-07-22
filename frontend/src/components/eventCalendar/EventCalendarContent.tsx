import {
  Badge,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  FormControl,
  FormControlLabel,
  Typography,
  useMediaQuery,
  useTheme,
  Theme,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import Cookies from "universal-cookie";
import { apiRequest } from "../../../public/lib/apiOperations";
import { getImageUrl } from "../../../public/lib/imageOperations";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import { getDisplaySortTimestamp, toTimestamp } from "../../utils/eventSorting";
import EventCardWide from "./EventCardWide";
import FilterSearchBar from "../filter/FilterSearchBar";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/de";
import "dayjs/locale/en";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";

const useStyles = makeStyles((theme) => ({
  mobileSearchBar: {
    width: "100%",
    marginBottom: theme.spacing(2),
  },
  leftSearchBar: {
    width: "100%",
  },
  filterLabel: {
    fontWeight: 600,
    marginBottom: theme.spacing(0.5),
  },
  topicList: {
    display: "flex",
    flexDirection: "column",
  },
  topicIcon: {
    height: 20,
    width: 20,
    marginRight: theme.spacing(0.5),
    flexShrink: 0,
  },
  topicLabel: {
    display: "flex",
    alignItems: "center",
    minWidth: 0,
  },
  layout: {
    display: "flex",
    gap: theme.spacing(4),
    alignItems: "flex-start",
    [theme.breakpoints.down("md")]: {
      flexDirection: "column",
    },
  },
  pageContainer: {
    paddingTop: theme.spacing(4),
    [theme.breakpoints.down("md")]: {
      paddingTop: theme.spacing(2),
    },
  },
  leftPanel: {
    width: 260,
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    [theme.breakpoints.down("md")]: {
      width: "100%",
    },
  },
  rightPanel: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(3),
  },
  dayHeader: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5),
    borderBottom: `1px solid ${theme.palette.divider}`,
    paddingBottom: theme.spacing(0.5),
    marginBottom: theme.spacing(1),
  },
  dayTile: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.spacing(0.5),
    padding: theme.spacing(0.5, 1.5),
    minWidth: 64,
  },
  dayTileMonth: {
    fontSize: 12,
    fontWeight: 600,
    textTransform: "uppercase",
    lineHeight: 1.2,
  },
  dayTileDay: {
    fontSize: 24,
    fontWeight: 700,
    lineHeight: 1.1,
  },
  dayWeekday: {
    fontSize: 18,
    fontWeight: 600,
  },
  dayGroup: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1.5),
  },
  mobileFilterButton: {
    marginBottom: theme.spacing(2),
  },
  resetButton: {
    alignSelf: "flex-start",
    marginTop: theme.spacing(1),
  },
  calendar: {
    width: "100%",
    overflow: "visible",
  },
  dayCell: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  eventDot: {
    width: 5,
    height: 5,
    borderRadius: "50%",
    backgroundColor: theme.palette.primary.main,
    marginTop: 2,
  },
  emptyState: {
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(4),
  },
  todayBadge: {
    "& .MuiBadge-badge": {
      fontSize: 9,
      height: 16,
      minWidth: 36,
      padding: "0 4px",
      borderRadius: 8,
      fontWeight: 700,
    },
  },
}));

const toYyyyMmDd = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

interface DayGroup {
  key: string;
  dayStartMs: number;
  weekday: string;
  dayNumber: string;
  monthName: string;
  occurrences: { project: any }[];
}

const buildDayGroups = (events: any[], locale: string): DayGroup[] => {
  const groups = new Map<string, DayGroup>();

  events.forEach((project) => {
    const start = new Date(project.start_date);
    const day = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const dayStartMs = day.getTime();
    const key = toYyyyMmDd(day);

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        dayStartMs,
        weekday: day.toLocaleDateString(locale, { weekday: "long" }),
        dayNumber: day.toLocaleDateString(locale, { day: "numeric" }),
        monthName: day.toLocaleDateString(locale, { month: "long" }),
        occurrences: [],
      });
    }
    groups.get(key)!.occurrences.push({ project });
  });

  const sortedGroups = Array.from(groups.values()).sort((a, b) => a.dayStartMs - b.dayStartMs);

  sortedGroups.forEach((group) => {
    group.occurrences.sort((a, b) => {
      const ta = getDisplaySortTimestamp(a.project, group.dayStartMs);
      const tb = getDisplaySortTimestamp(b.project, group.dayStartMs);
      if (ta === null && tb === null) return 0;
      if (ta === null) return 1;
      if (tb === null) return -1;
      if (ta !== tb) return ta - tb;
      const aa = toTimestamp(a.project?.start_date) ?? 0;
      const bb = toTimestamp(b.project?.start_date) ?? 0;
      return aa - bb;
    });
  });

  return sortedGroups;
};

export default function EventCalendarContent({
  initialEvents = [],
  initialHasMore = false,
  filterChoices,
  hubUrl,
}: any) {
  const { locale, CUSTOM_HUB_URLS } = useContext(UserContext);
  const classes = useStyles();
  const texts = getTexts({ page: "hub", locale: locale });
  const isNarrowScreen = useMediaQuery<Theme>((theme) => theme.breakpoints.down("md"));

  const [search, setSearch] = useState("");
  const [sectors, setSectors] = useState<string[]>([]);
  const [selectedDay, setSelectedDay] = useState<Dayjs>(dayjs());
  const [allEvents, setAllEvents] = useState<any[]>(initialEvents);
  const currentPageRef = useRef(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState<Dayjs>(dayjs().startOf("month"));
  const [dayCounts, setDayCounts] = useState<Record<string, number>>({});
  const didInitFetch = useRef(false);
  const theme = useTheme();
  const isCustomHub = CUSTOM_HUB_URLS?.includes(hubUrl);
  const startOfTodayMs = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  })();

  const fetchEvents = useCallback(
    async (page: number, append: boolean) => {
      setLoading(true);
      setError(false);
      const token = new Cookies().get("auth_token");
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (sectors.length) params.set("sectors", sectors.join(","));
      const start = selectedDay.startOf("day");
      params.set("start_date", start.format("YYYY-MM-DDTHH:mm:ssZ"));
      params.set("page", String(page));
      params.set("page_size", "12");
      if (hubUrl) params.set("hub", hubUrl);

      try {
        const { data } = await apiRequest({
          method: "get",
          url: `/api/events/?${params.toString()}`,
          token,
          locale,
        });
        const results = data.results || [];
        setAllEvents((prev) => (append ? [...prev, ...results] : results));
        currentPageRef.current = page;
        setHasMore(data.next !== null);
      } catch (e) {
        setError(true);
      } finally {
        setLoading(false);
      }
    },
    [search, sectors, selectedDay, hubUrl, locale]
  );

  const loadMore = useCallback(async () => {
    await fetchEvents(currentPageRef.current + 1, true);
  }, [fetchEvents]);

  const { lastElementRef } = useInfiniteScroll({
    hasMore,
    isLoading: loading,
    onLoadMore: loadMore,
  });

  // Skip the initial fetch: the SSR-provided `initialEvents` already covers
  // page 1, so re-fetching on mount is redundant. We still fetch once if SSR
  // returned nothing so the UI is never stuck empty.
  useEffect(() => {
    if (didInitFetch.current) {
      const handler = setTimeout(
        () => {
          setAllEvents([]);
          currentPageRef.current = 1;
          setHasMore(false);
          fetchEvents(1, false);
        },
        search ? 400 : 0
      );
      return () => clearTimeout(handler);
    }
    didInitFetch.current = true;
    if (initialEvents.length === 0) {
      const handler = setTimeout(() => {
        fetchEvents(1, false);
      }, 0);
      return () => clearTimeout(handler);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, sectors, selectedDay, hubUrl]);

  const fetchCounts = async () => {
    const token = new Cookies().get("auth_token");
    const params = new URLSearchParams();
    params.set("year", String(viewMonth.year()));
    params.set("month", String(viewMonth.month() + 1));
    params.set("timezone", Intl.DateTimeFormat().resolvedOptions().timeZone);
    if (search) params.set("search", search);
    if (sectors.length) params.set("sectors", sectors.join(","));
    if (hubUrl) params.set("hub", hubUrl);
    try {
      const { data } = await apiRequest({
        method: "get",
        url: `/api/events/calendar/?${params.toString()}`,
        token,
        locale,
      });
      const map: Record<string, number> = {};
      if (Array.isArray(data)) {
        data.forEach((item: { date: string; count: number }) => {
          map[item.date] = item.count;
        });
      }
      setDayCounts(map);
    } catch (e) {
      setDayCounts({});
    }
  };

  useEffect(() => {
    const handler = setTimeout(
      () => {
        fetchCounts();
      },
      search ? 400 : 0
    );
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMonth, search, sectors, hubUrl]);

  const handleToggleSector = (name: string) => {
    setSectors((prev) => (prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]));
  };

  const handleReset = () => {
    setSearch("");
    setSectors([]);
    setSelectedDay(dayjs());
  };

  const DayWithEvents = (props: any) => {
    const { day, outsideCurrentMonth, ...other } = props;
    const key = day.format("YYYY-MM-DD");
    const count = dayCounts[key] || 0;
    return (
      <div className={classes.dayCell}>
        <PickersDay
          {...other}
          day={day}
          outsideCurrentMonth={outsideCurrentMonth}
          sx={{ width: 32, height: 32, fontSize: 13, margin: 0 }}
        />
        {!outsideCurrentMonth && count > 0 && (
          <span
            className={classes.eventDot}
            title={`${count} ${count === 1 ? "event" : "events"}`}
          />
        )}
      </div>
    );
  };

  const dayGroups = buildDayGroups(allEvents, locale);

  const showLeftPanel = !isNarrowScreen || mobileFiltersOpen;

  return (
    <Container maxWidth="lg" className={classes.pageContainer}>
      {isNarrowScreen && (
        <FilterSearchBar
          className={classes.mobileSearchBar}
          label={texts.search_events ?? "Search events"}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onSubmit={(_type, value) => setSearch(value)}
          type="events"
        />
      )}

      {isNarrowScreen && (
        <Button
          className={classes.mobileFilterButton}
          variant="outlined"
          onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
        >
          {texts.filters ?? "Filters"}
        </Button>
      )}

      <div className={classes.layout}>
        {showLeftPanel && (
          <div className={classes.leftPanel}>
            {!isNarrowScreen && (
              <FilterSearchBar
                className={classes.leftSearchBar}
                label={texts.search_events ?? "Search events"}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onSubmit={(_type, value) => setSearch(value)}
                type="events"
              />
            )}
            <LocalizationProvider adapterLocale={locale} dateAdapter={AdapterDayjs}>
              <DateCalendar
                className={classes.calendar}
                value={selectedDay}
                onChange={(newValue: Dayjs | null) => {
                  const value = newValue ?? dayjs();
                  setSelectedDay(value);
                  if (value.year() !== viewMonth.year() || value.month() !== viewMonth.month()) {
                    setViewMonth(value.startOf("month"));
                  }
                }}
                onMonthChange={(newValue: Dayjs) => setViewMonth(newValue.startOf("month"))}
                slots={{ day: DayWithEvents }}
              />
            </LocalizationProvider>

            <FormControl component="fieldset" fullWidth>
              <Typography component="legend" className={classes.filterLabel}>
                {texts.topic ?? "Topics"}
              </Typography>
              <div className={classes.topicList}>
                {(filterChoices?.sectors || []).map((s: any) => (
                  <FormControlLabel
                    key={s.original_name}
                    control={
                      <Checkbox
                        size="small"
                        checked={sectors.includes(s.original_name)}
                        onChange={() => handleToggleSector(s.original_name)}
                      />
                    }
                    label={
                      <span className={classes.topicLabel}>
                        {s.icon && (
                          <img src={getImageUrl(s.icon)} className={classes.topicIcon} alt="" />
                        )}
                        <Typography component="span" variant="body2" noWrap>
                          {s.name}
                        </Typography>
                      </span>
                    }
                  />
                ))}
              </div>
            </FormControl>

            <Button
              className={classes.resetButton}
              variant="outlined"
              color="primary"
              onClick={handleReset}
            >
              {texts.reset ?? "Reset"}
            </Button>
          </div>
        )}

        <div className={classes.rightPanel}>
          {loading && allEvents.length === 0 && <CircularProgress />}
          {error && (
            <Typography className={classes.emptyState}>
              {texts.error_loading_events ?? "Failed to load events."}
            </Typography>
          )}
          {!loading && !error && dayGroups.length === 0 && (
            <Typography className={classes.emptyState}>
              {texts.no_events ?? "No events found for the selected filters."}
            </Typography>
          )}
          {!error &&
            dayGroups.map((group, groupIdx) => {
              const isLastGroup = groupIdx === dayGroups.length - 1;
              const isToday = group.dayStartMs === startOfTodayMs;
              const isPast = group.dayStartMs < startOfTodayMs;
              const tileBg = isPast
                ? isCustomHub
                  ? theme.palette.grey.light
                  : theme.palette.secondary.extraLight
                : isCustomHub
                ? theme.palette.primary.main
                : theme.palette.yellow.main;
              const tileColor = isPast
                ? isCustomHub
                  ? theme.palette.text.primary
                  : theme.palette.secondary.main
                : theme.palette.background.default_contrastText;

              return (
                <Box key={group.key} ref={isLastGroup ? lastElementRef : undefined}>
                  <div className={classes.dayHeader}>
                    <Badge
                      badgeContent={isToday ? "Today" : null}
                      color="secondary"
                      className={classes.todayBadge}
                      anchorOrigin={{ vertical: "top", horizontal: "right" }}
                    >
                      <div
                        className={classes.dayTile}
                        style={{
                          backgroundColor: tileBg,
                          color: tileColor,
                        }}
                      >
                        <span className={classes.dayTileMonth}>{group.monthName}</span>
                        <span className={classes.dayTileDay}>{group.dayNumber}</span>
                      </div>
                    </Badge>
                    <Typography className={classes.dayWeekday} component="span">
                      {group.weekday}
                    </Typography>
                  </div>
                  <div className={classes.dayGroup}>
                    {group.occurrences.map((occurrence) => (
                      <EventCardWide
                        key={occurrence.project.url_slug}
                        project={occurrence.project}
                        hubUrl={hubUrl}
                      />
                    ))}
                  </div>
                </Box>
              );
            })}
          {loading && allEvents.length > 0 && <CircularProgress size={24} />}
        </div>
      </div>
    </Container>
  );
}
