"use client";
import React from "react";
import * as _Builtin from "./_Builtin";
import * as _utils from "./utils";
import _styles from "./NavBar.module.css";

export function NavBar({
  as: _Component = _Builtin.NavbarWrapper,
  navButtonOutlineText = "Mitglied werden",
  imageImage = "https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/63e508bf07c771200433c04c_CC%20DE%20Logo%20Kopie.svg",
}) {
  return (
    <_Component
      className={_utils.cx(_styles, "navbar")}
      tag="div"
      config={{
        animation: "default",
        collapse: "small",
        docHeight: false,
        duration: 400,
        easing: "ease",
        easing2: "ease",
        noScroll: false,
      }}
    >
      <_Builtin.NavbarContainer
        className={_utils.cx(_styles, "container-3")}
        tag="div"
      >
        <_Builtin.NavbarBrand
          options={{
            href: "#",
          }}
        >
          <_Builtin.Image
            className={_utils.cx(_styles, "image")}
            loading="lazy"
            width="250"
            height="auto"
            alt=""
            src={imageImage}
          />
        </_Builtin.NavbarBrand>
        <_Builtin.NavbarMenu
          className={_utils.cx(_styles, "nav-menu")}
          tag="nav"
          role="navigation"
        >
          <_Builtin.DropdownWrapper
            className={_utils.cx(_styles, "dropdown-2")}
            tag="div"
            delay="0"
            hover={true}
          >
            <_Builtin.DropdownToggle
              className={_utils.cx(_styles, "dropdown-toggle")}
              tag="div"
            >
              <_Builtin.Icon
                className={_utils.cx(_styles, "icon-2")}
                widget={{
                  type: "icon",
                  icon: "dropdown-toggle",
                }}
              />
              <_Builtin.Block className={_utils.cx(_styles, "text")} tag="div">
                {"ClimateHubs"}
              </_Builtin.Block>
            </_Builtin.DropdownToggle>
            <_Builtin.DropdownList
              className={_utils.cx(_styles, "dropdown-list-2")}
              tag="nav"
            >
              <_Builtin.DropdownLink
                className={_utils.cx(_styles, "text")}
                options={{
                  href: "#",
                  target: "_blank",
                }}
              >
                {"Erlangen"}
              </_Builtin.DropdownLink>
              <_Builtin.DropdownLink
                className={_utils.cx(_styles, "text")}
                options={{
                  href: "#",
                  target: "_blank",
                }}
              >
                {"Potsdam"}
              </_Builtin.DropdownLink>
            </_Builtin.DropdownList>
          </_Builtin.DropdownWrapper>
          <_Builtin.NavbarLink
            className={_utils.cx(_styles, "nav-link")}
            options={{
              href: "https://climateconnect.earth/de/hubs",
            }}
          >
            {"Zu Den climatehubs"}
          </_Builtin.NavbarLink>
          <_Builtin.NavbarLink
            className={_utils.cx(_styles, "nav-link")}
            options={{
              href: "#",
            }}
          >
            {"Unsere Projekte"}
          </_Builtin.NavbarLink>
          <_Builtin.NavbarLink
            className={_utils.cx(_styles, "nav-button-outline")}
            options={{
              href: "#",
            }}
          >
            {navButtonOutlineText}
          </_Builtin.NavbarLink>
        </_Builtin.NavbarMenu>
        <_Builtin.NavbarButton
          className={_utils.cx(_styles, "menu-button")}
          tag="div"
        >
          <_Builtin.Icon
            widget={{
              type: "icon",
              icon: "nav-menu",
            }}
          />
        </_Builtin.NavbarButton>
      </_Builtin.NavbarContainer>
    </_Component>
  );
}
