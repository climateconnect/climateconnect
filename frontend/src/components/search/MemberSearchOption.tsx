import { IconButton } from "@mui/material";
import { styled } from "@mui/material/styles";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import React from "react";
import MiniProfilePreview from "../profile/MiniProfilePreview";

const PreviewWrapper = styled("div")({
  minWidth: 0,
  maxWidth: "100%",
  "& span, & div": {
    minWidth: 0,
    maxWidth: "100%",
  },
  "& h6, & p": {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: "100%",
  },
});

type Props = { option; liProps? };

export default function MemberSearchOption({ option, liProps }: Props) {
  const { key, ...props } = liProps ?? ({} as any);
  return (
    <li key={key} {...props}>
      <IconButton size="large">
        <AddCircleOutlineIcon />
      </IconButton>
      <PreviewWrapper>
        <MiniProfilePreview profile={option} nolink size="medium" title={option.location} />
      </PreviewWrapper>
    </li>
  );
}
