"use client";
import React from "react";
import * as _Builtin from "./_Builtin";
import * as _utils from "./utils";
import _styles from "./TestSuccess.module.css";

export function TestSuccess({ as: _Component = _Builtin.Section }) {
  return (
    <_Component
      className={_utils.cx(_styles, "section-32")}
      grid={{
        type: "section",
      }}
      tag="div"
      id="interessierte-stadte"
    >
      <_Builtin.Container className={_utils.cx(_styles, "container-37")} tag="div">
        <_Builtin.Block className={_utils.cx(_styles, "text-block-6")} tag="div">
          {
            "Nous sommes actifs dans plusieurs villes d'Allemagne dont Erlangen, Marbourg et Potsdam. Et le mouvement est en marche car de plus en plus d'autres villes et associations viennent nous contacter pour avoir leur ClimateHub."
          }
          <br />
          {
            "Comme le changement climatique est mondial il nous faut agir en coopérant de façon synchrone.Pour ça quoi de mieux que de pouvoir échanger et répliquer les projets qui fonctionnent le mieux avec l'étranger ?"
          }
          <br />
          {"‍"}
        </_Builtin.Block>
        <_Builtin.HtmlEmbed
          className={_utils.cx(_styles, "html-embed-4")}
          value="%3Ciframe%20src%3D%22https%3A%2F%2Fwww.google.com%2Fmaps%2Fd%2Fu%2F0%2Fembed%3Fmid%3D1SVmpXWHW4_I7rFR5xra2fFE9MC-DuYJd%26ehbc%3D2E312F%22%20width%3D%22640%22%20height%3D%22480%22%3E%3C%2Fiframe%3E"
        />
      </_Builtin.Container>
    </_Component>
  );
}
