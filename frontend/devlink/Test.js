"use client";
import React from "react";
import * as _Builtin from "./_Builtin";
import * as _utils from "./utils";
import _styles from "./Test.module.css";

export function Test({
  as: _Component = _Builtin.DropdownWrapper,
  dropdownRuntimeProps = {},
}) {
  return (
    <_Component
      className={_utils.cx(_styles, "dropdown")}
      tag="div"
      delay={0}
      hover={true}
      {...dropdownRuntimeProps}
    >
      <_Builtin.DropdownToggle
        className={_utils.cx(_styles, "dropdown-toggle-4")}
        tag="div"
      >
        <_Builtin.Icon
          widget={{
            type: "icon",
            icon: "dropdown-toggle",
          }}
        />
        <_Builtin.Block
          className={_utils.cx(_styles, "text-block-23")}
          tag="div"
        >
          {"Zu deinem ClimateHub"}
        </_Builtin.Block>
      </_Builtin.DropdownToggle>
      <_Builtin.DropdownList
        className={_utils.cx(_styles, "dropdown-list-3")}
        tag="nav"
      >
        <_Builtin.DropdownLink
          options={{
            href: "#",
            target: "_blank",
          }}
        >
          {"Erlangen"}
        </_Builtin.DropdownLink>
        <_Builtin.DropdownLink
          options={{
            href: "#",
            target: "_blank",
          }}
        >
          {"Potsdam"}
        </_Builtin.DropdownLink>
        <_Builtin.DropdownLink
          options={{
            href: "#",
            target: "_blank",
          }}
        >
          {"Marburg"}
        </_Builtin.DropdownLink>
        <_Builtin.DropdownLink
          options={{
            href: "#",
          }}
        >
          {"Deine Stadt nicht dabei?Schreib uns eine Mail"}
        </_Builtin.DropdownLink>
      </_Builtin.DropdownList>
    </_Component>
  );
}
