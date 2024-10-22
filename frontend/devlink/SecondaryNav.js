"use client";
import React from "react";
import * as _Builtin from "./_Builtin";
import * as _utils from "./utils";
import _styles from "./SecondaryNav.module.css";

export function SecondaryNav({ as: _Component = _Builtin.Section }) {
  return (
    <_Component
      className={_utils.cx(_styles, "section")}
      grid={{
        type: "section",
      }}
      tag="div"
    >
      <_Builtin.NavbarWrapper
        className={_utils.cx(_styles, "navbar-2")}
        tag="div"
        config={{
          animation: "default",
          collapse: "tiny",
          docHeight: false,
          duration: 400,
          easing: "ease",
          easing2: "ease",
          noScroll: false,
        }}
      >
        <_Builtin.NavbarContainer className={_utils.cx(_styles, "container-6")} tag="div">
          <_Builtin.NavbarMenu tag="nav" role="navigation">
            <_Builtin.Link
              className={_utils.cx(_styles, "link-3")}
              button={false}
              block=""
              options={{
                href: "#",
              }}
            >
              {"Blog"}
            </_Builtin.Link>
            <_Builtin.Link
              className={_utils.cx(_styles, "link-3")}
              button={false}
              block=""
              options={{
                href: "https://climateconnect.earth/de/about",
              }}
            >
              {"Über uns"}
            </_Builtin.Link>
            <_Builtin.Link
              className={_utils.cx(_styles, "link-3")}
              button={false}
              block=""
              options={{
                href: "#",
              }}
            >
              {"Team"}
            </_Builtin.Link>
            <_Builtin.Link
              className={_utils.cx(_styles, "link-3")}
              button={false}
              block=""
              options={{
                href: "#",
              }}
            >
              {"Presse"}
            </_Builtin.Link>
            <_Builtin.Link
              className={_utils.cx(_styles, "link-3")}
              button={false}
              block=""
              options={{
                href: "#",
              }}
            >
              {"Transparenz"}
            </_Builtin.Link>
            <_Builtin.Link
              className={_utils.cx(_styles, "link-3")}
              button={false}
              block=""
              options={{
                href: "https://climateconnect.earth/de/donate",
              }}
            >
              {"Spenden"}
            </_Builtin.Link>
            <_Builtin.Link
              className={_utils.cx(_styles, "link-3")}
              button={false}
              block=""
              options={{
                href: "https://climateconnect.earth/de/faq",
              }}
            >
              {"FAQ"}
            </_Builtin.Link>
          </_Builtin.NavbarMenu>
          <_Builtin.NavbarButton className={_utils.cx(_styles, "menu-button-2")} tag="div">
            <_Builtin.Block className={_utils.cx(_styles, "div-block-5")} tag="div">
              <_Builtin.Heading className={_utils.cx(_styles, "heading-6")} tag="h3">
                {"Über uns"}
              </_Builtin.Heading>
              <_Builtin.Image
                className={_utils.cx(_styles, "image-6")}
                loading="lazy"
                width="18"
                height="auto"
                alt=""
                src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/6166bc57f520cd5d0ca04921_Icon%20ionic-ios-arrow-down.svg"
              />
            </_Builtin.Block>
          </_Builtin.NavbarButton>
        </_Builtin.NavbarContainer>
      </_Builtin.NavbarWrapper>
    </_Component>
  );
}
