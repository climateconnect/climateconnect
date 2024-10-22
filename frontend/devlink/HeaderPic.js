"use client";
import React from "react";
import * as _Builtin from "./_Builtin";
import * as _utils from "./utils";
import _styles from "./HeaderPic.module.css";

export function HeaderPic({ as: _Component = _Builtin.Section }) {
  return (
    <_Component
      className={_utils.cx(_styles, "header")}
      tag="div"
      grid={{
        type: "section",
      }}
    >
      <_Builtin.Container className={_utils.cx(_styles, "container-4")} tag="div" />
    </_Component>
  );
}
