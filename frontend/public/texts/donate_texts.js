import { Link } from "@material-ui/core";
import React from "react";

export default function getDonateTexts({ classes, goal }) {
  return {
    donate_infinitive: {
      en: "Donate",
      de: "Spenden",
    },
    your_donation_counts: {
      en: "Your Donation Counts",
      de: "",
    },
    support_growing_a_global_network_of_climate_actors: {
      en: "Support growing a global network of climate actors.",
      de: "",
    },
    a_new_way_to_fight_climate_change_donate_today: {
      en: "A new way to fight climate change. Donate today.",
      de: "",
    },
    why_donate: {
      en: "Why donate?",
      de: "",
    },
    why_donate_text: {
      en: `Great that you want to support us!
      We believe that the possibility to connect and get active in the climate movement should be free and include everyone.
      With a donation you enable us to stay independent. Our full-time team is working hard every day to multiply the impact of climate actors around the globe.`,
      de: ``,
    },
    your_donation_helps_scale_up_effective_climate_solutions: {
      en: "Your donation helps scale up effective climate solutions",
      de: "",
    },
    your_donation_helps_scale_up_effective_climate_solutions_text: {
      en: `There are many climate solutions, that have a huge impact in one place. Many of them could also be implemented in other places, but never get scaled up.
        With your donation we can reach even more people and enable them to work with the creators of these solutions to spread the most effective climate solutions around the world.`,
      de: ``,
    },
    your_donation_multiplies_the_impact_of_climate_actors: {
      en: "Your donation multiplies the impact of climate actors",
      de: "",
    },
    your_donation_multiplies_the_impact_of_climate_actors_text: {
      en: `There is currently many people around the world working on similar solutions to
      climate change without even knowing about each other. Climate Connect allows them
      to connect, exchange knowledge and join forces to achieve much more together. We
      will not be able to solve this crisis by working alone or in silos and with your
      donation Climate Connect can multiply the impact of even more climate actors
      worldwide.`,
      de: ``,
    },
    your_support_keeps_climate_connect_independent_and_free_for_everyone: {
      en: "Your support keeps Climate Connect independent and free for everyone",
      de: "",
    },
    your_support_keeps_climate_connect_independent_and_free_for_everyone_text: {
      en:
        "We strongly believe that a platform connecting all climate actors needs to be independent, non-profit and free for everyone. This is only possible with your financial support.",
      de: "",
    },
    donate_with_cryptocurrency: {
      en: "Donate with cryptocurrency",
      de: "",
    },
    donate_with_cryptocurrency_text: {
      en:
        "While we prefer other payment methods, we've also added the option to donate cryptocurrency. When donating with cryptocurrency you will not receive a donation receipt.",
      de: "",
    },
    our_bitcoin_address: {
      en: "Our Bitcoin address",
      de: "",
    },
    what_we_need_to_pay_for: {
      en: "What we need to pay for",
      de: "",
    },
    what_we_need_to_pay_for_text: {
      en:
        "Next to our volunteers from around the world Climate Connect has 3 full-time employees working hard every day to bring climate actors together to multiply their positive impact on our planet. We can only do this in a sustainable way with your financial support.",
      de: "",
    },
    we_can_only_prevent_a_global_climate_catastrophe_if_everyone: {
      en: `We can only prevent a global climate catastrophe if everyone working 
      in climate action coordinates their efforts and the most effective solutions 
      get spread globally - support our vision by donating.`,
      de: "",
    },
    improving_and_updating_climate_connect: {
      en: "Improving and updating Climate Connect",
      de: "",
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
      de: <></>,
    },
    growing_the_community_and_sparking_collaboration: {
      en: "Growing the community and sparking collaboration",
      de: "",
    },
    growing_the_community_and_sparking_collaboration_text: {
      en: `Just putting a platform out there is not enough. Our volunteers and full-time
      employees spend countless hours spreading the word about Climate Connect to work
      towards our vision of connecting all climate actors worldwide. We are also
      constantly in contact with our community and connect users between which we see
      synergies to spark collaboration between Climate Connect users.`,
      de: "",
    },
    ongoing_expenses: {
      en: "Ongoing expenses",
      de: "",
    },
    ongoing_expenses_text: {
      en: "Our ongoing expenses include server costs, fees for bookkeeping and legal advice.",
      de: "",
    },
    long_term_sustainability: {
      en: "Long term sustainability",
      de: "",
    },
    long_term_sustainability_text: {
      en: `To make Climate Connect sustainable in the long run, we rely on people supporting us
      continuously. This is why we much prefer smaller recurring donations over one-time
      bigger donations. To pay our current full-time employees a wage that they can live on,
      we would need around 5,000€ in donations per month.`,
      de: "",
    },
    who_we_are: {
      en: "Who we are",
      de: "",
    },
    who_we_are_text: {
      en: `This is the European part of our team on the day we launched our Beta. In total we
      are a team of 3 full-time employees and 15 active volunteers from all around the
      world. Together we work on developing and designing the platform, spreading the word
      through marketing and trying the best to serve our community. We have all decided to
      dedicate our time towards trying to make the biggest difference in the fight against
      climate change.`,
      de: ``,
    },
    donation_receipts: {
      en: "Donation receipts",
      de: "",
    },
    donation_receipts_text_first_part: {
      en: `We are an official non-profit company registered in Germany (Climate Connect gUG
        (haftungsbeschränkt). This means we can issue tax deductible donations receipts. For
        german citizens with accumulated donations of less than 300€ per year a simplified
        proof of grant is sufficient.`,
      de: ``,
    },
    donation_receipts_text_middle_part: {
      en: (
        <>
          You can find a document explaining a simplified proof of grant and confirming our
          nonprofit status{" "}
          <Link target="_blank" href="/documents/nonprofit_status_confirmation.pdf">
            here
          </Link>
          . (PDF in german language)
        </>
      ),
      de: <></>,
    },
    donation_receipts_text_last_part: {
      en: (
        <>
          For donors who donate over 300€ per year we issue a donation receipt.{" "}
          <Link href="mailto:contact@climateconnect.earth">Contact us</Link> if you need any other
          documents.
        </>
      ),
      de: <></>,
    },
    we_rely_on_your_donation_to_stay_independent: {
      en: (
        <>
          We rely on your donation to <span className={classes?.yellow}>stay independent!</span>
        </>
      ),
      de: "",
    },
    we_are_non_profit_and_running_only_on_donations: {
      en: `We are non-profit and running only on donations. Only with your financial support we can
      connect climate actors worldwide sustainably in the long run.`,
      de: ``,
    },
    donate_now: {
      en: "Donate now",
      de: "",
    },
    //example: 50€ raised of of 1000€ goal
    raised_out_of_goal: {
      en: `raised out of ${goal}€ goal`,
      de: `von ${goal}€ Ziel gesammelt`,
    },
  };
}
