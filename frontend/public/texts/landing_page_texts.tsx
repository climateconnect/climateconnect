import React from "react";

export default function getLandingPageTexts({ classes, isNarrowScreen }) {
  return {
    be_part_of_the_community: {
      en: (
        <>
          <span className={classes?.yellow}>Be part</span> of the community
        </>
      ),
      de: (
        <>
          <span className={classes?.yellow}>Sei Teil</span> der Community
        </>
      ),
      fr: (
        <>
          <span className={classes?.yellow}>Rejoint</span> la communauté
        </>
      )
    },
    be_part_of_the_community_text: {
      en: `Sign up to Climate Connect - it's free! By signing up you can work together and
      share knowledge and experiences with people taking climate action globally and in your home
      town.`,
      de: `Melde dich bei Climate Connect an - es ist kostenlos! Wenn du dich anmeldest, kannst du
      mit Menschen zusammenarbeiten und Erfahrungen austauschen, die sich weltweit und in deiner Heimatstadt
      für den Klimaschutz engagieren.`,
      fr: `Rejoins Climate Connect - c'est gratuit! En t'inscrivant tu peux rencontrer et échanger avec pleins d'acteurs.ices prés de chez toi
      et dans le monde entier.`
    },
    whether_youre_working_on_climate_action_fulltime: {
      en:
        "Whether you're working on climate action fulltime, on a volunteer basis or are just looking for what to do against climate change, we're all part of #teamclimate.",
      de:
        "Egal, ob du dich hauptberuflich oder ehrenamtlich für den Klimaschutz engagierst oder einfach nur wissen willst, was Du gegen den Klimawandel tun kannst - wir sind alle Teil von #teamclimate.",
      fr: 
        "Que tu travailles à plein temps ou sur bénévolat ou que tu cherches simplement un premier projet dans lequel t'investir, on fait tous partie de la #teamclimate."
    },
    landing_page_photo_alt: {
      en: "Photo of earth from space at night with some connecting waypoints",
      de: "Foto der Erde aus dem Weltraum bei Nacht mit einigen verbindenden Wegpunkten",
      fr: "Photo de la terre vue de l'espace la nuit avec quelques points de connexion"
    },
    from_around_the_world: {
      en: "from around the world",
      de: "aus der ganzen Welt",
      fr: "du monde entier"
    },
    //html tag is break point for mobile. Should be roughly in the middle of the sentence
    landing_page_text: {
      en: (
        <>
          Join the global climate action network to connect all
          {!isNarrowScreen ? <br /> : " "}
          climate actors on our planet - the only one we have
        </>
      ),
      de: (
        <>
          Komm ins globale Klimaschutz-Netzwerk, das alle
          {!isNarrowScreen ? <br /> : " "}
          Klimaschutz-Akteure auf unserem Planeten verbindet
        </>
      ),
      fr: (
        <>
          Rejoins le réseau international pour rencontrer
          {!isNarrowScreen ? <br /> : " "}
          tous d'acteurs.ices de notre planéte - la seule qu'on ait
        </>
      )
    },
    explore: {
      en: "Explore",
      de: "Entdecken",
      fr: "Explorer"
    },
    explore_climate_projects: {
      en: "Explore climate projects",
      de: "Entdecke Klimaschutz-Projekte",
      fr: "Explorer les projets environnementaux"
    },
    find_a_climate_action_organization_and_get_involved: {
      en: "Find a climate action organization and get involved",
      de: "Finde eine Klimaschutzorganisation und bringe dich ein",
      fr: "Trouve une organisation environnementale et engage toi"
    },
    find_a_climate_action_organization_and_get_involved_text: {
      en: `Find nonprofits, associations, companies, institutes, NGOs, local governments and other
      types of organizations taking climate action!`,
      de: `Finde Non-Profit-Organisationen, Verbände, Unternehmen, Institute, Nicht-Regierungs-Organisationen, lokale Regierungen und
      andere Arten von Organisationen, die sich für den Klimaschutz einseten!`,
      fr: `Trouve les assos, instituts, entreprises et toutes celles et ceux qui agissent pour l'environnement`
    },
    find_a_climate_action_organization_and_get_involved_additional_text: {
      en: `You can directly contact the organization's representative to exchange knowledge,
      find volunteering opportunities or job opportunites.`,
      de: `Du kannst direkt den Repräsentanten der Organisation kontaktieren um Wissen auszutauschen und
      zu lernen, wie du dich einbringen kannst.`,
      fr: `Tu peux directement entrer en contact avec les reponsables des organisations pour échanger des connaissances ou t'engager.`
    },
    explore_all_organizations: {
      en: "Explore all organizations",
      de: "Entdecke alle Organisationen",
      fr: "Explorer toutes les organisations"
    },
    who_we_are: {
      en: "Who we are",
      de: "Wer wir sind",
      fr: "Qui on est"
    },
    find_out_more_about_our_team: {
      en: "Find out about our team",
      de: "Lerne unser Team kennen",
      fr: "En savoir plus à propos de l'équipe"
    },
    and_why_we_are_doing_what_we_are_doing: {
      en: "and why we are doing what we are doing",
      de: "und warum wir tun, was wir tun",
      fr: "et pourquoi on s'engage"
    },
    open_hand_offering_a_seedling_with_a_heart_instead_of_leaves: {
      en: "Open hand offering a seedling with a heart instead of leaves",
      de: "Offene Hand, die einen Setzling mit einem Herz anstelle von Blättern anbietet",
      fr: "Main ouverte offrant un semis avec un cœur à la place des feuilles"
    },
    our_mission: {
      en: "Our Mission",
      de: "Unsere Mission",
      fr: "Notre mission"
    },
    learn_about_our_goals_and_values: {
      en: "Learn about our goals and values",
      de: "Erfahre mehr über unsere Ziele und Werte",
      fr: "En savoir plus à propos de nos valeurs et objectifs"
    },
    and_what_we_want_to_achieve_with_creating_a_climate_community: {
      en: "and what we want to achieve with creating a climate community",
      de: "und was wir durch den Aufbau einer Klimaschutz Community erreichen wollen ",
      fr: "et ce qu'on cherche à accomplir en créant cette communauté"
    },
    five_people_positioned_around_a_globe_connected_through_lines: {
      en: "5 people positioned around a globe connected through lines",
      de: "5 Personen, die um einen Globus positioniert und durch Linien verbunden sind",
      fr: "5 personnes positionnées autour d'un globe et reliées par des lignes"
    },
    man_floating_in_the_air_with_a_lightbulb_a_book_a_pen_a_notebook_a_baloon_and_saturn_floating_around_him: {
      en:
        "Man floating in the air with a lightbulb, a book, a pen, a notebook, a baloon and Saturn floating around him",
      de:
        "Mann schwebt in der Luft mit einer Glühbirne, einem Buch, einem Stift, einem Notizbuch, einem Ballon und dem Saturn, der um ihn herum schwebt",
      fr: 
        "Homme flottant dans l'air avec une ampoule, un livre, un stylo, un cahier, un ballon et Saturne flottant autour de lui."
    },
    four_people_at_a_table_working_together_and_giving_each_other_a_high_five: {
      en: "Four people at a table working together and giving each other a high five",
      de: "Vier Personen an einem Tisch arbeiten zusammen und geben sich gegenseitig ein High Five",
      fr: "Quatre personnes autour d'une table travaillent ensemble et se félicitent mutuellement."
    },
    start_now_banner_text: {
      en: (
        <>
          <span className={classes?.yellow}>Work together</span>, feel inspired and make a real
          impact <span className={classes?.yellow}>on climate change!</span>
        </>
      ),
      de: (
        <>
          <span className={classes?.yellow}>Arbeite zusammen</span>, lass dich inspirieren und nimm
          echten Einfluss <span className={classes?.yellow}>auf den Klimawandel!</span>
        </>
      ),
      fr: (
        <>
          <span className={classes?.yellow}>Travaille avec d'autres,</span>, inspire toi et fait un vrai impact
           <span className={classes?.yellow}>contre le changement climatique!</span>
        </>
      )
    },
    climate_projects_with: {
      en: "climate projects",
      de: "Klimaprojekten",
      fr: "projects environnementaux"
    },
    learn_from: {
      en: "Learn from",
      de: "Lerne von",
      fr: "Apprends de"
    },
  };
}
