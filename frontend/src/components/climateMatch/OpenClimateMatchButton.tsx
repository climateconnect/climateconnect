import { Badge, Button } from "@mui/material";
import React, { useContext } from "react";
import { getLocalePrefix } from "../../../public/lib/apiOperations";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";

export default function OpenClimateMatchButton({ className, hubUrl, text }) {
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "climatematch", locale: locale });
  return (
    <Badge badgeContent={texts.new} color="error">
      <Button
        href={`${getLocalePrefix(locale)}/climatematch?from_hub=${hubUrl}`}
        variant="contained"
        color="primary"
        size="small"
        className={className}
      >
        {text ? text : "ClimateMatch"}
      </Button>
    </Badge>
  );
}
