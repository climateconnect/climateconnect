"use client";
import React from "react";
import * as _Builtin from "./_Builtin";
import * as _utils from "./utils";
import _styles from "./QuoteWOCms.module.css";

export function QuoteWOCms({
  as: _Component = _Builtin.Block,
  nameQuote = "First and Lastname",
  bezeichnung = "Regelmäßige Spenderin",
  quote = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere.",
  pictureQuote = "https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/65afba11ede231819e8b7fed_FFF%20Er.jpeg",
}) {
  return (
    <_Component className={_utils.cx(_styles, "div-quote-wo-cms")} tag="div">
      <_Builtin.Block className={_utils.cx(_styles, "div-block-109")} tag="div">
        <_Builtin.Image
          className={_utils.cx(_styles, "image-80")}
          height="auto"
          loading="lazy"
          width="auto"
          alt=""
          src={pictureQuote}
        />
        <_Builtin.Block
          className={_utils.cx(_styles, "div-block-108")}
          tag="div"
        >
          <_Builtin.Block
            className={_utils.cx(_styles, "text-block-15")}
            tag="div"
          >
            {nameQuote}
          </_Builtin.Block>
          <_Builtin.Block
            className={_utils.cx(_styles, "text-block-17")}
            tag="div"
          >
            {bezeichnung}
          </_Builtin.Block>
        </_Builtin.Block>
      </_Builtin.Block>
      <_Builtin.Paragraph className={_utils.cx(_styles, "paragraph-123")}>
        {quote}
      </_Builtin.Paragraph>
    </_Component>
  );
}
