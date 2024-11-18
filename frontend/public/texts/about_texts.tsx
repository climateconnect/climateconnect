import { Link } from "@mui/material";
import React from "react";

export default function getAboutTexts(classes) {
  return {
    top_section_headline: {
      en: "About",
      de: "Über Uns",
      fr: "A propos"
    },
    top_section_subheader: {
      en: "A new way to fight climate change. Together. Nonprofit. Independent.",
      de: "Eine neue Art den Klimawandel zu bekämpfen. Gemeinsam. Gemeinnützig. Unabhängig.",
      fr: "Une nouvelle façon d'agir pour le climat. Ensemble. Sans but lucratif. Indépendant."
    },
    about_quote_text: {
      en: `We want to connect everyone that is fighting against climate change from
      Greta Thunberg and Greenpeace to the local sustainable startup, local
      and national governments, and your friend who just recently realized that
      biking to work instead of driving can already make a difference.`,
      de: `Wir möchten alle zusammenbringen, die gegen den Klimwandel kämpfen - von Greta Thunberg
      und Greenpeace bis hin zum lokalen nachhaltigen Startup,
      über lokale und nationale Regierungen und deiner Bekannten, die kürzlich erst für sich entdeckt hat,
      dass es schon einen Unterschied machen kann, mit dem Rad anstatt mit dem Auto zur Arbeit zu fahren.`,
      fr: `Nous voulons relier tous ceux qui luttent contre le changement climatique, 
      de Greta Thunberg et Greenpeace à la startup locale durable, aux gouvernements locaux et nationaux, 
      et à votre ami qui vient de réaliser que se rendre au travail à vélo plutôt 
      qu'en voiture peut déjà faire une différence.`
    },
    our_solution: {
      en: "Our Solution",
      de: "Unsere Lösung",
      fr: "Notre solution"
    },
    climate_connect_was_born: {
      en: "Climate Connect was born",
      de: "Die Gründung von Climate Connect",
      fr: "Climate Connect est né"
    },
    climate_connect_was_born_text: {
      en: `The idea of Climate Connect was born after a local networking event in Chris and Tobi's
      home town Erlangen, Germany. After the event it was very obvious that not a lot of
      people knew each other or worked together before. The idea was born to bring this
      approach to a global level, and to include as many people as possible to fight climate
      change together.`,
      de: `Die Idee ist Climate Connect wurde nach einem lokalen Networking-Event mit Chris
      und Tobias in ihrer Heimatstadt Erlangen entstanden. Nach der Veranstaltung war es offensichtlich,
      dass sich viele Klimaschützer*innen untereinander gar nicht kannten und es kaum Zusammenarbeit zwischen den Akteuren gab.
      So war die Idee geboren, das Ganze auf ein globales Level anzuheben und so viele Leute wie möglich zusammenzubringen, die gegen den Klimawandel kämpfen.`,
      fr: `L'idée de Climate Connect est née après un événement de réseautage local avec Chris et Tobias 
      dans leur ville natale d'Erlangen. Après l'événement, il était évident que de nombreux défenseurs du climat 
      ne se connaissaient pas et qu'il y avait peu de coopération entre les acteurs. 
      C'est ainsi qu'est née l'idée de renforcer cette coopération au niveau local, puis mondial, 
      et de réunir toutes les personnes qui luttent contre le changement climatique.`
    },
    climate_connect_was_born_image_text: {
      en:
        "The idea of Climate Connect was born after the success of this event, which resulted in the creation of a Climate action concept for the University in Erlangen",
      de:
        "Nach dem Erfolg dieser Veranstaltung wurde die Idee für Climate Connect geboren. Außerdem war das Event unter anderem der Startschuss für die Erstellung eines Klimaschutzkonzeptes für die Universität in Erlangen-Nürnberg",
        fr: "L'idée du Climate Connect est née après le succès de cet événement, qui a abouti à la création d'un concept d'action climatique pour l'université d'Erlangen."
    },
    the_challenge: {
      en: "The Challenge",
      de: "Die Herausforderung",
      fr: "Le défi"
    },
    the_challenge_image_text: {
      en: "One firefighter fights against bog fire in the twilight",
      de: "Ein Feuerwehrmann kämpft gegen ein Moorbrand in der Dämmerung",
      fr: "Un pompier lutte contre un feu de tourbière au crépuscule"
    },
    we_can_only_solve_the_climate_crisis_through_worldwide_collaboration: {
      en: "We can only solve the climate crisis through worldwide collaboration",
      de: "Wir können die Klimakrise nur durch eine weltweite Zusammenarbeit lösen",
      fr: "Seule une collaboration à l'échelle mondiale permettra de résoudre la crise climatique."
    },
    the_climate_crisis_is_the_biggest_challenge_text: {
      en: (
        <>
          The climate crisis is <span className={classes?.marked}>the biggest challenge</span>{" "}
          humanity has ever faced - and we can only solve it together.
        </>
      ),
      de: (
        <>
          Die Klimakrise ist <span className={classes?.marked}>die größte Herausforderung,</span>{" "}
          vor der die Menschheit jemals stand - wir können sie nur gemeinsam besiegen.
        </>
      ),
      fr: (
        <>
          La crise climatique est <span className={classes?.marked}>le plus gros défi ,</span>{" "}
          auquel l'humanité fait face - et nous ne pourrons que le résoudre ensemble.
        </>
      )
    },
    spread_effective_solutions_globally_text: {
      en: (
        <>
          Many people are working on very effective climate solutions. We need to{" "}
          <span className={classes?.marked}>spread effective solutions</span> globally.
        </>
      ),
      de: (
        <>
          Viele Menschen arbeiten an sehr effektiven Lösungen für die Klimakrise. Wir müssen
          lediglich diese effektiven{" "}
          <span className={classes?.marked}>Lösungen weltweit verbreiten</span>.
        </>
      ),
      fr: (
        <>
          Tellement de gens travaillent déjà sur des solutions au changement climatique. 
          Il nous suffit d'utiliser ces{" "}
          <span className={classes?.marked}>solutions et les diffuser dans le monde entier</span>.
        </>
      )
    },
    ngos_companies_governments_institutions_citizens_need_to_work_together_text: {
      en: (
        <>
          NGOs, companies, governments, public institutions and citizens need to{" "}
          <span className={classes?.marked}>work together</span> to solve this crisis.
        </>
      ),
      de: (
        <>
          NGOs, Unternehmen, Regierungen, öffentliche Einrichtungen und Bürger müssen{" "}
          <span className={classes?.marked}>zusammenarbeiten</span>, um diese Krise zu lösen.
        </>
      ),
      fr: (
        <>
          ONGs, entreprises, pouvoirs publiques et groupes citoyens doivent{" "}
          <span className={classes?.marked}>travailler ensemble</span>, pour résoudre cette crise.
        </>
      )
    },
    this_is_why_we_created_climate_connect: {
      en: "This is why we created Climate Connect",
      de: "Deshalb haben wir Climate Connect ins Leben gerufen",
      fr: "C'est ce pourquoi Climat Connect est né"
    },
    our_goals: {
      en: "Our Goals",
      de: "Unsere Ziele",
      fr: "Nos objectifs"
    },
    climate_actors_connecting_over_the_internet: {
      en: "climate actors connecting over the internet",
      de: "Klimaschützer*innen, die sich über das Internet verbinden",
      fr: "Les acteurs environnemntaux se rencontrent en ligne"
    },
    connect_everyone_working_on_climate_action: {
      en: "Connect Everyone Working On Climate Action",
      de: "Alle zusammenbringen, die am Klimaschutz arbeiten",
      fr: "Connecter toutes celles et ceux agissant pour le climat"
    },
    group_of_people_icon: {
      en: "Group of People icon",
      de: "Gruppe von Leuten Icon",
      fr: "Icône d'un groupe de personnes"
    },
    accelerate_climate_action_worldwide: {
      en: "Accelerate Climate Action Worldwide",
      de: "Klimaschutz weltweit beschleunigen",
      fr: "Faciliter la coopération environnementale dans le monde"
    },
    one_platform_for_all_climate_actors: {
      en: "One Platform For All Climate Actors",
      de: "Eine Plattform für alle Klimaschützer:innen",
      fr: "Une platforme pour tous"
    },
    how_climate_connect_works: {
      en: "How Climate Connect Works",
      de: "Wie Climate Connect funktioniert",
      fr: "Comment Climate Connect fonctionne"
    },
    spread_your_solution_globally: {
      en: "Spread your solution globally",
      de: "Verbreite deine Lösung weltweit",
      fr: "Partage ta solution au monde entier"
    },
    spread_your_solution_globally_text: {
      en:
        "Share your climate change solutions with the climate action community and find people who can use your experience to replicate your solutions somewhere else. Receive help and feedback on what you are doing to combat global warming and increase your impact!",
      de:
        "Teile deine Lösung gegen den Klimawandel mit der Klimaschutz Community und finde Personen, die dein Projekt auch an anderen Orten verwirklichen können. Erhalte Hilfe und Feedback zu dem, wie du was du gegen die Globale Erwärmung tust und erhöhe deinen Impact!",
      fr: "Partage ta solution avec la communauté et trouve des personnes qui veulent répliquer ta solution ailleurs. Recois aide et conseils et augmente ton impact"
    },
    how_to_start: {
      en: "How to start",
      de: "So startest du",
      fr: "Comment commencer"
    },
    get_inspired: {
      en: "Get inspired",
      de: "Lass dich inspirieren",
      fr: "S'inspirer"
    },
    get_inspired_text: {
      en:
        "Find inspiring solutions to global warming. Replicate succesful projects and benefit from the experience of others. Find solutions that actually make a difference! Contact the project owners directly to ask about their lessons learned and knowledge on any specific project.",
      de:
        "Finde inspirierende Lösungen zur globalen Erwärmung. Vervielfältige erfolgreiche Projekte und profitiere von den Erfahrungen anderer. Finde Lösungen, die tatsächlich einen Unterschied machen! Wende dich direkt an die Projektverantwortlichen und frag sie nach ihren Erfahrungen und deren Wissen über ein bestimmtes Projekt.",
      fr: 
        "Trouve d'inspirantes solution au changement climatique. Multiplie les projets réussis et profite de l'expérience des autres. Reproduit les solutions qui font vraiment la différence ! Adresse-toi directement aux responsables de projet et demande-leur de partager leurs expériences et leurs connaissances sur un projet donné. "
    },
    worldwide_collaboration: {
      en: "Worldwide collaboration",
      de: "Weltweite Zusammenarbeit",
      fr: "Coopération mondiale"
    },
    worldwide_collaboration_text: {
      en:
        "Worldwide collaboration in climate action is the main goal of Climate Connect. We want everyone involved in fighting climate change to work together! Filter projects by what skills they are looking for to find out where you can make the biggest difference with your individual skillset!",
      de:
        "Das Hauptziel von Climate Connect ist weltweite Zusammenarbeit für den Klimaschutz. Wir wollen, dass alle die im Kampf gegen den Klimawandel beteiligt sind, zusammenarbeiten! Filtere Projekte nach den gesuchten Fähigkeiten, um herauszufinden, wo du mit deinem individuellen Fähigkeiten am meisten bewirken kannst!",
      fr: 
        "Notre objectif principal est la coopération tant à l'échelle locale que mondiale en matiére d'action pour le climat. Nous voulons que toute personne impliqué dans cette lutte puisse travailler ensemble. Filtre donc selon tes compétences et centres d'intérêts pour trouver les projets dans lequel tu pourras avoir le plus d'impact!"
    },
    our_team: {
      en: "Our Team",
      de: "Unser Team",
      fr: "Notre équipe"
    },
    our_team_text: {
      en: `We are an international team of 3 people running Climate Connect full-time and around 20
      volunteers dedicating their free-time to creating collaboration between climate actors.`,
      de: `Wir sind ein internationales Team aus 3 Personen, die Climate Connect in Vollzeit betreiben und etwa 20 Freiwillige,
      die Ihre Freizeit der Zusammenarbeit zwischen den Klimaschützer*innen widmen.`,
      fr: `Nous sommes une équipe d'une dizaine de salariés supportée par une vingtaine de bénévoles 
      qui dévouent leur temps à la coopération entres acteurs environnementaux.`
    },
    contact_us_if_youre_interested_in_joining_the_team: {
      en: (
        <>
          <Link underline="always" href="mailto:contact@climateconnect.earth">
            Contact us
          </Link>{" "}
          if you are interested in joining the team!
        </>
      ),
      de: (
        <>
          <Link underline="always" href="mailto:contact@climateconnect.earth">
            Kontaktiere uns,
          </Link>{" "}
          wenn du interessiert bist, mitzumachen!
        </>
      ),
      fr: (
        <>
          <Link underline="always" href="mailto:contact@climateconnect.earth">
            Contacte nous,
          </Link>{" "}
          si tu veux rejoindre notre équipe!
        </>
      )
    },
    icon_displays_2_people: {
      en: "Icon displays 2 people",
      de: "Icon zeigt 2 Personen",
      fr: "Icône montrant deux personnes"
    },
    find_out_more: {
      en: "Find Out More",
      de: "Finde mehr heraus",
      fr: "En savoir plus"
    },
    learn_more_about_out_team: {
      en: "Learn more about our team and why we do what we are doing - coming soon!",
      de: "Lerne mehr über unser Team und warum wir das tun was wir tun - Bald mehr hierzu!",
      fr: "En savoir plus à propos de notre équipe et pourquoi nous nous engageons"
    },
    the_idea_is_born: {
      en: "The Idea Is Born",
      de: "Die Idee ist geboren",
      fr: "L'idée a germée "
    },
    the_idea_is_born_text: {
      en:
        "After the networking event, we started working on a way for climate actors to work together to spread good climate solutions worldwide. The idea of Climate Connect was born.",
      de:
        "Nach dem Networking-Event haben wir begonnen an einem Weg zu arbeiten, um Klimaschützer*innen zu ermöglichen zusammenzuarbeiten und effektive Klimalösungen weltweit zu verbreiten. Die Idee von Climate Connect war geboren.",
      fr: 
        "Après l'événement de réseautage nous avons commencé à travailler sur un moyen pour les acteurs du climat de travailler ensemble pour diffuser les bonnes solutions climatiques dans le monde entier. C'est ainsi qu'est née l'idée de Climate Connect."
    },
    first_prototype: {
      en: "First Prototype",
      de: "Erster Prototyp",
      fr: "Premier Prototype"
    },
    first_prototype_text: {
      en:
        "We create our first interactive design prototype and create concepts for how to create collaboration between climate actors. Our team of volunteers starts growing.",
      de:
        "Wir erstellen unser ersten interaktiven Deisgn Prototyp und das Konzept, wie eine Zusammenarbeit zwischen Klimsaschützern möglich ist, erstellt. Unser Team von Freiweilligen beginnt zu wachsen.",
      fr: 
        "Nous avons créé notre premier prototype interactif et nos concepts sur comment engager une collaboration entre les acteurs environnementaux. Notre équipe de bénévoles s'aggrandit"
    },
    beta_launch: {
      en: "Beta launch",
      de: "Beta Launch",
      fr: "Lancement de la Beta"
    },
    beta_launch_text: {
      en:
        "We finally launched Climate Connect in Open Beta. New functionality is added every week and we constantly improve the platform based on your feedback.",
      de:
        "Wir haben Climate Connect endlich in der Open Beta veröffentlicht. Jede Woche kommen neue Funktionen hinzu und wir verbessern die Plattform ständig auf der Grundlage eures Feedbacks.",
      fr: 
        "Nous avons enfin lancé la version Beta de Climate Connect. De nouvelles fonctionnalités sont ajoutées chaque semaine et on améliorer constament la plateforme sur la base de vos retour utilisateurs."
    },
    leaving_beta: {
      en: "Leaving Beta",
      de: "Verlassen der Beta",
      fr: "Fin de la Beta"
    },
    leaving_beta_text: {
      en:
        "In the winter of 2021/2022 we expect all core functionality to work smoothly and all pages and content to be polished and user-friendly. Help us get here by sharing your feedback!",
      de:
        "Im Winter 2021/2022 erwarten wir, dass alle Kernfunktionen reibungslos funktionieren und alle Seiten sowie Inhalte ausgefeilt und benutzerfreundlich sind. Helft uns, dies zu erreichen, indem ihr uns Feedback gebt!",
      fr: 
        " A l'hiver 2021/2022 nous voyons que toutes les fonctions principales et que toutes les pages et tous les contenus sont élaborés et faciles à utiliser. "  
    },
    after_realizing_the_need_for_global_collaboration: {
      en:
        "After realizing the need for global collaboration, Climate Connect was launched in July 2020",
      de:
        "Nachdem die Notwendigkeit einer globalen Zusammenarbeit erkannt wurde, wurde Climate Connect im Juli 2020 ins Leben gerufen",
      fr: 
        "Afin de contribuer a lutter global contre le changement climatique, la plateforme Climate Connect a été lancée en Juillet 2020 "  
    },
    our_values: {
      en: "Our Values",
      de: "Unsere Werte",
      fr: "Nos valeurs"
    },
    climate_connect_is_a_donation_funded_ngo: {
      en: (
        <>
          Climate Connect is a <span className={classes?.yellow}>donation funded</span> NGO - we
          dedicate all our work to make an impact on climate change.
        </>
      ),
      de: (
        <>
          Climate Connect ist eine durch{" "}
          <span className={classes?.yellow}>Spenden finanzierte</span> NGO - wir widmen unsere
          gesamte Energie der Bekämpfung des Klimawandels.
        </>
      ),
      fr: (
        <>
          Climate Connect est une ONG {" "}
          <span className={classes?.yellow}>financé par des dons </span> qui dédie tout son travail à la lutte contre le changement climatique.
        </>
      )
    },
    being_an_independent_organisation_allows_us_to_work_with: {
      en: (
        <>
          Being an independent organisation allows us to work with{" "}
          <span className={classes?.yellow}>everyone involved in fighting climate change.</span>
        </>
      ),
      de: (
        <>
          Da wir eine unabhängige Organisation sind, können wir mit{" "}
          <span className={classes?.yellow}>
            allen zusammenarbeiten, die im Kampf gegen den Klimawandel beteiligt sind.
          </span>
        </>
      ),
      fr: (
        <>
          Etre une organisation indépendante nous permet de travailler avec {" "}
          <span className={classes?.yellow}>toutes celles et ceux impliqué.es dans la lutte contre le changement climatique.</span>
        </>
      )
    },
    this_is_also_why_we_include_our_community_as_much_as_possible: {
      en: (
        <>
          This is also why we include our community as much as possible. Our codebase is{" "}
          <span className={classes?.yellow}>open source</span>, we organize regular network events
          and let our users help us decide what steps to take next.
        </>
      ),
      de: (
        <>
          Das ist auch der Grund, warum wir unsere Community bestmöglich einbeziehen. Unser Projekt
          ist <span className={classes?.yellow}>Open Source</span>, wir organisieren regelmäßig
          Networking-Events und lassen unsere Community mitentscheiden, welche Schritte wir als
          nächsten unternehmen wollen.
        </>
      ),
      fr: (
        <>
          C'est aussi pourquoi on implique notre communauté dans nos décisions. Tout notre code est {" "}
          <span className={classes?.yellow}>open source</span>, et on organise réguliérement des événements pour que nos membres 
          nos aident à choisir vers où s'orienter.
        </>
      )
    },
    free_and_nonprofit: {
      en: "Free & Non-Profit",
      de: "Kostenlos & Gemeinnützig",
      fr: "Gratuit et à but non lucratif"
    },
    open_source: {
      en: "Open Source",
      de: "Open Source",
      fr: "Open Source"
    },
    community_driven: {
      en: "Community driven",
      de: "Community getrieben",
      fr: "La communauté à la manœuvre"
    },
    independent: {
      en: "Independent",
      de: "Unabhängig",
      fr: "Indépendant"
    },
    idea_lightbulb_icon: {
      en: "Idea lightbulb",
      de: "Idee Glühbirne",
      fr: "Idée ampoule"
    },
    this_is_climate_connect: {
      en: "This is Climate Connect",
      de: "Das ist Climate Connect",
      fr: "Ca c'est Climate Connect"
    },
    a_free_nonprofit_climate_action_network: {
      en: (
        <>
          A <b>free, non-profit</b> climate action network.
        </>
      ),
      de: (
        <>
          Ein <b>kostenloses, gemeinnütziges</b> Klimaschutznetzwerk
        </>
      ),
      fr: (
        <>
          Un réseau <b> gratuit et à but non lucratif </b> d'action pour le climat.
        </>
      )
    },
    hundred_percent_independent: {
      en: "100% independent",
      de: "100% Unabhängig",
      fr: "100% indépendant"
    },
    heart_icon: {
      en: "Heart Icon",
      de: "Herz Symbol",
      fr: "Symbole de coeur"
    },
    //Split into 3 lines
    for_everyone_who_contributes_or_wants_to_contribute: {
      en: (
        <>
          For <b>everyone</b> who contributes or
          <br />
          wants to contribute to solving the
          <br />
          climate crisis.
        </>
      ),
      de: (
        <>
          Für <b>alle</b>, die zur Lösung der
          <br />
          Klimakrise beitragen oder
          <br />
          dazu beitragen möchten
        </>
      ),
      fr: (
        <>
          Pour <b>chacun.e</b> qui agit, ou
          <br />
          voudrait participer à résoudre
          <br />
          la crise environnementale.
        </>
      )
    },
    enabling_global_and_locale_collaboration_and_knowledge_sharing: {
      en: (
        <>
          Enabling global and local
          <br />
          <b>collaboration and knowledge sharing</b>
          <br />
          in climate action.
        </>
      ),
      de: (
        <>
          Förderung von globaler und lokaler
          <br />
          Zusammenarbeit und Wissensaustausch
          <br />
          im Klimaschutz.
        </>
      ),
      fr: (
        <>
          Promouvoir localement et à l'international
          <br />
          <b>la collaboration et le transfert d'expérience</b>
          <br />
          de nos actions environnementales.
        </>
      )
    },
    effective_climate_action_only_works_with_global_collaboration: {
      en: "Effective climate action only works with global collaboration",
      de: "Effektiver Klimaschutz funktioniert nur durch globale Zusammenarbeit",
      fr: "Une action efficace pour le climat passe par une coopération mondiale"
    },
    winter: {
      en: "Winter",
      de: "Winter",
      fr: "Hiver"
    },
  };
}
