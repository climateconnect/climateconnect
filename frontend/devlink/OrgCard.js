"use client";
import React from "react";
import * as _Builtin from "./_Builtin";
import * as _utils from "./utils";
import _styles from "./OrgCard.module.css";

export function OrgCard({ as: _Component = _Builtin.Block }) {
  return (
    <_Component className={_utils.cx(_styles, "div-org-cards")} tag="div">
      <_Builtin.Image
        className={_utils.cx(_styles, "image-org-logo")}
        loading="lazy"
        width="auto"
        height="auto"
        alt="sneep Logo"
        src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/651bf7dd5f3329028b31effb_277ad08ee6ea0f75097b7b79cf31f0c28358daa2.jpeg"
      />
      <_Builtin.Block className={_utils.cx(_styles, "text-block-38")} tag="div">
        {"Hochschulgruppe"}
      </_Builtin.Block>
      <_Builtin.Heading className={_utils.cx(_styles, "heading-118")} tag="h3">
        {"sneep"}
      </_Builtin.Heading>
      <_Builtin.Paragraph className={_utils.cx(_styles, "paragraph-139")}>
        {
          "Wir sind eine studentische Organisation an der Friedrich-Alexander-Universität, die sich mit Nachhaltigkeitsthemen beschäftigt."
        }
      </_Builtin.Paragraph>
      <_Builtin.Block className={_utils.cx(_styles, "div-block-158")} tag="div">
        <_Builtin.Block className={_utils.cx(_styles, "div-block-159")} tag="div">
          <_Builtin.Image
            className={_utils.cx(_styles, "image-124")}
            loading="lazy"
            width="auto"
            height="auto"
            alt="Icon Gruppe"
            src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/651bf5f26f6e865b2f5ebeea_Pfad%2010815.svg"
          />
          <_Builtin.Block className={_utils.cx(_styles, "text-block-34")} tag="div">
            {"15"}
          </_Builtin.Block>
        </_Builtin.Block>
        <_Builtin.Block className={_utils.cx(_styles, "div-block-159")} tag="div">
          <_Builtin.Image
            className={_utils.cx(_styles, "image-124")}
            loading="lazy"
            width="auto"
            height="auto"
            alt="Icon Projekt"
            src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/651bf5f2d308f8ac4a487899_content_paste_black_24dp.svg"
          />
          <_Builtin.Block className={_utils.cx(_styles, "text-block-34")} tag="div">
            {"7"}
          </_Builtin.Block>
        </_Builtin.Block>
      </_Builtin.Block>
    </_Component>
  );
}
