import React, { useContext, useMemo } from "react";
import { BottomNavigation, BottomNavigationAction, Box, styled } from "@mui/material";
import ContactAmbassadorButton from "../hub/ContactAmbassadorButton";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Groups2Icon from "@mui/icons-material/Groups2";
import DateRangeRoundedIcon from "@mui/icons-material/DateRangeRounded";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";

const StyledNavAction = styled(BottomNavigationAction)(({ theme }) => ({
  minWidth: 0,
  padding: "6px 4px 8px",
  gap: 2,
  "& .MuiBottomNavigationAction-label": {
    fontSize: "0.6rem",
    lineHeight: 1.2,
    marginTop: 1,
    opacity: 1,
    whiteSpace: "nowrap",
    color: theme.palette.text.secondary,
    "&.Mui-selected": {
      fontSize: "0.6rem",
      color: theme.palette.getContrastText(
        theme.palette.background.default_contrastText || theme.palette.primary.main
      ),
    },
  },
  "& .MuiSvgIcon-root": {
    color: theme.palette.text.secondary,
    fontSize: "1.4rem",
  },
  "&.Mui-selected": {
    backgroundColor: theme.palette.background.default_contrastText || theme.palette.primary.main,
    borderRadius: 16,
    margin: "4px 6px",
    paddingTop: 6,
    paddingBottom: 8,
    "& .MuiSvgIcon-root": {
      color: theme.palette.getContrastText(
        theme.palette.background.default_contrastText || theme.palette.primary.main
      ),
    },
  },
}));

const type_icons: Record<string, React.ElementType> = {
  projects: AssignmentIcon,
  organizations: Groups2Icon,
  events: DateRangeRoundedIcon,
  members: AccountCircleIcon,
};

const TYPE_TEXT_KEYS: Record<string, string> = {
  projects: "projects",
  organizations: "organizations",
  members: "members",
  events: "event_calendar",
};

export default function MobileBottomMenu({
  tabValue,
  handleTabChange,
  TYPES_BY_TAB_VALUE,
  hubAmbassador,
  hubUrl,
}) {
  const { locale } = useContext(UserContext);
  const texts = useMemo(() => getTexts({ page: "hub", locale: locale }), [locale]);

  return (
    <Box
      sx={(theme) => ({
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        backgroundColor: theme.palette.background.paper,
        borderTop: `1px solid ${theme.palette.divider}`,
      })}
    >
      <ContactAmbassadorButton mobile hubAmbassador={hubAmbassador} hubUrl={hubUrl} />
      <BottomNavigation
        value={tabValue}
        onChange={handleTabChange}
        showLabels
        sx={{
          backgroundColor: "transparent",
          height: "auto",
          px: 0.5,
        }}
      >
        {TYPES_BY_TAB_VALUE.map((type: string, index: number) => {
          const Icon = type_icons[type];
          const label = texts[TYPE_TEXT_KEYS[type]] || type;
          return (
            <StyledNavAction
              key={index}
              label={label}
              icon={Icon ? <Icon /> : null}
              value={index}
            />
          );
        })}
      </BottomNavigation>
    </Box>
  );
}
