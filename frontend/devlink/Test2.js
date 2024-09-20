"use client";
import React from "react";
import * as _Builtin from "./_Builtin";
import * as _interactions from "./interactions";
import * as _utils from "./utils";
import _styles from "./Test2.module.css";

const _interactionsData = JSON.parse(
  '{"events":{"e-681":{"id":"e-681","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-54","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-680"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"65c0ff603d80ee6dd2de6f5d|3c547c6f-979d-2d38-6742-4498998d9956","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"65c0ff603d80ee6dd2de6f5d|3c547c6f-979d-2d38-6742-4498998d9956","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":0,"direction":null,"effectIn":true},"createdOn":1715952841215},"e-682":{"id":"e-682","name":"","animationType":"preset","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-69","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-683"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"65c0ff603d80ee6dd2de6f5d|3c547c6f-979d-2d38-6742-4498998d9956","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"65c0ff603d80ee6dd2de6f5d|3c547c6f-979d-2d38-6742-4498998d9956","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715952841215},"e-683":{"id":"e-683","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-70","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-682"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"65c0ff603d80ee6dd2de6f5d|3c547c6f-979d-2d38-6742-4498998d9956","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"65c0ff603d80ee6dd2de6f5d|3c547c6f-979d-2d38-6742-4498998d9956","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":0,"direction":null,"effectIn":true},"createdOn":1715952841215},"e-685":{"id":"e-685","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-54","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-684"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"65c0ff603d80ee6dd2de6f5d|3c547c6f-979d-2d38-6742-4498998d9956","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"65c0ff603d80ee6dd2de6f5d|3c547c6f-979d-2d38-6742-4498998d9956","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":0,"direction":null,"effectIn":true},"createdOn":1715952841215},"e-687":{"id":"e-687","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-54","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-686"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"65c0ff603d80ee6dd2de6f5d|3c547c6f-979d-2d38-6742-4498998d995f","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"65c0ff603d80ee6dd2de6f5d|3c547c6f-979d-2d38-6742-4498998d995f","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715952841215},"e-689":{"id":"e-689","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-54","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-688"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"65c0ff603d80ee6dd2de6f5d|3c547c6f-979d-2d38-6742-4498998d995f","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"65c0ff603d80ee6dd2de6f5d|3c547c6f-979d-2d38-6742-4498998d995f","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715952841215},"e-690":{"id":"e-690","name":"","animationType":"preset","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-69","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-691"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"65c0ff603d80ee6dd2de6f5d|3c547c6f-979d-2d38-6742-4498998d995f","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"65c0ff603d80ee6dd2de6f5d|3c547c6f-979d-2d38-6742-4498998d995f","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715952841215},"e-691":{"id":"e-691","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-70","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-690"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"65c0ff603d80ee6dd2de6f5d|3c547c6f-979d-2d38-6742-4498998d995f","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"65c0ff603d80ee6dd2de6f5d|3c547c6f-979d-2d38-6742-4498998d995f","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715952841215},"e-693":{"id":"e-693","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-54","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-692"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"65c0ff603d80ee6dd2de6f5d|3c547c6f-979d-2d38-6742-4498998d9968","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"65c0ff603d80ee6dd2de6f5d|3c547c6f-979d-2d38-6742-4498998d9968","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715952841215},"e-695":{"id":"e-695","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-54","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-694"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"65c0ff603d80ee6dd2de6f5d|3c547c6f-979d-2d38-6742-4498998d9968","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"65c0ff603d80ee6dd2de6f5d|3c547c6f-979d-2d38-6742-4498998d9968","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715952841215},"e-696":{"id":"e-696","name":"","animationType":"preset","eventTypeId":"TAB_ACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-69","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-697"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"65c0ff603d80ee6dd2de6f5d|3c547c6f-979d-2d38-6742-4498998d9968","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"65c0ff603d80ee6dd2de6f5d|3c547c6f-979d-2d38-6742-4498998d9968","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715952841215},"e-697":{"id":"e-697","name":"","animationType":"preset","eventTypeId":"TAB_INACTIVE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-70","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-696"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"65c0ff603d80ee6dd2de6f5d|3c547c6f-979d-2d38-6742-4498998d9968","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"65c0ff603d80ee6dd2de6f5d|3c547c6f-979d-2d38-6742-4498998d9968","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1715952841215}},"actionLists":{"a-54":{"id":"a-54","title":"Tab not active animation","actionItemGroups":[{"actionItems":[{"id":"a-54-n","actionTypeId":"GENERAL_DISPLAY","config":{"delay":0,"easing":"","duration":0,"target":{},"value":"block"}}]},{"actionItems":[{"id":"a-54-n-2","actionTypeId":"GENERAL_DISPLAY","config":{"delay":0,"easing":"","duration":0,"target":{},"value":"none"}}]}],"useFirstGroupAsInitialState":false,"createdOn":1698243233294},"a-69":{"id":"a-69","title":"Tab in view 2","actionItemGroups":[{"actionItems":[{"id":"a-69-n","actionTypeId":"GENERAL_DISPLAY","config":{"delay":0,"easing":"","duration":0,"target":{"useEventTarget":"CHILDREN","selector":".text-block-46","selectorGuids":["5a530494-ae5d-000e-16bf-3439c8092b0e"]},"value":"block"}}]}],"useFirstGroupAsInitialState":false,"createdOn":1698243351131},"a-70":{"id":"a-70","title":"Tab not active animation 2","actionItemGroups":[{"actionItems":[{"id":"a-70-n","actionTypeId":"GENERAL_DISPLAY","config":{"delay":0,"easing":"","duration":0,"target":{"useEventTarget":"CHILDREN","selector":".text-block-46","selectorGuids":["5a530494-ae5d-000e-16bf-3439c8092b0e"]},"value":"block"}}]},{"actionItems":[{"id":"a-70-n-2","actionTypeId":"GENERAL_DISPLAY","config":{"delay":0,"easing":"","duration":0,"target":{"useEventTarget":"CHILDREN","selector":".text-block-46","selectorGuids":["5a530494-ae5d-000e-16bf-3439c8092b0e"]},"value":"none"}}]}],"useFirstGroupAsInitialState":false,"createdOn":1698243233294}},"site":{"mediaQueries":[{"key":"main","min":992,"max":10000},{"key":"medium","min":768,"max":991},{"key":"small","min":480,"max":767},{"key":"tiny","min":0,"max":479}]}}'
);

export function Test2({ as: _Component = _Builtin.Block }) {
  _interactions.useInteractions(_interactionsData, _styles);

  return (
    <_Component tag="div">
      <_Builtin.Section
        className={_utils.cx(_styles, "section-header-ch-desktop")}
        grid={{
          type: "section",
        }}
        tag="section"
      >
        <_Builtin.BlockContainer
          className={_utils.cx(_styles, "container-67")}
          grid={{
            type: "container",
          }}
          tag="div"
        >
          <_Builtin.Image
            className={_utils.cx(_styles, "line-1")}
            loading="lazy"
            width="auto"
            height="auto"
            alt=""
            src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/659680ce18c9fd0e673be88a_Line%201.svg"
          />
          <_Builtin.Block
            className={_utils.cx(_styles, "div-block-190")}
            tag="div"
          >
            <_Builtin.SliderWrapper
              className={_utils.cx(_styles, "slider-9")}
              navSpacing={3}
              navShadow={false}
              autoplay={true}
              delay={4000}
              iconArrows={true}
              animation="slide"
              navNumbers={true}
              easing="ease"
              navRound={true}
              hideArrows={false}
              disableSwipe={false}
              duration={500}
              infinite={true}
              autoMax={0}
              navInvert={false}
            >
              <_Builtin.SliderMask className={_utils.cx(_styles, "mask-5")}>
                <_Builtin.SliderSlide tag="div">
                  <_Builtin.Block
                    className={_utils.cx(_styles, "div-block-180", "pic1")}
                    tag="div"
                  />
                </_Builtin.SliderSlide>
                <_Builtin.SliderSlide tag="div">
                  <_Builtin.Block
                    className={_utils.cx(_styles, "div-block-180", "pic2")}
                    tag="div"
                  />
                </_Builtin.SliderSlide>
                <_Builtin.SliderSlide tag="div">
                  <_Builtin.Block
                    className={_utils.cx(_styles, "div-block-180", "pic-3")}
                    tag="div"
                  />
                </_Builtin.SliderSlide>
              </_Builtin.SliderMask>
              <_Builtin.SliderArrow
                className={_utils.cx(_styles, "left-arrow-6")}
                dir="left"
              >
                <_Builtin.Icon
                  widget={{
                    type: "icon",
                    icon: "slider-left",
                  }}
                />
              </_Builtin.SliderArrow>
              <_Builtin.SliderArrow
                className={_utils.cx(_styles, "right-arrow-6")}
                dir="right"
              >
                <_Builtin.Icon
                  widget={{
                    type: "icon",
                    icon: "slider-right",
                  }}
                />
              </_Builtin.SliderArrow>
              <_Builtin.SliderNav
                className={_utils.cx(_styles, "slide-nav-5")}
              />
            </_Builtin.SliderWrapper>
          </_Builtin.Block>
          <_Builtin.Block
            className={_utils.cx(_styles, "div-block-195")}
            tag="div"
          >
            <_Builtin.Heading
              className={_utils.cx(_styles, "heading-117-copy")}
              tag="h1"
            >
              <_Builtin.Span
                className={_utils.cx(_styles, "text-span-22-copy")}
              >
                {"Gemeinsam "}
              </_Builtin.Span>
              {"für Potsdam Anpacken"}
            </_Builtin.Heading>
            <_Builtin.Block
              className={_utils.cx(_styles, "text-block-31-copy")}
              tag="div"
            >
              {
                "Der ClimateHub zeigt dir die großen Hebel im Klimaschutz. Finde Potsdamer Projekte und Gruppen um selber an zu packen und deinen Handabdruck zu vergrößern."
              }
            </_Builtin.Block>
            <_Builtin.Block
              className={_utils.cj(
                _utils.cx(_styles, "div-block-168"),
                "w-clearfix"
              )}
              tag="div"
            >
              <_Builtin.Link
                className={_utils.cx(_styles, "button-gradient")}
                button={true}
                block=""
                options={{
                  href: "https://climateconnect.earth/de/hubs/potsdam",
                }}
              >
                {"zum ClimateHub"}
              </_Builtin.Link>
              <_Builtin.Block
                className={_utils.cx(_styles, "div-block-169")}
                tag="div"
              >
                <_Builtin.Image
                  className={_utils.cx(_styles, "image-125")}
                  loading="lazy"
                  width="auto"
                  height="auto"
                  alt="Icon Gruppe"
                  src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/651bf5f26f6e865b2f5ebeea_Pfad%2010815.svg"
                />
                <_Builtin.Block
                  className={_utils.cx(_styles, "number-users", "tips")}
                  tag="div"
                >
                  {"206"}
                </_Builtin.Block>
              </_Builtin.Block>
              <_Builtin.Block
                className={_utils.cx(_styles, "text-block")}
                tag="div"
              >
                {"& DU?"}
              </_Builtin.Block>
            </_Builtin.Block>
          </_Builtin.Block>
        </_Builtin.BlockContainer>
        <_Builtin.Block
          className={_utils.cx(_styles, "div-block-118-copy")}
          tag="div"
          href="#Handprint1"
        >
          <_Builtin.Block
            className={_utils.cx(_styles, "text-block-19-copy")}
            tag="div"
          >
            {"Mehr über den ClimateHub"}
          </_Builtin.Block>
          <_Builtin.Image
            loading="lazy"
            width="39"
            height="auto"
            alt="Pfeil nach unten"
            src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/653919892456c0cc8a05cc5d_Pfad%2013399.svg"
          />
        </_Builtin.Block>
      </_Builtin.Section>
      <_Builtin.Section
        className={_utils.cx(_styles, "section-104")}
        grid={{
          type: "section",
        }}
        tag="section"
      >
        <_Builtin.BlockContainer
          className={_utils.cx(_styles, "container-66")}
          grid={{
            type: "container",
          }}
          tag="div"
        >
          <_Builtin.Image
            className={_utils.cx(_styles, "image-134")}
            loading="lazy"
            width="183"
            height="auto"
            alt=""
            src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/65941be2e6398748e3c0ce2d_Pfad%2013421.svg"
          />
          <_Builtin.Block
            className={_utils.cx(_styles, "div-block-182")}
            tag="div"
          >
            <_Builtin.Heading
              className={_utils.cx(_styles, "heading-125")}
              tag="h2"
            >
              {"Lass dein schlechtes Klima-Gewissen zu Hause!"}
            </_Builtin.Heading>
            <_Builtin.Paragraph className={_utils.cx(_styles, "paragraph-143")}>
              {
                "Bist du auch oft demotiviert vom CO2 Fußabdruck? Die meisten Menschen fühlen sich unter Druck gesetzt oder sogar hilflos, wenn sie ihren Fußabdruck berechnen. Dabei ist es so einfach eine viel größere Wirkung zu erzielen! "
              }
            </_Builtin.Paragraph>
          </_Builtin.Block>
          <_Builtin.Block
            className={_utils.cx(_styles, "div-block-183")}
            tag="div"
          >
            <_Builtin.Heading
              className={_utils.cx(_styles, "heading-125-copy")}
              tag="h2"
            >
              {"Wir zeigen dir, wie..."}
            </_Builtin.Heading>
            <_Builtin.Block
              className={_utils.cx(_styles, "div-block-199")}
              tag="div"
            />
          </_Builtin.Block>
        </_Builtin.BlockContainer>
      </_Builtin.Section>
      <_Builtin.Section
        className={_utils.cx(_styles, "section-ch-projects")}
        grid={{
          type: "section",
        }}
        tag="section"
      >
        <_Builtin.BlockContainer
          className={_utils.cx(_styles, "container-61")}
          grid={{
            type: "container",
          }}
          tag="div"
        >
          <_Builtin.Heading
            className={_utils.cx(_styles, "heading-123")}
            tag="h1"
          >
            {"Was wir gemeinsam schon erreicht haben"}
          </_Builtin.Heading>
          <_Builtin.SliderWrapper
            className={_utils.cx(_styles, "slider-projects")}
            navSpacing={3}
            navShadow={false}
            autoplay={false}
            delay={4000}
            iconArrows={true}
            animation="slide"
            navNumbers={false}
            easing="ease"
            navRound={true}
            hideArrows={false}
            disableSwipe={false}
            duration={500}
            infinite={true}
            autoMax={0}
            navInvert={false}
          >
            <_Builtin.SliderMask className={_utils.cx(_styles, "mask-4")}>
              <_Builtin.SliderSlide tag="div">
                <_Builtin.Block
                  className={_utils.cx(_styles, "slide-wrapper")}
                  tag="div"
                >
                  <_Builtin.Block
                    className={_utils.cj(
                      _utils.cx(_styles, "div-project-card-slide"),
                      "w-clearfix"
                    )}
                    tag="div"
                  >
                    <_Builtin.Image
                      className={_utils.cx(_styles, "image-120-copy")}
                      width="auto"
                      height="auto"
                      loading="lazy"
                      alt="Banner BürgerEnergieTag"
                      src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/65bb8e8eedde1cab2200b88b_%E2%9E%A1%EF%B8%8F%20(1920%20x%20720%20px).jpg"
                    />
                    <_Builtin.Heading
                      className={_utils.cx(_styles, "heading-118")}
                      tag="h3"
                    >
                      {"BürgerEnergieTag Potsdam"}
                    </_Builtin.Heading>
                    <_Builtin.Block
                      className={_utils.cx(_styles, "text-block-33")}
                      tag="div"
                    >
                      {"Durch den ClimateHub organisiert"}
                    </_Builtin.Block>
                    <_Builtin.Paragraph
                      className={_utils.cx(_styles, "paragraph-139")}
                    >
                      {
                        "Wir gründen eine Bürgerenergie-Genossenschaft für Potsdam! Am 23.02.24 starten wir mit dem BürgerEnergieTag ein neues Kapitel in der Potsdamer Energiewende. "
                      }
                    </_Builtin.Paragraph>
                    <_Builtin.Block
                      className={_utils.cx(_styles, "div-block-158")}
                      tag="div"
                    >
                      <_Builtin.Block
                        className={_utils.cx(_styles, "div-block-159")}
                        tag="div"
                      >
                        <_Builtin.Image
                          className={_utils.cx(_styles, "image-121")}
                          width="auto"
                          height="auto"
                          loading="lazy"
                          alt="Herz icon"
                          src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/651bd91736364e7718c3a6e0_favorite_FILL1_wght400_GRAD0_opsz48.svg"
                        />
                        <_Builtin.Block
                          className={_utils.cx(_styles, "text-block-34")}
                          tag="div"
                        >
                          {"5"}
                        </_Builtin.Block>
                      </_Builtin.Block>
                      <_Builtin.Block
                        className={_utils.cx(_styles, "div-block-159")}
                        tag="div"
                      >
                        <_Builtin.Image
                          className={_utils.cx(_styles, "image-121")}
                          width="auto"
                          height="auto"
                          loading="lazy"
                          alt="Kommentar Icon"
                          src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/651bd91736364e7718c3a6e4_mode_comment_FILL0_wght400_GRAD0_opsz48.svg"
                        />
                        <_Builtin.Block
                          className={_utils.cx(_styles, "text-block-34")}
                          tag="div"
                        >
                          {"2"}
                        </_Builtin.Block>
                      </_Builtin.Block>
                    </_Builtin.Block>
                    <_Builtin.Link
                      className={_utils.cx(_styles, "button-in-main-color")}
                      button={true}
                      block=""
                      options={{
                        href: "https://climateconnect.earth/post/die-energiewende-wird-demokratisch-potsdam-setzt-auf-burgerenergie",
                        target: "_blank",
                      }}
                    >
                      {"Mehr erfahren"}
                    </_Builtin.Link>
                  </_Builtin.Block>
                </_Builtin.Block>
              </_Builtin.SliderSlide>
              <_Builtin.SliderSlide
                className={_utils.cx(_styles, "slide-12")}
                tag="div"
              >
                <_Builtin.Block
                  className={_utils.cx(_styles, "slide-wrapper")}
                  tag="div"
                >
                  <_Builtin.Block
                    className={_utils.cj(
                      _utils.cx(_styles, "div-project-card-slide"),
                      "w-clearfix"
                    )}
                    tag="div"
                  >
                    <_Builtin.Image
                      className={_utils.cx(_styles, "image-120")}
                      width="auto"
                      height="auto"
                      loading="lazy"
                      alt="Small field for growing organic vegetables "
                      src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/655dfec49b61753f6e057eca_5a44ba3a7bffe920ac33bc7b835a740ce454a69e.jpeg"
                    />
                    <_Builtin.Heading
                      className={_utils.cx(_styles, "heading-118")}
                      tag="h3"
                    >
                      {"Der Stadtacker: Bildungsgärtnerei für Potsdam"}
                    </_Builtin.Heading>
                    <_Builtin.Block
                      className={_utils.cx(_styles, "text-block-33")}
                      tag="div"
                    >
                      {"Durch den ClimateHub möglich gemacht"}
                    </_Builtin.Block>
                    <_Builtin.Paragraph
                      className={_utils.cx(_styles, "paragraph-139")}
                    >
                      {
                        'Das Stadtacker Team arbeitet an der Verwirklichung einer innerstädtischen Gemüsegärtnerei mit Bildungsangeboten für Jung und Alt. Das Projekt wurde von Sina Baumgart auf dem 1. Klima-Mitmach-Tag in Potsdam ins Leben gerufen und bereits beim Förderwettbewerb "Gemeinsam für Potsdam"ausgezeichent.'
                      }
                    </_Builtin.Paragraph>
                    <_Builtin.Block
                      className={_utils.cx(_styles, "div-block-158")}
                      tag="div"
                    >
                      <_Builtin.Block
                        className={_utils.cx(_styles, "div-block-159")}
                        tag="div"
                      >
                        <_Builtin.Image
                          className={_utils.cx(_styles, "image-121")}
                          width="auto"
                          height="auto"
                          loading="lazy"
                          alt="Herz icon"
                          src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/651bd91736364e7718c3a6e0_favorite_FILL1_wght400_GRAD0_opsz48.svg"
                        />
                        <_Builtin.Block
                          className={_utils.cx(_styles, "text-block-34")}
                          tag="div"
                        >
                          {"5"}
                        </_Builtin.Block>
                      </_Builtin.Block>
                      <_Builtin.Block
                        className={_utils.cx(_styles, "div-block-159")}
                        tag="div"
                      >
                        <_Builtin.Image
                          className={_utils.cx(_styles, "image-121")}
                          width="auto"
                          height="auto"
                          loading="lazy"
                          alt="Kommentar Icon"
                          src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/651bd91736364e7718c3a6e4_mode_comment_FILL0_wght400_GRAD0_opsz48.svg"
                        />
                        <_Builtin.Block
                          className={_utils.cx(_styles, "text-block-34")}
                          tag="div"
                        >
                          {"2"}
                        </_Builtin.Block>
                      </_Builtin.Block>
                    </_Builtin.Block>
                    <_Builtin.Link
                      className={_utils.cx(_styles, "button-in-main-color")}
                      button={true}
                      block=""
                      options={{
                        href: "https://climateconnect.earth/de/projects/stadtacker-eine-bildungsgartnerei-der-zukunft-fur-potsdam?hubPage=potsdam",
                      }}
                    >
                      {"Mehr erfahren"}
                    </_Builtin.Link>
                  </_Builtin.Block>
                </_Builtin.Block>
              </_Builtin.SliderSlide>
              <_Builtin.SliderSlide tag="div">
                <_Builtin.Block
                  className={_utils.cx(_styles, "slide-wrapper")}
                  tag="div"
                >
                  <_Builtin.Block
                    className={_utils.cj(
                      _utils.cx(_styles, "div-project-card-slide"),
                      "w-clearfix"
                    )}
                    tag="div"
                  >
                    <_Builtin.Image
                      className={_utils.cx(_styles, "image-120")}
                      width="auto"
                      height="auto"
                      loading="lazy"
                      alt="große Gruppe sitz um einen Tisch"
                      src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/655de9504992345f2708452a__DSC4482%20(Klein).jpg"
                    />
                    <_Builtin.Heading
                      className={_utils.cx(_styles, "heading-118")}
                      tag="h3"
                    >
                      {"Klima-Mitmach-Tag"}
                    </_Builtin.Heading>
                    <_Builtin.Block
                      className={_utils.cx(_styles, "text-block-33")}
                      tag="div"
                    >
                      {"Durch den ClimateHub organisiert"}
                    </_Builtin.Block>
                    <_Builtin.Paragraph
                      className={_utils.cx(_styles, "paragraph-139")}
                    >
                      {
                        "Der erste Klima-Mitmach-Tag in Potsdam war mit knapp 100 Teilnehmenden ein voller Erfolg. Der ClimateHub wurde eröffnet und einige neue Kooperationen und Projekte wurden angestoßen. "
                      }
                    </_Builtin.Paragraph>
                    <_Builtin.Block
                      className={_utils.cx(_styles, "div-block-158")}
                      tag="div"
                    >
                      <_Builtin.Block
                        className={_utils.cx(_styles, "div-block-159")}
                        tag="div"
                      >
                        <_Builtin.Image
                          className={_utils.cx(_styles, "image-121")}
                          width="auto"
                          height="auto"
                          loading="lazy"
                          alt="Herz icon"
                          src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/651bd91736364e7718c3a6e0_favorite_FILL1_wght400_GRAD0_opsz48.svg"
                        />
                        <_Builtin.Block
                          className={_utils.cx(_styles, "text-block-34")}
                          tag="div"
                        >
                          {"5"}
                        </_Builtin.Block>
                      </_Builtin.Block>
                      <_Builtin.Block
                        className={_utils.cx(_styles, "div-block-159")}
                        tag="div"
                      >
                        <_Builtin.Image
                          className={_utils.cx(_styles, "image-121")}
                          width="auto"
                          height="auto"
                          loading="lazy"
                          alt="Kommentar Icon"
                          src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/651bd91736364e7718c3a6e4_mode_comment_FILL0_wght400_GRAD0_opsz48.svg"
                        />
                        <_Builtin.Block
                          className={_utils.cx(_styles, "text-block-34")}
                          tag="div"
                        >
                          {"3"}
                        </_Builtin.Block>
                      </_Builtin.Block>
                    </_Builtin.Block>
                    <_Builtin.Link
                      className={_utils.cx(_styles, "button-in-main-color")}
                      button={true}
                      block=""
                      options={{
                        href: "https://climateconnect.earth/de/projects/klima-mitmach-tag-potsdam",
                      }}
                    >
                      {"Mehr erfahren"}
                    </_Builtin.Link>
                  </_Builtin.Block>
                </_Builtin.Block>
              </_Builtin.SliderSlide>
            </_Builtin.SliderMask>
            <_Builtin.SliderArrow dir="left">
              <_Builtin.Icon
                widget={{
                  type: "icon",
                  icon: "slider-left",
                }}
              />
            </_Builtin.SliderArrow>
            <_Builtin.SliderArrow dir="right">
              <_Builtin.Icon
                widget={{
                  type: "icon",
                  icon: "slider-right",
                }}
              />
            </_Builtin.SliderArrow>
            <_Builtin.SliderNav className={_utils.cx(_styles, "slide-nav-4")} />
          </_Builtin.SliderWrapper>
          <_Builtin.Paragraph className={_utils.cx(_styles, "paragraph-142")}>
            {
              "Der ClimateHub und unser Klimavernetzer Bene haben schon viele neue Projekte und Initiativen möglich gemacht! Bei unseren regelmäßigen Veranstaltungen zu ganz unterschiedlichen Themen kann jede:r mitmachen. Dabei bringen wir ganz aktiv funktionierende Projekte aus anderen Städten auch nach Potsdam."
            }
          </_Builtin.Paragraph>
          <_Builtin.Block
            className={_utils.cx(_styles, "div-block-157", "div-block-176")}
            tag="div"
          >
            <_Builtin.Block
              className={_utils.cj(
                _utils.cx(_styles, "div-project-card"),
                "w-clearfix"
              )}
              tag="div"
            >
              <_Builtin.Image
                className={_utils.cx(_styles, "image-120")}
                loading="lazy"
                width="auto"
                height="auto"
                alt="Stecker-Solaer Gruppenbild"
                src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/651bdeebd308f8ac4a32c201_DSC04561_edited%20(Mittel).jpg"
              />
              <_Builtin.Heading
                className={_utils.cx(_styles, "heading-118")}
                tag="h3"
              >
                {"Stecker-Solaer: die Balkonsolarberatung in Erlangen "}
              </_Builtin.Heading>
              <_Builtin.Block
                className={_utils.cx(_styles, "text-block-33")}
                tag="div"
              >
                {"Durch den ClimateHub möglich gemacht"}
              </_Builtin.Block>
              <_Builtin.Paragraph
                className={_utils.cx(_styles, "paragraph-139")}
              >
                {
                  "Stecker-Solaer ist eine ehrenamtliche Balkonsolarberatung die durch den ClimateHub Erlangen und unseren Klimaverentzer ermöglicht wurde. Mit inzwischen xxx Beratungen und vielen Infoständen konnten unzählige Anlagen möglich gemacht werden."
                }
              </_Builtin.Paragraph>
              <_Builtin.Block
                className={_utils.cx(_styles, "div-block-158")}
                tag="div"
              >
                <_Builtin.Block
                  className={_utils.cx(_styles, "div-block-159")}
                  tag="div"
                >
                  <_Builtin.Image
                    className={_utils.cx(_styles, "image-121")}
                    loading="lazy"
                    width="auto"
                    height="auto"
                    alt="Herz icon"
                    src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/651bd91736364e7718c3a6e0_favorite_FILL1_wght400_GRAD0_opsz48.svg"
                  />
                  <_Builtin.Block
                    className={_utils.cx(_styles, "text-block-34")}
                    tag="div"
                  >
                    {"5"}
                  </_Builtin.Block>
                </_Builtin.Block>
                <_Builtin.Block
                  className={_utils.cx(_styles, "div-block-159")}
                  tag="div"
                >
                  <_Builtin.Image
                    className={_utils.cx(_styles, "image-121")}
                    loading="lazy"
                    width="auto"
                    height="auto"
                    alt="Kommentar Icon"
                    src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/651bd91736364e7718c3a6e4_mode_comment_FILL0_wght400_GRAD0_opsz48.svg"
                  />
                  <_Builtin.Block
                    className={_utils.cx(_styles, "text-block-34")}
                    tag="div"
                  >
                    {"2"}
                  </_Builtin.Block>
                </_Builtin.Block>
              </_Builtin.Block>
              <_Builtin.Link
                className={_utils.cx(_styles, "button-in-main-color")}
                button={true}
                block=""
                options={{
                  href: "#",
                }}
              >
                {"Mehr erfahren"}
              </_Builtin.Link>
            </_Builtin.Block>
            <_Builtin.Block
              className={_utils.cj(
                _utils.cx(_styles, "div-project-card"),
                "w-clearfix"
              )}
              tag="div"
            >
              <_Builtin.Image
                className={_utils.cx(_styles, "image-120")}
                loading="lazy"
                width="auto"
                height="auto"
                alt=""
                src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/651bf9ba4e33d016c1da2c9c_1013944031e70ee06f7743005c3dedcc73268601.jpeg"
              />
              <_Builtin.Heading
                className={_utils.cx(_styles, "heading-118")}
                tag="h3"
              >
                {"Klimafreundliche Großküchen in Erlangen"}
              </_Builtin.Heading>
              <_Builtin.Block
                className={_utils.cx(_styles, "text-block-33")}
                tag="div"
              >
                {"Durch den ClimateHub möglich gemacht"}
              </_Builtin.Block>
              <_Builtin.Paragraph
                className={_utils.cx(_styles, "paragraph-139")}
              >
                {
                  "Stecker-Solaer ist eine ehrenamtliche Balkonsolarberatung die durch den ClimateHub Erlangen und unseren Klimaverentzer ermöglicht wurde. Mit inzwischen xxx Beratungen und vielen Infoständen konnten unzählige Anlagen möglich gemacht werden."
                }
              </_Builtin.Paragraph>
              <_Builtin.Block
                className={_utils.cx(_styles, "div-block-158")}
                tag="div"
              >
                <_Builtin.Block
                  className={_utils.cx(_styles, "div-block-159")}
                  tag="div"
                >
                  <_Builtin.Image
                    className={_utils.cx(_styles, "image-121")}
                    loading="lazy"
                    width="auto"
                    height="auto"
                    alt="Herz icon"
                    src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/651bd91736364e7718c3a6e0_favorite_FILL1_wght400_GRAD0_opsz48.svg"
                  />
                  <_Builtin.Block
                    className={_utils.cx(_styles, "text-block-34")}
                    tag="div"
                  >
                    {"5"}
                  </_Builtin.Block>
                </_Builtin.Block>
                <_Builtin.Block
                  className={_utils.cx(_styles, "div-block-159")}
                  tag="div"
                >
                  <_Builtin.Image
                    className={_utils.cx(_styles, "image-121")}
                    loading="lazy"
                    width="auto"
                    height="auto"
                    alt="Kommentar Icon"
                    src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/651bd91736364e7718c3a6e4_mode_comment_FILL0_wght400_GRAD0_opsz48.svg"
                  />
                  <_Builtin.Block
                    className={_utils.cx(_styles, "text-block-34")}
                    tag="div"
                  >
                    {"2"}
                  </_Builtin.Block>
                </_Builtin.Block>
              </_Builtin.Block>
              <_Builtin.Link
                className={_utils.cx(_styles, "button-in-main-color")}
                button={true}
                block=""
                options={{
                  href: "#",
                }}
              >
                {"Mehr erfahren"}
              </_Builtin.Link>
            </_Builtin.Block>
            <_Builtin.Block
              className={_utils.cj(
                _utils.cx(_styles, "div-project-card"),
                "w-clearfix"
              )}
              tag="div"
            >
              <_Builtin.Image
                className={_utils.cx(_styles, "image-120")}
                loading="lazy"
                width="auto"
                height="auto"
                alt="Stecker-Solaer Gruppenbild"
                src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/651bdeebd308f8ac4a32c201_DSC04561_edited%20(Mittel).jpg"
              />
              <_Builtin.Heading
                className={_utils.cx(_styles, "heading-118")}
                tag="h3"
              >
                {"Stecker-Solaer: die Balkonsolarberatung in Erlangen "}
              </_Builtin.Heading>
              <_Builtin.Block
                className={_utils.cx(_styles, "text-block-33")}
                tag="div"
              >
                {"Durch den ClimateHub möglich gemacht"}
              </_Builtin.Block>
              <_Builtin.Paragraph
                className={_utils.cx(_styles, "paragraph-139")}
              >
                {
                  "Stecker-Solaer ist eine ehrenamtliche Balkonsolarberatung die durch den ClimateHub Erlangen und unseren Klimaverentzer ermöglicht wurde. Mit inzwischen xxx Beratungen und vielen Infoständen konnten unzählige Anlagen möglich gemacht werden."
                }
              </_Builtin.Paragraph>
              <_Builtin.Block
                className={_utils.cx(_styles, "div-block-158")}
                tag="div"
              >
                <_Builtin.Block
                  className={_utils.cx(_styles, "div-block-159")}
                  tag="div"
                >
                  <_Builtin.Image
                    className={_utils.cx(_styles, "image-121")}
                    loading="lazy"
                    width="auto"
                    height="auto"
                    alt="Herz icon"
                    src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/651bd91736364e7718c3a6e0_favorite_FILL1_wght400_GRAD0_opsz48.svg"
                  />
                  <_Builtin.Block
                    className={_utils.cx(_styles, "text-block-34")}
                    tag="div"
                  >
                    {"5"}
                  </_Builtin.Block>
                </_Builtin.Block>
                <_Builtin.Block
                  className={_utils.cx(_styles, "div-block-159")}
                  tag="div"
                >
                  <_Builtin.Image
                    className={_utils.cx(_styles, "image-121")}
                    loading="lazy"
                    width="auto"
                    height="auto"
                    alt="Kommentar Icon"
                    src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/651bd91736364e7718c3a6e4_mode_comment_FILL0_wght400_GRAD0_opsz48.svg"
                  />
                  <_Builtin.Block
                    className={_utils.cx(_styles, "text-block-34")}
                    tag="div"
                  >
                    {"2"}
                  </_Builtin.Block>
                </_Builtin.Block>
              </_Builtin.Block>
              <_Builtin.Link
                className={_utils.cx(_styles, "button-in-main-color")}
                button={true}
                block=""
                options={{
                  href: "#",
                }}
              >
                {"Mehr erfahren"}
              </_Builtin.Link>
            </_Builtin.Block>
            <_Builtin.Block
              className={_utils.cj(
                _utils.cx(_styles, "div-project-card"),
                "w-clearfix"
              )}
              tag="div"
            >
              <_Builtin.Image
                className={_utils.cx(_styles, "image-120")}
                loading="lazy"
                width="auto"
                height="auto"
                alt="Stecker-Solaer Gruppenbild"
                src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/651bdeebd308f8ac4a32c201_DSC04561_edited%20(Mittel).jpg"
              />
              <_Builtin.Heading
                className={_utils.cx(_styles, "heading-118")}
                tag="h3"
              >
                {"Stecker-Solaer: die Balkonsolarberatung in Erlangen "}
              </_Builtin.Heading>
              <_Builtin.Block
                className={_utils.cx(_styles, "text-block-33")}
                tag="div"
              >
                {"Durch den ClimateHub möglich gemacht"}
              </_Builtin.Block>
              <_Builtin.Paragraph
                className={_utils.cx(_styles, "paragraph-139")}
              >
                {
                  "Stecker-Solaer ist eine ehrenamtliche Balkonsolarberatung die durch den ClimateHub Erlangen und unseren Klimaverentzer ermöglicht wurde. Mit inzwischen xxx Beratungen und vielen Infoständen konnten unzählige Anlagen möglich gemacht werden."
                }
              </_Builtin.Paragraph>
              <_Builtin.Block
                className={_utils.cx(_styles, "div-block-158")}
                tag="div"
              >
                <_Builtin.Block
                  className={_utils.cx(_styles, "div-block-159")}
                  tag="div"
                >
                  <_Builtin.Image
                    className={_utils.cx(_styles, "image-121")}
                    loading="lazy"
                    width="auto"
                    height="auto"
                    alt="Herz icon"
                    src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/651bd91736364e7718c3a6e0_favorite_FILL1_wght400_GRAD0_opsz48.svg"
                  />
                  <_Builtin.Block
                    className={_utils.cx(_styles, "text-block-34")}
                    tag="div"
                  >
                    {"5"}
                  </_Builtin.Block>
                </_Builtin.Block>
                <_Builtin.Block
                  className={_utils.cx(_styles, "div-block-159")}
                  tag="div"
                >
                  <_Builtin.Image
                    className={_utils.cx(_styles, "image-121")}
                    loading="lazy"
                    width="auto"
                    height="auto"
                    alt="Kommentar Icon"
                    src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/651bd91736364e7718c3a6e4_mode_comment_FILL0_wght400_GRAD0_opsz48.svg"
                  />
                  <_Builtin.Block
                    className={_utils.cx(_styles, "text-block-34")}
                    tag="div"
                  >
                    {"2"}
                  </_Builtin.Block>
                </_Builtin.Block>
              </_Builtin.Block>
              <_Builtin.Link
                className={_utils.cx(_styles, "button-in-main-color")}
                button={true}
                block=""
                options={{
                  href: "#",
                }}
              >
                {"Mehr erfahren"}
              </_Builtin.Link>
            </_Builtin.Block>
          </_Builtin.Block>
          <_Builtin.Block
            className={_utils.cx(_styles, "div-block-160")}
            tag="div"
          >
            <_Builtin.Heading
              className={_utils.cx(_styles, "heading-119")}
              tag="h1"
            >
              {'"Werde auch du Teil davon!"'}
            </_Builtin.Heading>
            <_Builtin.Link
              className={_utils.cx(_styles, "button-on-main-color-ch")}
              button={true}
              block=""
              options={{
                href: "https://climateconnect.earth/de/hubs/potsdam",
              }}
            >
              {"zum ClimateHub"}
            </_Builtin.Link>
          </_Builtin.Block>
          <_Builtin.Image
            className={_utils.cx(_styles, "image-136")}
            loading="lazy"
            width="auto"
            height="auto"
            alt=""
            src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/65980190f8e42d4058885029_Gruppe%208364.svg"
          />
        </_Builtin.BlockContainer>
      </_Builtin.Section>
      <_Builtin.Section
        className={_utils.cx(_styles, "section-your-ch")}
        grid={{
          type: "section",
        }}
        tag="section"
      >
        <_Builtin.BlockContainer
          className={_utils.cx(_styles, "container-60")}
          grid={{
            type: "container",
          }}
          tag="div"
        >
          <_Builtin.TabsWrapper
            current="Tab 1"
            easing="ease"
            fadeIn={300}
            fadeOut={100}
          >
            <_Builtin.TabsMenu tag="div">
              <_Builtin.TabsLink data-w-tab="Tab 1" block="inline">
                <_Builtin.Block tag="div">{"Tab 1"}</_Builtin.Block>
              </_Builtin.TabsLink>
              <_Builtin.TabsLink data-w-tab="Tab 2" block="inline">
                <_Builtin.Block tag="div">{"Tab 2"}</_Builtin.Block>
              </_Builtin.TabsLink>
              <_Builtin.TabsLink data-w-tab="Tab 3" block="inline">
                <_Builtin.Block tag="div">{"Tab 3"}</_Builtin.Block>
              </_Builtin.TabsLink>
            </_Builtin.TabsMenu>
            <_Builtin.TabsContent tag="div">
              <_Builtin.TabsPane tag="div" data-w-tab="Tab 1" />
              <_Builtin.TabsPane tag="div" data-w-tab="Tab 2" />
              <_Builtin.TabsPane tag="div" data-w-tab="Tab 3" />
            </_Builtin.TabsContent>
          </_Builtin.TabsWrapper>
          <_Builtin.Image
            className={_utils.cx(_styles, "image-135")}
            loading="lazy"
            width="auto"
            height="auto"
            alt=""
            src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/65950e6a9f9d9ac3981b0213_Pfad%2013403.svg"
          />
          <_Builtin.Heading
            className={_utils.cx(_styles, "heading-116-copy")}
            tag="h1"
          >
            {"Dein Klimanetzwerk in Potsdam"}
          </_Builtin.Heading>
          <_Builtin.Block
            className={_utils.cx(_styles, "div-block-186")}
            tag="div"
          >
            <_Builtin.Block
              className={_utils.cx(_styles, "div-block-154-copy-2")}
              tag="div"
            >
              <_Builtin.Paragraph>
                {
                  "Im ClimateHub kommen alle Klimaaktiven in Pot sdam zusammen. Ob Projekte die erst noch starten, alt eingesessene Organisationen oder Events zum einfach mal vorbei schauen. Für jeden ist etwas dabei. Probiere es aus und mach mit!"
                }
              </_Builtin.Paragraph>
            </_Builtin.Block>
          </_Builtin.Block>
          <_Builtin.Block
            className={_utils.cx(_styles, "div-block-186-copy")}
            tag="div"
          >
            <_Builtin.Block
              className={_utils.cx(_styles, "div-block-154-copy-2")}
              tag="div"
            >
              <_Builtin.Paragraph
                className={_utils.cx(_styles, "paragraph-138-copy-2")}
              >
                {
                  "Im ClimateHub kommen alle Klimaaktiven in Erlangen zusammen. Ob Projekte die erst noch starten, alt eingesessene Organisationen oder Events zum einfach mal anschauen. Für jeden ist etwas dabei. Probiere es aus und sei dabei!"
                }
              </_Builtin.Paragraph>
            </_Builtin.Block>
            <_Builtin.TabsWrapper
              className={_utils.cx(_styles, "tabs-2-copy")}
              current="Mitmachen"
              easing="ease-in-out"
              fadeIn={500}
              fadeOut={500}
            >
              <_Builtin.TabsMenu
                className={_utils.cx(_styles, "tabs-menu-4-copy")}
                tag="div"
              >
                <_Builtin.TabsLink
                  className={_utils.cx(_styles, "tab-link-ch")}
                  data-w-id="3c547c6f-979d-2d38-6742-4498998d9956"
                  data-w-tab="Mitmachen"
                  block="inline"
                >
                  <_Builtin.Block
                    className={_utils.cx(_styles, "div-block-184")}
                    tag="div"
                  >
                    <_Builtin.Block
                      className={_utils.cx(_styles, "div-block-dots")}
                      tag="div"
                    />
                    <_Builtin.Block
                      className={_utils.cx(_styles, "div-block-185")}
                      tag="div"
                    >
                      <_Builtin.Block
                        className={_utils.cx(_styles, "text-block-45")}
                        tag="div"
                      >
                        {"Mitmachen"}
                      </_Builtin.Block>
                      <_Builtin.Block
                        className={_utils.cx(_styles, "text-block-46-copy")}
                        tag="div"
                      >
                        {"Bring dich ein und vergrößere deinen Handabdruck"}
                      </_Builtin.Block>
                    </_Builtin.Block>
                  </_Builtin.Block>
                  <_Builtin.Block
                    className={_utils.cx(_styles, "div-block-188")}
                    tag="div"
                  />
                </_Builtin.TabsLink>
                <_Builtin.TabsLink
                  className={_utils.cx(_styles, "tab-link-ch")}
                  data-w-id="3c547c6f-979d-2d38-6742-4498998d995f"
                  data-w-tab="Teilen"
                  block="inline"
                >
                  <_Builtin.Block
                    className={_utils.cx(_styles, "div-block-184")}
                    tag="div"
                  >
                    <_Builtin.Block
                      className={_utils.cx(_styles, "div-block-dots")}
                      tag="div"
                    />
                    <_Builtin.Block
                      className={_utils.cx(_styles, "div-block-185")}
                      tag="div"
                    >
                      <_Builtin.Block
                        className={_utils.cx(_styles, "text-block-45")}
                        tag="div"
                      >
                        {"Teilen"}
                      </_Builtin.Block>
                      <_Builtin.Block
                        className={_utils.cx(_styles, "text-block-46-copy")}
                        tag="div"
                      >
                        {
                          "Zeig anderen woran du arbeitest und finde Mitstreiter"
                        }
                      </_Builtin.Block>
                    </_Builtin.Block>
                  </_Builtin.Block>
                  <_Builtin.Block
                    className={_utils.cx(_styles, "div-block-188")}
                    tag="div"
                  />
                </_Builtin.TabsLink>
                <_Builtin.TabsLink
                  className={_utils.cx(_styles, "tab-link-ch")}
                  data-w-id="3c547c6f-979d-2d38-6742-4498998d9968"
                  data-w-tab="Treffen"
                  block="inline"
                >
                  <_Builtin.Block
                    className={_utils.cx(_styles, "div-block-184")}
                    tag="div"
                  >
                    <_Builtin.Block
                      className={_utils.cx(_styles, "div-block-dots")}
                      tag="div"
                    />
                    <_Builtin.Block
                      className={_utils.cx(_styles, "div-block-185")}
                      tag="div"
                    >
                      <_Builtin.Block
                        className={_utils.cx(_styles, "text-block-45")}
                        tag="div"
                      >
                        {"Treffen"}
                      </_Builtin.Block>
                      <_Builtin.Block
                        className={_utils.cx(_styles, "text-block-46-copy")}
                        tag="div"
                      >
                        {"Finde lokale Events mit Impact und mehr...."}
                      </_Builtin.Block>
                    </_Builtin.Block>
                  </_Builtin.Block>
                </_Builtin.TabsLink>
              </_Builtin.TabsMenu>
              <_Builtin.TabsContent
                className={_utils.cx(_styles, "tabs-content-3-copy")}
                tag="div"
              >
                <_Builtin.TabsPane tag="div" data-w-tab="Mitmachen">
                  <_Builtin.Image
                    className={_utils.cx(_styles, "image-132")}
                    width="auto"
                    height="auto"
                    loading="eager"
                    alt="Junge Frau sprich mit zweiter Person welche man von hinten sieht"
                    src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/659581382dac22c7dfe509b5_nmb-Klimakonferenz-2022-1017.jpg"
                  />
                </_Builtin.TabsPane>
                <_Builtin.TabsPane tag="div" data-w-tab="Teilen">
                  <_Builtin.Image
                    className={_utils.cx(_styles, "image-132")}
                    width="auto"
                    height="auto"
                    loading="lazy"
                    alt="Person tippt auf PC und hat den ClimateHub geöffnet"
                    src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/655de928163d061812bcd062_nmb-ClimateConnect230707-0003%20(Klein).jpg"
                  />
                </_Builtin.TabsPane>
                <_Builtin.TabsPane tag="div" data-w-tab="Treffen">
                  <_Builtin.Image
                    className={_utils.cx(_styles, "image-132")}
                    width="auto"
                    height="auto"
                    loading="eager"
                    alt="große Gruppe sitz um einen Tisch"
                    src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/655de9504992345f2708452a__DSC4482%20(Klein).jpg"
                  />
                </_Builtin.TabsPane>
              </_Builtin.TabsContent>
            </_Builtin.TabsWrapper>
          </_Builtin.Block>
          <_Builtin.Image
            className={_utils.cx(_styles, "line-3")}
            loading="lazy"
            width="auto"
            height="auto"
            alt=""
            src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/6597fb8985e69fb7ae100543_Gruppe%208363.svg"
          />
        </_Builtin.BlockContainer>
      </_Builtin.Section>
      <_Builtin.Block
        className={_utils.cx(_styles, "div-block-221")}
        tag="div"
      />
    </_Component>
  );
}
