"use client";
import React from "react";
import * as _Builtin from "./_Builtin";
import * as _interactions from "./interactions";
import * as _utils from "./utils";
import _styles from "./UncoveringUtopie.module.css";

const _interactionsData = JSON.parse(
  '{"events":{"e-480":{"id":"e-480","name":"","animationType":"custom","eventTypeId":"PAGE_SCROLL","action":{"id":"","actionTypeId":"GENERAL_CONTINUOUS_ACTION","config":{"actionListId":"a-74","affectedElements":{},"duration":0}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"wf-page-id","appliesTo":"PAGE","styleBlockIds":[]},"targets":[{"id":"wf-page-id","appliesTo":"PAGE","styleBlockIds":[]}],"config":[{"continuousParameterGroupId":"a-74-p","smoothing":50,"startsEntering":true,"addStartOffset":false,"addOffsetValue":50,"startsExiting":false,"addEndOffset":false,"endOffsetValue":50}],"createdOn":1708090291958}},"actionLists":{"a-74":{"id":"a-74","title":"Uncoder utopie","continuousParameterGroups":[{"id":"a-74-p","type":"SCROLL_PROGRESS","parameterLabel":"Scroll","continuousActionGroups":[{"keyframe":2,"actionItems":[{"id":"a-74-n-4","actionTypeId":"STYLE_SIZE","config":{"delay":0,"easing":"","duration":500,"target":{"selector":".image-155","selectorGuids":["c9b6aabd-2cf7-4ff7-b7de-bf5bc9a9dac6"]},"widthValue":0,"heightValue":257,"widthUnit":"%","heightUnit":"px","locked":false}}]},{"keyframe":9,"actionItems":[{"id":"a-74-n-3","actionTypeId":"STYLE_SIZE","config":{"delay":0,"easing":"","duration":500,"target":{"selector":".image-155","selectorGuids":["c9b6aabd-2cf7-4ff7-b7de-bf5bc9a9dac6"]},"widthValue":100,"heightValue":257,"widthUnit":"%","heightUnit":"px","locked":false}}]}]}],"createdOn":1708090301788}},"site":{"mediaQueries":[{"key":"main","min":992,"max":10000},{"key":"medium","min":768,"max":991},{"key":"small","min":480,"max":767},{"key":"tiny","min":0,"max":479}]}}'
);

export function UncoveringUtopie({ as: _Component = _Builtin.Block }) {
  _interactions.useInteractions(_interactionsData, _styles);

  return (
    <_Component tag="div">
      <_Builtin.Block className={_utils.cx(_styles, "div-block-218")} tag="div">
        <_Builtin.Image
          className={_utils.cx(_styles, "image-158")}
          loading="lazy"
          width="384"
          height="auto"
          alt=""
          src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/65cf631e030e8d161afcede3_Torstrasse-autofrei-Berlin-by-Tom-Meiser-Timo-Schmid-vorher-2048x1365.webp"
        />
        <_Builtin.Image
          className={_utils.cx(_styles, "image-155")}
          loading="lazy"
          width="auto"
          height="auto"
          alt="Grüne Straße mit Fußgängern und Radfaheren"
          src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/65cf634dee821446d0eba5c5_Torstrasse-autofrei-Berlin-by-Tom-Meiser-Timo-Schmid-2048x1365.webp"
        />
      </_Builtin.Block>
      <_Builtin.Block className={_utils.cx(_styles, "text-block-58")} tag="div">
        {"Torstraße autofrei Berlin by Tom Meiser & Timo Schmid, CC BY-NC-SA 4.0"}
      </_Builtin.Block>
    </_Component>
  );
}
