"use client";
import React from "react";
import * as _Builtin from "./_Builtin";
import * as _utils from "./utils";
import _styles from "./PreFooter.module.css";

export function PreFooter({ as: _Component = _Builtin.Section }) {
  return (
    <_Component
      className={_utils.cx(_styles, "pre-footer-section")}
      grid={{
        type: "section",
      }}
      tag="div"
    >
      <_Builtin.Container
        className={_utils.cx(_styles, "pre-footer-con")}
        tag="div"
      >
        <_Builtin.Heading className={_utils.cx(_styles, "heading-8")} tag="h2">
          <_Builtin.Span className={_utils.cx(_styles, "text-span")}>
            {"Arbeite zusammen"}
          </_Builtin.Span>
          {", lass dich inspirieren und nimm echten Einfluss "}
          <_Builtin.Span className={_utils.cx(_styles, "text-span-2")}>
            {"auf den Klimawandel!"}
          </_Builtin.Span>
        </_Builtin.Heading>
        <_Builtin.Link
          className={_utils.cx(_styles, "button-list-asso")}
          button={true}
          block=""
          options={{
            href: "https://climateconnect.earth/de/signup",
          }}
        >
          {"Registrieren"}
        </_Builtin.Link>
      </_Builtin.Container>
    </_Component>
  );
}
