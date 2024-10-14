"use client";
import React from "react";
import * as _Builtin from "./_Builtin";
import * as _utils from "./utils";
import _styles from "./SuccesStories.module.css";

export function SuccesStories({
  as: _Component = _Builtin.Section,
  image = "https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/6305e7b0afc98552c59749ab_francesco-ungaro-MJ1Q7hHeGlA-unsplash.jpg",
}) {
  return (
    <_Component
      grid={{
        type: "section",
      }}
      tag="div"
    >
      <_Builtin.Container className={_utils.cx(_styles, "container-34")} tag="div">
        <_Builtin.Heading className={_utils.cx(_styles, "heading-39")} tag="h3">
          {"Comment les ClimatesHubs ont accéléré l'impact en ville"}
        </_Builtin.Heading>
      </_Builtin.Container>
    </_Component>
  );
}
