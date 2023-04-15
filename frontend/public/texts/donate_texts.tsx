import { Link } from "@mui/material";
import React from "react";

export default function getDonateTexts({ classes, goal }) {
  return {
    donate_infinitive: {
      en: "Donate",
      de: "Spenden",
    },
    your_donation_counts: {
      en: "Your Donation Counts",
      de: "Deine Spende zählt",
    },
    support_growing_a_global_network_of_climate_actors: {
      en: "Support growing a global network of climate actors.",
      de: "Unterstütze den Aufbau eines globalen Netzwerks von Klimaakteuren!",
    },
    a_new_way_to_fight_climate_change_donate_today: {
      en: "A new way to fight climate change. Donate today.",
      de: "Ein neuer Weg, den Klimawandel zu bekämpfen. Spende noch heute.",
    },
    why_donate: {
      en: "Why donate?",
      de: "Warum Spenden sinnvoll ist?",
    },
    why_donate_text: {
      en: `Great that you want to support us!
      We believe that the possibility to connect and get active in the climate movement should be free and include everyone.
      With a donation you enable us to stay independent. Our full-time team is working hard every day to multiply the impact of climate actors around the globe.`,
      de: `Schön, dass du uns unterstützen möchtest! 
	    Wir glauben, dass die Möglichkeit, sich in der Klimabewegung zu vernetzen und aktiv zu werden, kostenlos sein und jeden einschließen sollte.
      Mit einer Spende ermöglichst du uns, unabhängig zu bleiben. Unser hauptamtliches Team arbeitet jeden Tag hart daran, die Wirkung von Klimaakteuren rund um den Globus zu vervielfachen.`,
    },
    your_donation_helps_scale_up_effective_climate_solutions: {
      en: "Your donation helps scale up effective climate solutions",
      de: "Deine Spende hilft, wirksame Klimalösungen zu skalieren",
    },
    your_donation_helps_scale_up_effective_climate_solutions_text: {
      en: `There are many climate solutions, that have a huge impact in one place. Many of them could also be implemented in other places, but never get scaled up.
        With your donation we can reach even more people and enable them to work with the creators of these solutions to spread the most effective climate solutions around the world.`,
      de: `Es gibt die unterschiedlichsten Klimalösungen, die an dem jeweiligen Ort eine große Wirkung haben. Viele der Projekte und Initiativen könnten auch an anderen Orten umgesetzt werden, werden aber nie in die Breite getragen.
        Mit Deiner Spende können wir noch mehr Menschen erreichen und ihnen ermöglichen, mit Pionieren und Machern weltweit zusammenzuarbeiten, um die effektivsten Klimalösungen auf der ganzen Welt zu verbreiten.`,
    },
    your_donation_multiplies_the_impact_of_climate_actors: {
      en: "Your donation multiplies the impact of climate actors",
      de: "Deine Spende vervielfacht den Impact von Klima-Rettern weltweit",
    },
    your_donation_multiplies_the_impact_of_climate_actors_text: {
      en: `There is currently many people around the world working on similar solutions to
      climate change without even knowing about each other. Climate Connect allows them
      to connect, exchange knowledge and join forces to achieve much more together. We
      will not be able to solve this crisis by working alone or in silos and with your
      donation Climate Connect can multiply the impact of even more climate actors
      worldwide.`,
      de: `Es gibt derzeit viele Menschen auf der ganzen Welt, die an ähnlichen Lösungen 
	  für den Klimawandel arbeiten, ohne überhaupt voneinander zu wissen. Climate Connect 
	  ermöglicht es ihnen, sich zu verbinden, Wissen auszutauschen und ihre Kräfte zu bündeln, 
	  um gemeinsam viel mehr zu erreichen. Wir werden diese Krise nicht lösen können, indem wir 
	  allein oder in Silos arbeiten. Mit Deiner Spende kann Climate Connect die Wirkung 
	  von noch mehr Klimaakteuren weltweit vervielfachen.`,
    },
    your_support_keeps_climate_connect_independent_and_free_for_everyone: {
      en: "Your support keeps Climate Connect independent and free for everyone",
      de: "Durch deine Unterstützung bleibt Climate Connect unabhängig und kostenlos für alle",
    },
    your_support_keeps_climate_connect_independent_and_free_for_everyone_text: {
      en:
        "We strongly believe that a platform connecting all climate actors needs to be independent, non-profit and free for everyone. This is only possible with your financial support.",
      de:
        "Wir sind der festen Überzeugung, dass Climate Connect unabhängig, gemeinnützig und für jeden kostenlos sein muss. Dies ist nur mit deiner finanziellen Unterstützung möglich.",
    },
    donate_with_cryptocurrency: {
      en: "Donate with cryptocurrency",
      de: "Mit Kryptowährung spenden",
    },
    donate_with_cryptocurrency_text: {
      en:
        "While we prefer other payment methods, we've also added the option to donate cryptocurrency. When donating with cryptocurrency you will not receive a donation receipt.",
      de:
        "Obwohl wir andere Zahlungsmethoden bevorzugen, haben wir auch die Option hinzugefügt, mit Kryptowährung zu spenden. Wenn du mit Kryptowährung spendest, können wir leider keine Spendenbescheinigung ausstellen.",
    },
    our_bitcoin_address: {
      en: "Our Bitcoin address",
      de: "Unsere Bitcoin-Adresse",
    },
    what_we_need_to_pay_for: {
      en: "What we need to pay for:",
      de: "Für was wir Geld ausgeben:",
    },
    what_we_need_to_pay_for_text: {
      en:
        "Next to our volunteers from around the world Climate Connect has 3 full-time employees working hard every day to bring climate actors together to multiply their positive impact on our planet. We can only do this in a sustainable way with your financial support.",
      de:
        "Neben unseren Freiwilligen aus aller Welt hat Climate Connect 3 Vollzeitmitarbeiter, die jeden Tag hart daran arbeiten, Klimaakteure zusammenzubringen, um ihren positiven Einfluss auf unseren Planeten zu vervielfachen. Dies können wir nur mit deiner finanziellen Unterstützung nachhaltig tun.",
    },
    we_can_only_prevent_a_global_climate_catastrophe_if_everyone: {
      en: `We can only prevent a global climate catastrophe if everyone working 
      in climate action coordinates their efforts and the most effective solutions 
      get spread globally - support our vision by donating.`,
      de: `Wir können eine globale Klimakatastrophe nur verhindern, wenn alle, 
	  die sich für den Klimaschutz engagieren, ihre Anstrengungen koordinieren und 
	  die effektivsten Lösungen global verbreitet werden - unterstütze unsere 
	  Vision mit einer Spende.`,
    },
    improving_and_updating_climate_connect: {
      en: "Improving and updating Climate Connect",
      de: "Verbessern und Aktualisieren von Climate Connect",
    },
    improving_and_updating_climate_connect_text: {
      en: (
        <>
          We are still in Beta and a big chunk of our work goes into designing and developing new
          features (see our{" "}
          <a href="https://github.com/climateconnect/climateconnect">open source codebase</a>
          ). For the next few months, we will create hubs for each important topic in climate
          action, vastly improve user experience on Climate Connect and try to optimize project
          pages even more so we can be most effective at sparking collaboration and knowledge
          sharing between users. We also constantly improve existing parts of the websites based on
          user feedback.
        </>
      ),
      de: (
        <>
          Wir befinden uns noch in der Beta-Phase und ein großer Teil unserer Arbeit geht in das
          Design und die Entwicklung neuer Funktionen (siehe unsere{" "}
          <a href="https://github.com/climateconnect/climateconnect">Open Source Codebase</a> ). In
          den nächsten Monaten werden wir Hubs für jedes wichtige Thema im Bereich des Klimaschutzes
          einrichten und die Benutzerfreundlichkeit von Climate Connect erheblich verbessern.
          Weiterhin werden wir die Projektseiten noch weiter optimieren, damit wir die
          Zusammenarbeit und den Wissensaustausch zwischen den Nutzern am effektivsten fördern
          können. Außerdem verbessern wir ständig bestehende Teile der Webseiten, basierend auf dem
          Feedback der Nutzer.
        </>
      ),
    },
    growing_the_community_and_sparking_collaboration: {
      en: "Growing the community and sparking collaboration",
      de: "Die Community vergrößern und Zusammenarbeit anregen",
    },
    growing_the_community_and_sparking_collaboration_text: {
      en: `Just putting a platform out there is not enough. Our volunteers and full-time
      employees spend countless hours spreading the word about Climate Connect to work
      towards our vision of connecting all climate actors worldwide. We are also
      constantly in contact with our community and connect users between which we see
      synergies to spark collaboration between Climate Connect users.`,
      de: `Eine Plattform zu schaffen, ist nicht genug. Unsere ehrenamtlichen und Vollzeit-Mitarbeiter 
	  verbringen unzählige Stunden damit, Climate Connect bekannt zu machen, um auf unsere Vision 
	  hinzuarbeiten, alle Klimaakteure weltweit zu verbinden. Wir sind auch ständig in Kontakt mit 
	  unserer Community und den Nutzern von Climate Connect, zwischen denen wir Synergien sehen, 
	  um die Zusammenarbeit zwischen den Nutzern von Climate Connect zu fördern.`,
    },
    ongoing_expenses: {
      en: "Ongoing expenses",
      de: "Laufende Kosten",
    },
    ongoing_expenses_text: {
      en: "Our ongoing expenses include server costs, fees for bookkeeping and legal advice.",
      de:
        "Unsere laufenden Kosten beinhalten Serverkosten, Gebühren für Buchhaltung und Rechtsberatung.",
    },
    long_term_sustainability: {
      en: "Long term sustainability",
      de: "Nachhaltiges Betreiben von Climate Connect",
    },
    long_term_sustainability_text: {
      en: `To make Climate Connect sustainable in the long run, we rely on people supporting us
      continuously. This is why we much prefer smaller recurring donations over one-time
      bigger donations. To pay our current full-time employees a wage that they can live on,
      we would need around 5,000€ in donations per month.`,
      de: `Um Climate Connect auf Dauer tragfähig zu machen, sind wir darauf angewiesen, dass Menschen wie Du
	  uns kontinuierlich unterstützen. Deshalb bevorzugen wir kleinere wiederkehrende Spenden gegenüber 
	  einmaligen Großspenden. Um unseren derzeitigen Vollzeitmitarbeitern einen Lohn zu zahlen, 
	  von dem sie leben können, bräuchten wir etwa 5.000 € an Spenden pro Monat`,
    },
    who_we_are: {
      en: "Who we are",
      de: "Wer wir sind",
    },
    who_we_are_text: {
      en: `This is the European part of our team on the day we launched our Beta. In total we
      are a team of 4 full-time employees and 15 active volunteers from all around the
      world. Together we work on developing and designing the platform, spreading the word
      through marketing and trying the best to serve our community. We have all decided to
      dedicate our time towards trying to make the biggest difference in the fight against
      climate change.`,
      de: `Das ist der europäische Teil unseres Teams am Tag des Starts unserer Beta Website. 
	  Insgesamt sind wir ein Team von 4 Vollzeitmitarbeitern und 15 aktiven Freiwilligen aus 
	  der ganzen Welt. Gemeinsam arbeiten wir an der Entwicklung und dem Design der Plattform, 
	  verbreiten das Wort durch Marketing und versuchen das Beste für unsere Community zu tun. 
	  Wir haben alle beschlossen, unsere Zeit dem größten Unterschied im Kampf gegen 
	  den Klimawandel zu widmen.`,
    },
    donation_receipts: {
      en: "Donation receipts",
      de: "Spendenquittungen",
    },
    donation_receipts_text_first_part: {
      en: `We are an official non-profit company registered in Germany (Climate Connect gUG
        (haftungsbeschränkt)). This means we can issue tax deductible donations receipts. For
        german citizens with accumulated donations of less than 300€ per year a simplified
        proof of grant is sufficient.`,
      de: `Wir sind eine in Deutschland offiziell eingetragene gemeinnützige Gesellschaft 
	  (Climate Connect gUG (haftungsbeschränkt)). Das bedeutet, dass wir steuerlich absetzbare 
	  Spendenbescheinigungen ausstellen können. Für deutsche Bürger mit kumulierten Spenden von 
	  weniger als 300€ pro Jahr ist ein vereinfachter Zuwendungsnachweis ausreichend.`,
    },
    donation_receipts_text_middle_part: {
      en: (
        <>
          You can find a document explaining a simplified proof of grant and confirming our
          nonprofit status{" "}
          <Link
            target="_blank"
            href="/documents/nonprofit_status_confirmation.pdf"
            underline="hover"
          >
            here
          </Link>
          . (PDF in german language)
        </>
      ),
      de: (
        <>
          Hier findest Du ein Dokument, das einen vereinfachten Zuwendungsnachweis und die
          Bestätigung unseres Gemeinnützigkeitsstatus erklärt{" "}
          <Link
            target="_blank"
            href="/documents/nonprofit_status_confirmation.pdf"
            underline="hover"
          >
            hier
          </Link>
          . (PDF in deutscher Sprache)
        </>
      ),
    },
    donation_receipts_text_last_part: {
      en: (
        <>
          For donors who donate over 300€ per year we issue a donation receipt.{" "}
          <Link href="mailto:contact@climateconnect.earth" underline="hover">
            Contact us
          </Link>{" "}
          if you need any other documents.
        </>
      ),
      de: (
        <>
          Für Spender, die mehr als 300€ pro Jahr spenden, stellen wir eine Spendenbescheinigung
          aus.{" "}
          <Link href="mailto:contact@climateconnect.earth" underline="hover">
            Kontaktiere uns
          </Link>
          , wenn du weitere Unterlagen benötigst.
        </>
      ),
    },
    we_rely_on_your_donation_to_stay_independent: {
      en: (
        <>
          We rely on your donation to <span className={classes?.yellow}>stay independent!</span>
        </>
      ),
      de: (
        <>
          Wir sind auf Deine Spende angewiesen, um{" "}
          <span className={classes?.yellow}>unabhängig zu bleiben!</span>
        </>
      ),
    },
    we_are_non_profit_and_running_only_on_donations: {
      en: `We are non-profit and running only on donations. Only with your financial support we can
      connect climate actors worldwide sustainably in the long run.`,
      de: `Wir sind gemeinnützig und finanzierung uns ausschließlich durch Spenden. Nur mit deiner finanziellen Unterstützung 
	  können wir langfristig und nachhaltig Klimaakteure weltweit vernetzen.`,
    },
    donate_now: {
      en: "Donate now",
      de: "Jetzt Spenden",
    },
    //example: 50€ raised of of 1000€ goal
    raised_out_of_goal: {
      en: `raised out of ${goal}€ goal`,
      de: `von ${goal}€ Ziel gesammelt`,
    },
    donor_forest: {
      en: "Donor Forest",
      de: "Spendenwald",
    },
    watch_the_forest_grow: {
      en: "The Digital Forest of Climate Connect Supporters",
      de: "Der digitale Wald der Climate Connect Unterstützer*innen",
    },
    forest_explainer_headline: {
      en: "Plant Your Own Tree",
      de: "Pflanze deinen Baum",
    },
    forest_explainer_text: {
      en: "Donate today to support climate action and become part of the forest",
      de: "Spende noch heute, um das Klima zu schützen und Teil des Waldes zu werden",
    },
    how_it_works: {
      en: "How it works",
      de: "Wie es funktioniert",
    },
    forest_explainer_dialog_title: {
      en: "The Donor Forest",
      de: "Der Spendenwald",
    },
    donor_forest_dialog_explainer_text: {
      en: `When you start donating to Climate Connect you get a digital sapling as a reward. 
      If you donate monthly or yearly your tree keeps growing. Your donation amount determines
      the initial size of your sapling.
      Your tree is displayed in the donor forest and next to your account on the platform.`,
      de: `Wenn du an Climate Connect spendest, bekommst du einen digitalen Setzling. Mit welchem
      Setzling du startest, hängt von der Höhe deiner Spende ab.
      Wenn du monatlich oder jährlich spendest, wächst dein Baum immer weiter. Dein Baum wird im 
      Spendenwald und immer neben deinem Profilbild auf der Plattform angezeigt.`,
    },
    donor_forest_dialog_call_to_action_text: {
      en: "Donate now to start growing your tree!",
      de: "Spende jetzt und lass deinen Baum wachsen!",
    },
    has_been_a_supporter_for: {
      en: "has been a supporter for",
      de: "unterstützt seit",
    },
    donation_campaign_headline_short: {
      en: "Donate for climate action",
      de: "Spende für den Klimaschutz",
    },
    donation_campaign_headline_long: {
      en: `Accelerate climate action with your donation`,
      de: `Beschleunige den Klimaschutz mit deiner Spende`,
    },
    you_can_find_the_terms_to_the_raffle_here: {
      en: "You can find the terms of the raffle ",
      de: "Die Teilnahmebedingungen der Verlosung findest du ",
    },
    here: {
      en: "here",
      de: "hier",
    },
    donation_campaing_info_text_first_sentence: {
      en: (
        <>
          Climate Connect is funded by your donations. Help scale up effective climate action,
          support us in growing a global network of climate actors and allow Climate Connect to stay
          free and independent. Each week in December you can read a story about how Climate Connect
          helps people effectively fight climate change on our{" "}
          <Link color="inherit" underline="always" href="/blog" target="_blank">
            blog
          </Link>{" "}
          .
        </>
      ),
      de: (
        <>
          Climate Connect ist unabhängig und spendenfinanziert. Hilf uns, effektive
          Klimaschutzprojekte zu ermöglichen, ein globales Netzwerk von Klimaschützer*innen
          aufzubauen und dabei, Climate Connect kostenlos und unabhängig zu halten. Jede Woche im
          Dezember kannst du auf unserem{" "}
          <Link color="inherit" underline="always" href="/blog" target="_blank">
            Blog
          </Link>{" "}
          einen neuen Artikel darüber lesen, wie Menschen mithilfe von Climate Connect den
          Klimawandel bekämpfen.
        </>
      ),
    },
    raffle_announcement: {
      en: `In our December raffle everybody who donates to Climate Connect in the
      month of December has a chance to win prizes like the compensation of their year's
      CO2-footprint kindly sponsored by `,
      de: `Alle, die im Dezember spenden, können tolle Preise gewinnen, z.B. ein Jahr 
      klimapositiv Leben, gesponsort von `,
    },
  };
}
