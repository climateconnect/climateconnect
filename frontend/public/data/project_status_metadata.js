import React from "react";
import BuildIcon from "@material-ui/icons/Build";
import EmojiObjectsIcon from "@material-ui/icons/EmojiObjects";
import DoneAllIcon from "@material-ui/icons/DoneAll";
import RotateRightIcon from "@material-ui/icons/RotateRight";
import CancelIcon from "@material-ui/icons/Cancel";

const project_status_metadata = [
  {
    key: "idea",
    icon: <EmojiObjectsIcon />,
    name: "Idea",
    createProjectLabel: "an idea"
  },
  {
    key: "inprogress",
    icon: <BuildIcon />,
    name: "In progress",
    createProjectLabel: "in progress"
  },
  {
    key: "finished",
    icon: <DoneAllIcon />,
    name: "Successfully finished",
    createProjectLabel: "successfully finished"
  },
  {
    key: "cancelled",
    icon: <CancelIcon />,
    name: "Cancelled",
    createProjectLabel: "cancelled"
  },
  {
    key: "recurring",
    icon: <RotateRightIcon />,
    name: "Recurring",
    createProjectLabel: "recurring"
  }
];

export default project_status_metadata;
