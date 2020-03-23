import React from "react";
import { Chip } from "@material-ui/core";
import BuildIcon from "@material-ui/icons/Build";
import EmojiObjectsIcon from "@material-ui/icons/EmojiObjects";
import DoneAllIcon from "@material-ui/icons/DoneAll";
import RotateRightIcon from "@material-ui/icons/RotateRight";
import CancelIcon from "@material-ui/icons/Cancel";

const project_status_metadata = [
  {
    key: "idea",
    icon: <EmojiObjectsIcon />,
    name: "Idea"
  },
  {
    key: "inprogress",
    icon: <BuildIcon />,
    name: "In progress"
  },
  {
    key: "finished",
    icon: <DoneAllIcon />,
    name: "Successfully finished"
  },
  {
    key: "cancelled",
    icon: <CancelIcon />,
    name: "Cancelled"
  },
  {
    key: "recurring",
    icon: <RotateRightIcon />,
    name: "Recurring"
  }
];

export default function ProjectStatus({ status, className }) {
  const fullStatus = project_status_metadata.find(s => s.key === status);
  return <Chip className={className} icon={fullStatus.icon} label={fullStatus.name} />;
}
