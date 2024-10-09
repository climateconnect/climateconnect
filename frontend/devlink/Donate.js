"use client";
import React from "react";
import * as _Builtin from "./_Builtin";
import * as _interactions from "./interactions";
import { PreFooter } from "./PreFooter";
import { PreFooterBelvNTgthr } from "./PreFooterBelvNTgthr";
import * as _utils from "./utils";
import _styles from "./Donate.module.css";

const _interactionsData = JSON.parse(
  '{"events":{"e-482":{"id":"e-482","name":"","animationType":"preset","eventTypeId":"PAGE_FINISH","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-75","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-481"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"wf-page-id","appliesTo":"PAGE","styleBlockIds":[]},"targets":[{"id":"wf-page-id","appliesTo":"PAGE","styleBlockIds":[]}],"config":{"loop":true,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1714489406373}},"actionLists":{"a-75":{"id":"a-75","title":"More about us bounce 6","actionItemGroups":[{"actionItems":[{"id":"a-75-n","actionTypeId":"TRANSFORM_MOVE","config":{"delay":0,"easing":"","duration":500,"target":{"id":"77342a2e-585f-c379-8cb2-57df99260569"},"yValue":0,"xUnit":"PX","yUnit":"px","zUnit":"PX"}}]},{"actionItems":[{"id":"a-75-n-2","actionTypeId":"TRANSFORM_MOVE","config":{"delay":0,"easing":"bounce","duration":500,"target":{"id":"77342a2e-585f-c379-8cb2-57df99260569"},"yValue":8,"xUnit":"PX","yUnit":"px","zUnit":"PX"}}]},{"actionItems":[{"id":"a-75-n-3","actionTypeId":"TRANSFORM_MOVE","config":{"delay":0,"easing":"","duration":500,"target":{"id":"77342a2e-585f-c379-8cb2-57df99260569"},"yValue":0,"xUnit":"PX","yUnit":"px","zUnit":"PX"}}]}],"useFirstGroupAsInitialState":true,"createdOn":1670414976897}},"site":{"mediaQueries":[{"key":"main","min":992,"max":10000},{"key":"medium","min":768,"max":991},{"key":"small","min":480,"max":767},{"key":"tiny","min":0,"max":479}]}}'
);

export function Donate({ as: _Component = _Builtin.Block }) {
  _interactions.useInteractions(_interactionsData, _styles);

  return (
    <_Component tag="div">
      <_Builtin.Section
        className={_utils.cx(_styles, "landing-screen-donate")}
        grid={{
          type: "section",
        }}
        tag="div"
      >
        <_Builtin.Container
          className={_utils.cx(_styles, "container-50")}
          tag="div"
        >
          <_Builtin.Image
            className={_utils.cx(_styles, "image-81")}
            loading="lazy"
            width="316"
            height="auto"
            alt="Chris steht am Climate Connect infostand"
            src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/655780cb021512c5dd02a62c_DSC09085%20(Mittel).JPG"
          />
          <_Builtin.Image
            className={_utils.cx(_styles, "image-82")}
            loading="lazy"
            width="399"
            height="auto"
            alt="Climate Connect Team steht an Infostand"
            src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/655de70183fc7da42342309c__DSC3970%20(Klein).jpg"
          />
          <_Builtin.Block
            className={_utils.cx(_styles, "div-block-111")}
            tag="div"
          >
            <_Builtin.Heading
              className={_utils.cx(_styles, "heading-101")}
              tag="h1"
            >
              {"Spende für ClimateHubs in ganz Deutschland!"}
            </_Builtin.Heading>
            <_Builtin.Paragraph className={_utils.cx(_styles, "paragraph-124")}>
              {
                "Wir bei Climate Connect glauben daran, dass jeder die Möglichkeit haben sollte, sich kostenlos in der Klimabewegung zu vernetzen und aktiv zu werden. Deine Spende hilft uns dabei, unabhängig zu bleiben, unsere Arbeit fortzusetzen und weitere ClimateHubs aufzubauen. Unser engagiertes Team arbeitet täglich daran, die Wirkung von Klimaakteuren in Deutschland und weltweit zu vervielfachen."
              }
            </_Builtin.Paragraph>
            <_Builtin.Block
              className={_utils.cx(_styles, "dono-page-button-wrapper")}
              tag="div"
            >
              <_Builtin.Block
                className={_utils.cj(
                  _utils.cx(_styles, "div-block-112"),
                  "w-clearfix"
                )}
                tag="div"
              >
                <_Builtin.Block
                  className={_utils.cx(_styles, "text-block-16")}
                  tag="div"
                >
                  {"Climate Connect gUG unterstützen:"}
                </_Builtin.Block>
                <_Builtin.Link
                  className={_utils.cx(
                    _styles,
                    "button-in-main-color",
                    "dono-page"
                  )}
                  button={true}
                  block=""
                  options={{
                    href: "#Donation-setction",
                  }}
                >
                  {"Jetzt Spenden"}
                </_Builtin.Link>
              </_Builtin.Block>
              <_Builtin.Block tag="div">
                <_Builtin.Block
                  className={_utils.cx(_styles, "text-block-18")}
                  tag="div"
                >
                  {"Sicher Spenden mit:"}
                </_Builtin.Block>
                <_Builtin.Image
                  loading="lazy"
                  width="160"
                  height="auto"
                  alt="Zahlungs möglichkeiten als Icons: Pay pal Überweisung, Kreditkarte, Lastschrift"
                  src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/638915eca67cdfb58a258508_Gruppe%208284.svg"
                />
              </_Builtin.Block>
            </_Builtin.Block>
          </_Builtin.Block>
          <_Builtin.Image
            className={_utils.cx(_styles, "image-83")}
            loading="lazy"
            width="200"
            height="auto"
            alt="Projekt Karte von der Climate Connect plattform: Klimakalender 2023"
            src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/638a753c8a6a0bb7dfa8678b_Gruppe%208312.png"
          />
          <_Builtin.Image
            className={_utils.cx(_styles, "image-84")}
            loading="lazy"
            width="341"
            height="auto"
            alt="Mann zeigt auf Karten die an einer Pinnwand hängen"
            src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/644bbeadad2e7a5201012830__DSC4692.jpg"
          />
        </_Builtin.Container>
        <_Builtin.Link
          className={_utils.cx(_styles, "div-block-113")}
          data-w-id="77342a2e-585f-c379-8cb2-57df99260569"
          button={false}
          block="inline"
          options={{
            href: "#A-word-from-the-team",
          }}
        >
          <_Builtin.Block
            className={_utils.cx(_styles, "div-block-118")}
            tag="div"
          >
            <_Builtin.Block
              className={_utils.cx(_styles, "text-block-19")}
              tag="div"
            >
              {"Mehr über uns"}
            </_Builtin.Block>
            <_Builtin.Image
              loading="lazy"
              width="29"
              height="auto"
              alt="arrow donw"
              src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/6166b718196ee9648f418a7a_Icon%20ionic-ios-arrow-down.svg"
            />
          </_Builtin.Block>
        </_Builtin.Link>
      </_Builtin.Section>
      <_Builtin.Section
        className={_utils.cx(_styles, "quotes-donate")}
        grid={{
          type: "section",
        }}
        tag="div"
      >
        <_Builtin.Container
          className={_utils.cx(_styles, "container-51")}
          tag="div"
        >
          <_Builtin.Heading
            className={_utils.cx(_styles, "heading-100")}
            tag="h2"
            id="A-word-from-the-team"
          >
            {"Unterstützer:innen über Climate Connect"}
          </_Builtin.Heading>
        </_Builtin.Container>
      </_Builtin.Section>
      <_Builtin.Section
        className={_utils.cx(_styles, "quotes-donate-2")}
        grid={{
          type: "section",
        }}
        tag="div"
      >
        <_Builtin.Image
          className={_utils.cx(_styles, "image-79")}
          loading="lazy"
          width="auto"
          height="auto"
          alt=""
          src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/638db96c0d5f31c3b0ca3c57_Icon%20material-format-quote.svg"
        />
        <_Builtin.Block
          className={_utils.cx(_styles, "quoteswrapper")}
          tag="div"
        >
          <_Builtin.NotSupported _atom="DynamoWrapper" />
        </_Builtin.Block>
      </_Builtin.Section>
      <_Builtin.Section
        className={_utils.cx(_styles, "cc-values-donate")}
        grid={{
          type: "section",
        }}
        tag="div"
      >
        <_Builtin.Container
          className={_utils.cx(_styles, "container-49")}
          tag="div"
        >
          <_Builtin.Image
            className={_utils.cx(_styles, "image-85")}
            loading="lazy"
            width="351"
            height="auto"
            alt="Climate Connect Team auf der Erlanger Klimakonferenz 2022"
            src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/65578253868be38bf3dde562_nmb-Klimakonferenz-2022-1106-min%20(1)%20(Mittel).jpg"
          />
          <_Builtin.Image
            className={_utils.cx(_styles, "image-88")}
            loading="lazy"
            width="205"
            height="auto"
            alt='Projekt Karte "Klimaaufbruch Büchenbach"'
            src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/638dbe65ce20b72c98d92335_Gruppe%208313.png"
          />
          <_Builtin.Image
            className={_utils.cx(_styles, "image-87")}
            loading="lazy"
            width="386"
            height="auto"
            alt="Klimavernetzer Bene unterhält sich mit anderen Klimaaktiven"
            src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/644bbe288f7a2c76b61209b3__DSC4540.jpg"
          />
          <_Builtin.Image
            className={_utils.cx(_styles, "image-86")}
            loading="lazy"
            width="353"
            height="auto"
            alt=""
            src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/655782a6b8d7cf5a47fb5a81_nmb-Klimakonferenz-2022-0823-min%20(Mittel).jpg"
          />
          <_Builtin.Block
            className={_utils.cx(_styles, "div-block-106")}
            tag="div"
          >
            <_Builtin.Heading
              className={_utils.cx(_styles, "heading-99")}
              tag="h1"
            >
              {"Was macht Climate Connect aus?"}
            </_Builtin.Heading>
            <_Builtin.Paragraph className={_utils.cx(_styles, "paragraph-122")}>
              {
                "Wir glauben, dass jeder die Möglichkeit haben sollte, sich im Kampf gegen den Klimawandel zu engagieren. Deshalb stellen wir eine kostenlose Online-Plattform zur Verfügung, die Einzelpersonen und Organisationen, die an klimarelevanten Themen arbeiten, miteinander verbindet. Durch deine Spende ermöglichst du, mehr Menschen zusammenzubringen und deren Zusammenarbeit zu fördern. Gemeinsam können wir den Übergang zu einer nachhaltigen Zukunft beschleunigen."
              }
            </_Builtin.Paragraph>
            <_Builtin.Grid className={_utils.cx(_styles, "grid-9")} tag="div">
              <_Builtin.Block
                className={_utils.cx(_styles, "vaule-icon-text")}
                id={_utils.cx(
                  _styles,
                  "w-node-_77342a2e-585f-c379-8cb2-57df9926058d-99260553"
                )}
                tag="div"
              >
                <_Builtin.Image
                  className={_utils.cx(_styles, "icon-values")}
                  id={_utils.cx(
                    _styles,
                    "w-node-_77342a2e-585f-c379-8cb2-57df9926058e-99260553"
                  )}
                  loading="lazy"
                  width="90"
                  height="auto"
                  alt="icon gemeinnützig"
                  src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/638a51040e85a37056f12a09_Gruppe%206840.svg"
                />
                <_Builtin.Block
                  className={_utils.cx(_styles, "text-block-14")}
                  id={_utils.cx(
                    _styles,
                    "w-node-_77342a2e-585f-c379-8cb2-57df9926058f-99260553"
                  )}
                  tag="div"
                >
                  {"Kostenlos & Gemeinnützig"}
                </_Builtin.Block>
              </_Builtin.Block>
              <_Builtin.Block
                className={_utils.cx(_styles, "vaule-icon-text")}
                id={_utils.cx(
                  _styles,
                  "w-node-_77342a2e-585f-c379-8cb2-57df99260591-99260553"
                )}
                tag="div"
              >
                <_Builtin.Image
                  className={_utils.cx(_styles, "icon-values")}
                  id={_utils.cx(
                    _styles,
                    "w-node-_77342a2e-585f-c379-8cb2-57df99260592-99260553"
                  )}
                  loading="lazy"
                  width="90"
                  height="auto"
                  alt=""
                  src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/6405e99ed2eb320b3a6f2413_group_work_FILL0_wght400_GRAD0_opsz48.svg"
                />
                <_Builtin.Block
                  className={_utils.cx(_styles, "text-block-14")}
                  id={_utils.cx(
                    _styles,
                    "w-node-_77342a2e-585f-c379-8cb2-57df99260593-99260553"
                  )}
                  tag="div"
                >
                  {"Community getrieben"}
                </_Builtin.Block>
              </_Builtin.Block>
              <_Builtin.Block
                className={_utils.cx(_styles, "vaule-icon-text")}
                id={_utils.cx(
                  _styles,
                  "w-node-_77342a2e-585f-c379-8cb2-57df99260595-99260553"
                )}
                tag="div"
              >
                <_Builtin.Image
                  className={_utils.cx(_styles, "icon-values")}
                  id={_utils.cx(
                    _styles,
                    "w-node-_77342a2e-585f-c379-8cb2-57df99260596-99260553"
                  )}
                  loading="lazy"
                  width="90"
                  height="auto"
                  alt=""
                  src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/6405e99ee818a647a13e3be5_link_off_FILL1_wght400_GRAD0_opsz48.svg"
                />
                <_Builtin.Block
                  className={_utils.cx(_styles, "text-block-14")}
                  id={_utils.cx(
                    _styles,
                    "w-node-_77342a2e-585f-c379-8cb2-57df99260597-99260553"
                  )}
                  tag="div"
                >
                  {"Unabhängig"}
                </_Builtin.Block>
              </_Builtin.Block>
              <_Builtin.Block
                className={_utils.cx(_styles, "vaule-icon-text")}
                id={_utils.cx(
                  _styles,
                  "w-node-_77342a2e-585f-c379-8cb2-57df99260599-99260553"
                )}
                tag="div"
              >
                <_Builtin.Image
                  className={_utils.cx(_styles, "icon-values")}
                  id={_utils.cx(
                    _styles,
                    "w-node-_77342a2e-585f-c379-8cb2-57df9926059a-99260553"
                  )}
                  loading="lazy"
                  width="90"
                  height="90"
                  alt=""
                  src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/6405e99eebd1ed797470f0c8_lock_open_FILL0_wght400_GRAD0_opsz48.svg"
                />
                <_Builtin.Block
                  className={_utils.cx(_styles, "text-block-14")}
                  id={_utils.cx(
                    _styles,
                    "w-node-_77342a2e-585f-c379-8cb2-57df9926059b-99260553"
                  )}
                  tag="div"
                >
                  {"Open Source"}
                </_Builtin.Block>
              </_Builtin.Block>
            </_Builtin.Grid>
          </_Builtin.Block>
        </_Builtin.Container>
      </_Builtin.Section>
      <_Builtin.Section
        className={_utils.cx(_styles, "divider")}
        grid={{
          type: "section",
        }}
        tag="div"
      >
        <_Builtin.Container
          className={_utils.cx(_styles, "container-52")}
          tag="div"
        >
          <_Builtin.Block
            className={_utils.cx(_styles, "div-block-105")}
            tag="div"
          >
            <_Builtin.Heading
              className={_utils.cx(_styles, "heading-98")}
              tag="h2"
            >
              {"Wissen, was deine Spende bewirkt"}
            </_Builtin.Heading>
            <_Builtin.Paragraph className={_utils.cx(_styles, "paragraph-121")}>
              {
                "Wir sind Teil der Initiative Transparente Zivilgesellschaft. Das bedeutet, dass wir uns verpflichtet haben, jedes Jahr 10 Informationen über Climate Connect zu veröffentlichen. Darunter auch jährliche Tätigkeitsberichte, welche wir auf unserem Blog veröffentlichen."
              }
            </_Builtin.Paragraph>
            <_Builtin.Link
              className={_utils.cx(_styles, "div-block-104")}
              button={false}
              block="inline"
              options={{
                href: "https://climateconnect.earth/transparency",
                target: "_blank",
              }}
            >
              <_Builtin.Image
                className={_utils.cx(_styles, "image-77")}
                loading="lazy"
                height="auto"
                width="543"
                alt="logo "
                src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/638a4f2333c0ff17c85a4f53_62601cf016218d117a4b9c11_Transparente_ZivilgesellschaftGIF.svg"
              />
            </_Builtin.Link>
          </_Builtin.Block>
        </_Builtin.Container>
      </_Builtin.Section>
      <_Builtin.Section
        grid={{
          type: "section",
        }}
        tag="div"
      >
        <_Builtin.Container
          className={_utils.cx(_styles, "container-48")}
          tag="div"
        >
          <_Builtin.Heading
            className={_utils.cx(_styles, "heading-97")}
            tag="h3"
          >
            {"Mit deiner Spenden unterstützt du"}
          </_Builtin.Heading>
          <_Builtin.Block
            className={_utils.cx(_styles, "bullet-points-wrapper")}
            tag="div"
          >
            <_Builtin.Block
              className={_utils.cx(_styles, "bullet-points-ch")}
              tag="div"
            >
              <_Builtin.Image
                className={_utils.cx(_styles, "image-94")}
                loading="lazy"
                width="auto"
                height="auto"
                alt="Gruppen Icon auf Schild"
                src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/6167f3a8d0d5a614271e2857_Gruppe%206699.svg"
              />
              <_Builtin.Heading
                className={_utils.cx(_styles, "heading-bulletpoint")}
                tag="h3"
              >
                {
                  "eine diverse und wachsende Gemeinschaft, die sich für den Klimaschutz einsetzen."
                }
              </_Builtin.Heading>
            </_Builtin.Block>
            <_Builtin.Block
              className={_utils.cx(_styles, "bullet-points-ch")}
              tag="div"
            >
              <_Builtin.Image
                loading="lazy"
                width="auto"
                height="auto"
                alt="Erfolgs Icon auf Schild"
                src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/6229bf81f06f148a758a6032_Celebrate%20icon.svg"
              />
              <_Builtin.Heading
                className={_utils.cx(_styles, "heading-bulletpoint")}
                tag="h3"
              >
                {
                  "Klimaprojekte dabei, neue Partner zu finden und eine größere Wirkung zu erzielen."
                }
              </_Builtin.Heading>
            </_Builtin.Block>
            <_Builtin.Block
              className={_utils.cx(_styles, "bullet-points-ch")}
              tag="div"
            >
              <_Builtin.Image
                loading="lazy"
                width="auto"
                height="auto"
                alt=""
                src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/6246c6b38e811a527b2d5a34_Gruppe%206700.svg"
              />
              <_Builtin.Heading
                className={_utils.cx(_styles, "heading-bulletpoint")}
                tag="h3"
              >
                {
                  "die Umsetzung neuer Klimaschutz-Ideen und bringst mehr Menschen ins Engagement."
                }
              </_Builtin.Heading>
            </_Builtin.Block>
          </_Builtin.Block>
        </_Builtin.Container>
      </_Builtin.Section>
      <_Builtin.Section
        className={_utils.cx(_styles, "donation-widget")}
        grid={{
          type: "section",
        }}
        tag="div"
        id="Donation-setction"
      >
        <_Builtin.Container
          className={_utils.cx(_styles, "container-41")}
          tag="div"
        >
          <_Builtin.Block
            className={_utils.cx(_styles, "div-block-122")}
            tag="div"
          >
            <_Builtin.Heading
              className={_utils.cx(_styles, "heading-97")}
              tag="h3"
            >
              {"Hier gleich Spenden*"}
            </_Builtin.Heading>
            <_Builtin.Block
              className={_utils.cx(_styles, "text-block-21")}
              tag="div"
            >
              {"*oder noch näher dran sein und "}
              <_Builtin.Link
                button={false}
                block=""
                options={{
                  href: "#Mitgliedschaft",
                }}
              >
                {"Mitglied im Climate Connect Deutschland e.V. werden⬇️"}
              </_Builtin.Link>
            </_Builtin.Block>
            <_Builtin.HtmlEmbed
              className={_utils.cx(_styles, "html-embed-6")}
              value="%3C!--%20twingle%20--%3E%0A%3Ciframe%20src%3D%22https%3A%2F%2Fspenden.twingle.de%2Fclimate-connect-gug-haftungsbeschrankt%2Fclimate-connect%2Ftw5ee1f393e9a58%2Fwidget%22%20style%3D%22width%3A%20100%25%3B%20border%3A%20none%3B%20overflow%3A%20hidden%3B%20height%3A%20650px%3B%20position%3A%20relative%3B%20z-index%3A%202%3B%22%3E%3C%2Fiframe%3E%0A%3Cscript%20src%3D%22https%3A%2F%2Fspenden.twingle.de%2Fembed%2Fgeneric%22%3E%3C%2Fscript%3E%0A%3C!--%20twingle%20--%3E"
            />
          </_Builtin.Block>
        </_Builtin.Container>
      </_Builtin.Section>
      <_Builtin.Container
        className={_utils.cx(_styles, "container-41")}
        tag="div"
      >
        <_Builtin.Block
          className={_utils.cx(_styles, "icon-text-wrapper")}
          tag="div"
        >
          <_Builtin.Image
            className={_utils.cx(_styles, "image-76")}
            loading="lazy"
            width="60"
            height="auto"
            alt=""
            src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/616fe72654c3e4441b4e0e25_Komponente%20117.svg"
          />
          <_Builtin.Block
            className={_utils.cx(_styles, "text-donate-wraper")}
            tag="div"
          >
            <_Builtin.Heading
              className={_utils.cx(_styles, "heading-90")}
              tag="h2"
              id="Mitgliedschaft"
            >
              {"Mitglied werden!"}
            </_Builtin.Heading>
            <_Builtin.Paragraph>
              {
                "Du willst unsere Arbeit in Deutschland längerfristig unterstützen und mehr involviert sein? Dann werde doch Mitglied im Climate Connect Deutschland e.V. Du kannst den Antrag auf Mitgliedschaft schriftlich stellen oder unser Online Formular nutzen. Willst du mit deiner Organisation Mitglied werden?Schreib unserm Vereinsvorstand Tobias eine "
              }
              <_Builtin.Link
                button={false}
                block=""
                options={{
                  href: "#",
                }}
              >
                {"Email"}
              </_Builtin.Link>
              {" oder füll gleich den "}
              <_Builtin.Link
                button={false}
                block=""
                options={{
                  href: "#",
                  target: "_blank",
                }}
              >
                {"Antrag "}
              </_Builtin.Link>
              {"aus."}
            </_Builtin.Paragraph>
            <_Builtin.Block
              className={_utils.cj(
                _utils.cx(_styles, "div-block-99"),
                "w-clearfix"
              )}
              tag="div"
            >
              <_Builtin.Link
                className={_utils.cx(_styles, "button-in-main-color")}
                button={true}
                block=""
                options={{
                  href: "#",
                  target: "_blank",
                }}
              >
                {"Zum Online Formular"}
              </_Builtin.Link>
              <_Builtin.Link
                className={_utils.cx(_styles, "button-in-main-color")}
                button={true}
                block=""
                options={{
                  href: "#",
                  target: "_blank",
                }}
              >
                {"Antrag Privat"}
              </_Builtin.Link>
            </_Builtin.Block>
            <_Builtin.Heading tag="h3">
              {"Der Verein unterstützt finanziell und strukturell"}
            </_Builtin.Heading>
            <_Builtin.Paragraph>
              <_Builtin.Link
                button={false}
                block=""
                options={{
                  href: "#",
                  target: "_blank",
                }}
              >
                {"Climate Connect Deutschland e.V."}
              </_Builtin.Link>
              {
                " ist ebenfalls gemeinnützig und unterstützt und fördert unsere Online Plattform "
              }
              <_Builtin.Link
                button={false}
                target="_blank"
                block=""
                options={{
                  href: "https://climateconnect.earth/de/",
                }}
              >
                {"climateconnect.earth "}
              </_Builtin.Link>
              {
                "in Deutschland. Das geschieht zum einen finanziell durch Fördermitgliedschaften aber strukturell. Für alle ClimateHubs bieten wir eine Struktur für Ortsgruppen und um neue Projekte schneller möglich zu machen. "
              }
            </_Builtin.Paragraph>
          </_Builtin.Block>
        </_Builtin.Block>
        <_Builtin.Block
          className={_utils.cx(_styles, "icon-text-wrapper")}
          tag="div"
        >
          <_Builtin.Image
            className={_utils.cx(_styles, "image-76")}
            loading="lazy"
            width="60"
            height="auto"
            alt=""
            src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/6246f0f4c39a0b7c437653a4_Komponente%20121.svg"
          />
          <_Builtin.Block
            className={_utils.cx(_styles, "text-donate-wraper")}
            tag="div"
          >
            <_Builtin.Heading
              className={_utils.cx(_styles, "heading-90")}
              tag="h3"
            >
              {"Direkte Spende"}
            </_Builtin.Heading>
            <_Builtin.Paragraph className={_utils.cx(_styles, "paragraph-125")}>
              {
                "Wir bevorzugen zwar die Verwendung des Spendenformulars, um die Verwaltung und Buchhaltung zu erleichtern, aber du kannst auch direkt an uns spenden."
              }
              <br />
              {"‍"}
              <br />
              {"Überweisung"}
              <br />
              {"‍"}
              {"IBAN: DE02 43060967 1072519500 "}
              <br />
              {"BIC:GENODEM1GLS - GLS Gemeinschaftsbank"}
              <br />
              {"‍"}
              <br />
              {"Paypal:"}
              <_Builtin.Link
                button={false}
                block=""
                options={{
                  href: "#",
                }}
              >
                {"https://paypal.me/climateconnect"}
              </_Builtin.Link>
            </_Builtin.Paragraph>
          </_Builtin.Block>
        </_Builtin.Block>
        <_Builtin.Block
          className={_utils.cx(_styles, "icon-text-wrapper", "crypto")}
          tag="div"
        >
          <_Builtin.Image
            className={_utils.cx(_styles, "image-76")}
            loading="lazy"
            width="60"
            height="auto"
            alt=""
            src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/638a19f7a9fc070db01a763e_Floating%20Sign%20Heart.svg"
          />
          <_Builtin.Block
            className={_utils.cx(_styles, "text-donate-wraper")}
            tag="div"
          >
            <_Builtin.Heading
              className={_utils.cx(_styles, "heading-90")}
              tag="h2"
            >
              {"Mit Kryptowährung spenden"}
            </_Builtin.Heading>
            <_Builtin.Paragraph className={_utils.cx(_styles, "paragraph-126")}>
              {
                "Obwohl wir andere Zahlungsmethoden bevorzugen, gibt es jetzt auch die Möglichkeit, mit Kryptowährungen zu spenden. Wenn du mit Kryptowährungen spendest, erhältst du keine Spendenbescheinigung. Unsere Bitcoin-Adresse: 1BTKuBx78uSGBkNcS8pCkvLKwXTH1NyJ23"
              }
            </_Builtin.Paragraph>
          </_Builtin.Block>
        </_Builtin.Block>
        <_Builtin.Block
          className={_utils.cx(_styles, "icon-text-wrapper")}
          tag="div"
        >
          <_Builtin.Image
            className={_utils.cx(_styles, "image-76")}
            loading="lazy"
            width="60"
            height="auto"
            alt=""
            src="https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/6246f1cac89b29b4b44c25d4_Komponente%20125.svg"
          />
          <_Builtin.Block
            className={_utils.cj(
              _utils.cx(_styles, "text-donate-wraper"),
              "w-clearfix"
            )}
            tag="div"
          >
            <_Builtin.Heading
              className={_utils.cx(_styles, "heading-90")}
              tag="h3"
            >
              {"Spendenbescheinigung"}
            </_Builtin.Heading>
            <_Builtin.Paragraph>
              {
                "Wir sind eine in Deutschland offiziell eingetragene gemeinnützige Gesellschaft (Climate Connect gUG (haftungsbeschränkt). Das bedeutet, dass wir steuerlich absetzbare Spendenbescheinigungen ausstellen können. Für deutsche Bürger mit kumulierten Spenden von weniger als 300€ pro Jahr ist ein vereinfachter Zuwendungsnachweis ausreichend. Hier findest Du ein Dokument, das einen vereinfachten Zuwendungsnachweis und die Bestätigung unseres Gemeinnützigkeitsstatus erklärt "
              }
              <_Builtin.Link
                button={false}
                target="_blank"
                block=""
                options={{
                  href: "https://climateconnect.earth/documents/nonprofit_status_confirmation.pdf",
                }}
              >
                {"hier"}
              </_Builtin.Link>
              {"."}
              <br />
              {
                "Für Spender, die mehr als 300€ pro Jahr spenden, stellen wir eine Spendenbescheinigung aus. "
              }
              <_Builtin.Link
                button={false}
                block=""
                options={{
                  href: "mailto:contact@climateconnect.earth",
                }}
              >
                {"Kontaktiere uns"}
              </_Builtin.Link>
              {", wenn du weitere Unterlagen benötigst."}
            </_Builtin.Paragraph>
            <_Builtin.Link
              className={_utils.cx(_styles, "button-in-main-color")}
              button={true}
              block=""
              options={{
                href: "https://cdn.prod.website-files.com/615d9a37fbb2467a53e09161/638a1b5707a76fc52e720a9a_nonprofit_status_confirmation%20(1).pdf",
                target: "_blank",
              }}
            >
              {"Download"}
            </_Builtin.Link>
          </_Builtin.Block>
        </_Builtin.Block>
      </_Builtin.Container>
      <PreFooter />
      <PreFooterBelvNTgthr />
    </_Component>
  );
}
