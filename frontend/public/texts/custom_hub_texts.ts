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
      "PRIO1 Hub ist integriert in die deutschlandweite Climate Connect Plattform. Um Teil des PRIO1 Hubs zu werden melde dich einfach hier an und schon bist du dabei!",
  },
};
// TODO: make generic these texts, because they are the same for PRIO1 and Perth
const perth_texts = {
  here_you_can_create_your_personal_account: {
    en: "Create your personal Climate Connect account here to join the Perth and Kinross Hub.",
    de: "Erstelle hier deinen persönlichen Climate Connect Account, um dem Perth und Kinross Hub beizuteten.",
  },
  // overwrite/delete the default text
  you_will_have_an_opportunity_to_create_or_add_an_organization_once_signed_up: {
    en: "",
    de: "",
  },
  auth_image_subtitle: {
    en:
      "Perth and Kinross Hub is integrated into the Germany-wide Climate Connect platform. To become part of the PRIO1 Hub, simply register here and you're in!",
    de:
      "Perth und Kinross Hub ist integriert in die deutschlandweite Climate Connect Plattform. Um Teil des PRIO1 Hubs zu werden melde dich einfach hier an und schon bist du dabei!",
  },
};

const custom_hub_texts = {
  prio1: prio1_texts,
  perth: perth_texts, // Perth uses the same texts as Prio1
};

export default custom_hub_texts;
