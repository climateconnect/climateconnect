import React, { useContext } from "react";
import { Checkbox, IconButton, Theme, Tooltip, Typography } from "@mui/material";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

type Props = {
  currentHubName: string;
  handleUpdateSelectedHub: (hubName: string) => void;
  ToolTipIcon?: React.ElementType;
};

export default function CustomHubSelection({
  currentHubName,
  handleUpdateSelectedHub,
  ToolTipIcon,
}: Props) {
  if (!ToolTipIcon) {
    ToolTipIcon = HelpOutlineIcon;
  }

  const { locale } = useContext(UserContext);
  const texts = getTexts({ locale: locale, page: "project" });

  const label = { inputProps: { "aria-label": "PRIO1 project checkbox" } };
  const prio1Project = currentHubName == "prio1";

  function handlePrio1ProjectCheckbox(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.checked) {
      handleUpdateSelectedHub("prio1");
    } else {
      handleUpdateSelectedHub("");
    }
  }

  return (
    <Typography component="h2" variant="subtitle2">
      <Checkbox {...label} checked={prio1Project} onChange={handlePrio1ProjectCheckbox} />
      {texts.my_project_is_part_of_the_prio1_project}
      <Tooltip title={texts.tooltip_my_project_is_part_of_the_prio1_project}>
        <IconButton size="large">
          <ToolTipIcon />
        </IconButton>
      </Tooltip>
    </Typography>
  );
}
