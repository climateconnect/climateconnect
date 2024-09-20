"use client";
import React from "react";
import * as _Builtin from "./_Builtin";
import * as _utils from "./utils";
import _styles from "./GreenButton.module.css";

export function GreenButton({ as: _Component = _Builtin.Link }) {
  return (
    <_Component
      className={_utils.cx(_styles, "button-4")}
      button={true}
      block=""
      options={{
        href: "#",
      }}
    >
      {"Unterstützung zeigen"}
    </_Component>
  );
}
