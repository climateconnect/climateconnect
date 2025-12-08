const prio1_texts = {
  here_you_can_create_your_personal_account: {
    en: "Create your personal Climate Connect account here to join the PRIO1 Hub.",
    de: "Erstelle hier deinen persönlichen Climate Connect Account, um dem PRIO1 Hub beizuteten.",
  },
  // overwrite/delete the default text
  you_will_have_an_opportunity_to_create_or_add_an_organization_once_signed_up: {
    en: "",
    de: "",
  },
  auth_image_subtitle: {
    en:
      "PRIO1 Hub is integrated into the Germany-wide Climate Connect platform. To become part of the PRIO1 Hub, simply register here and you're in!",
    de:
      "PRIO1 Hub ist integriert in die deutschlandweite Climate Connect Plattform. Um Teil des PRIO1 Hubs zu werden, melde dich einfach hier an und schon bist du dabei!",
  },
};
// TODO: make generic these texts, because they are the same for PRIO1 and Perth
const perth_texts = {
  here_you_can_create_your_personal_account: {
    en: "Create your personal Climate Connect account here to join the Perth and Kinross Hub.",
    de:
      "Erstelle hier deinen persönlichen Climate Connect Account, um dem Perth und Kinross Hub beizuteten.",
  },
  // overwrite/delete the default text
  you_will_have_an_opportunity_to_create_or_add_an_organization_once_signed_up: {
    en: "",
    de: "",
  },
  auth_image_subtitle: {
    en:
      "Perth and Kinross Hub is integrated into the global Climate Connect platform. To become part of the Perth and Kinross Hub, simply register here and you're in!",
    de:
      "Der Perth und Kinross Hub ist integriert in die global Climate Connect Plattform. Um Teil des Perth and Kinross Hubs zu werden, melde dich einfach hier an und schon bist du dabei!",
  },
  // hubUrl
  perth_welcometext: {
    en: "",
    de: "",
  },
  //subHub
  nature_welcometext: {
    en: `Supported by Perth and Kinross Countryside Trust, the Nature Connections partnership was established in 2021. This broad network reaches right across the region, connecting communities caring for and restoring nature. 
      Thanks to Nature Connections Partnership Perth & Kinross for leading community connections on nature, across Perthshire since 2021 and now Kinross-shire too.`,
    de: `Unterstützt vom Perth und Kinross Countryside Trust wurde die Nature Connections Partnerschaft im Jahr 2021 gegründet. Dieses breite Netzwerk erstreckt sich über die gesamte Region und verbindet Gemeinschaften, die sich um die Natur kümmern und sie wiederherstellen.
      Danke an die Nature Connections Partnership Perth & Kinross für die Leitung der Gemeinschaftsverbindungen zur Natur in Perthshire seit 2021 und jetzt auch in Kinross-shire.`,
  },
  //subHub
  climatecafe_welcometext: {
    en: `Climate Café®: Supported by the global Climate Café® Network team, the Perth & Kinross network has been growing since 2015 with community led Climate Café® spaces to ‘drink, chat and act’ across the region.
      Climate Café® connects the Climate Café® Network across Perth & Kinross.`,
    de: `Unterstützt vom globalen Climate Café® Network Team wächst das Perth & Kinross Netzwerk seit 2015 mit gemeinschaftsgeführten Climate Café®-Räumen, um in der Region 'zu trinken, zu plaudern und zu handeln'.
      Climate Café® verbindet das Climate Café® Network in Perth & Kinross.`,
  },
  //subHub
  zerowaste_welcometext: {
    en: `Supported by Remake Scotland, the zero waste network connects those who are involved in repair, reuse, recycling and sharing projects across Perth & Kinross communities, in collaboration with Perth & Kinross Council.
      Thanks to Remake Scotland for coordinating this network.`,
    de: `Unterstützt von Remake Scotland verbindet das Zero-Waste-Netzwerk diejenigen, die an Reparatur-, Wiederverwendungs-, Recycling- und Sharing-Projekten in den Gemeinden von Perth & Kinross beteiligt sind, in Zusammenarbeit mit dem Perth & Kinross Council.
      Danke an Remake Scotland für die Koordination dieses Netzwerks.`,
  },
  //subHub
  transport_welcometext: {
    en:
      "Supported by Glenfarg Community Transport, this network connects those involved in active travel, community transport and sustainable transport projects across communities.",
    de:
      "Unterstützt von Glenfarg Community Transport verbindet dieses Netzwerk diejenigen, die an Projekten für aktives Reisen, Gemeinschaftstransport und nachhaltigen Transport in den Gemeinden beteiligt sind.",
  },
  //subHub
  energy_welcometext: {
    en: `Supported by The HEAT Project Scotland, this network – Our Energy Community – connects those involved in energy efficiency, renewables and community energy projects across the region.
        Thanks to The Heat Project Scotland for coordinating across this network.`,
    de: `Unterstützt von The HEAT Project Scotland verbindet dieses Netzwerk – Our Energy Community – diejenigen, die an Energieeffizienz-, erneuerbaren Energie- und Gemeinschaftsenergieprojekten in der Region beteiligt sind.
        Danke an The Heat Project Scotland für die Koordination dieses Netzwerks.`,
  },
  //subHub
  food_welcometext: {
    en: `Supported by Giraffe, this network builds on years of collaboration for a good food nation. It brings together a wide spectrum of those involved in producing, processing, delivering, cooking, sharing food and reducing food waste. 
      To get involved and join the network updates, contact: food@climateconnect.scot`,
    de: `Unterstützt von Giraffe baut dieses Netzwerk auf jahrelanger Zusammenarbeit für eine gute Lebensmittelversorgung auf. Es bringt ein breites Spektrum von Menschen zusammen, die an der Produktion, Verarbeitung, Lieferung, Zubereitung, dem Teilen von Lebensmitteln und der Reduzierung von Lebensmittelverschwendung beteiligt sind.
      Um Dich zu beteiligen und Updates zum Netzwerk zu erhalten, kontaktiere food@climateconnect.scot`,
  },
};

const custom_hub_texts = {
  prio1: prio1_texts,
  perth: perth_texts, // Perth uses the same texts as Prio1
};

export default custom_hub_texts;
