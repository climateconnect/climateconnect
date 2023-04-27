import { Link } from "@mui/material";
import React from "react";

export function getFoodHubDescription() {
  return {
    food_headline: {
      en: "Animal products are especially harmful to our climate",
      de: "Tierische Produkte sind besonders schädlich für unser Klima",
    },
    food_introduction: {
      en: `So what is causing the environmental footprint of food to be so large? By rule of thumb
      animal products usually cause more greenhouse gasses than plants. This is because
      additionally to keeping the animals you also need to grow plants to feed them. This
      results in much higher emissions than just eating the plants directly. Every day forests
      are cut down to grow animal feed and create new grazing land. Beef and dairy products are
      especially bad for the climate because cows produce large amounts of methane, a much more
      potent greenhouse gas than CO2.`,
      de: `Woran liegt es also, dass der ökologische Fußabdruck von Lebensmitteln so groß ist? Als Faustregel gilt, 
      dass tierische Produkte mehr Treibhausgase verursachen als pflanzliche. Das liegt daran, 
      dass zusätzlich zur Haltung der Tiere auch Pflanzen als Futtermittel für deren Ernährung angebaut werden müssen.
      Dies führt zu viel höheren Emissionen als der direkte Verzehr der Pflanzen. Jeden Tag werden Wälder abgeholzt, 
      um Tierfutter anzubauen und neues Weideland zu schaffen. Rindfleisch und Milchprodukte sind besonders schlecht für das Klima, 
      weil Kühe große Mengen an Methan produzieren, ein viel stärkeres Treibhausgas als CO2.`,
    },
    emissions_per_calories_chart_title: {
      en: "Greenhouse gas emissions per 1000 kilocalories",
      de: "Treibhausgasemissionen pro 1000 Kilokalorien",
    },
    vegan_most_climate_friendly: {
      en: "Vegan and vegetarian diets are most climate-friendly",
      de: "Vegane und vegetarische Ernährung ist am klimafreundlichsten",
    },
    vegan_most_climate_friendly_text: {
      en: (
        <>
          As countries became more wealthy their meat consumption also increased drastically. As
          seen in the graph below we can drastically lower the carbon footprint of food by eating a
          vegan or vegatarian diet. But even lowering meat and dairy products can have a great
          impact and at scale can be more effective than a few people going vegan. Currently a diet
          harmful to the climate is incentivized more than a climate friendly diet. According to{" "}
          <Link
            href="https://www.greenpeace.org/eu-unit/issues/nature-food/1803/feeding-problem-dangerous-intensification-animal-farming/"
            underline="hover"
          >
            research by Greenpeace
          </Link>{" "}
          the EU is currently spending around 71% of its farmland to feed livestock which is only
          possible because animal agriculture is subsidised with over € 28 billion per year.
        </>
      ),
      de: (
        <>
          Mit dem steigenden Wohlstand der Länder stieg auch ihr Fleischkonsum drastisch an. Wie
          unten in der Grafik zu sehen ist, können wir den CO2-Fußabdruck von Lebensmitteln stark
          reduzieren, indem wir uns vegan oder vegetarisch ernähren. Aber auch eine verringerter
          Konsum von Fleisch und Milchprodukten kann eine große Wirkung haben und im Großen und
          Ganzen effektiver sein, als wenn sich nur wenige Menschen komplett vegan ernähren. Derzeit
          wird eine klimaschädliche Ernährung mehr gefördert als eine klimafreundliche Ernährung.
          Laut{" "}
          <Link
            href="https://www.greenpeace.org/eu-unit/issues/nature-food/1803/feeding-problem-dangerous-intensification-animal-farming/"
            underline="hover"
          >
            Forschung von Greenpeace
          </Link>{" "}
          werden in der EU derzeit rund 71% der landwirtschaftlichen Nutzfläche für die Fütterung
          von Nutztieren verwendet, was nur durch Subventionen der Tierhaltung mit über 28 Mrd. €
          pro Jahr möglich ist.
        </>
      ),
    },
    avg_daily_co2_emissions_chart_title: {
      en: "Average daily CO2e-emissions of different diets",
      de: "Durchschnittliche tägliche CO2e-Emissionen verschiedener Diäten",
    },
    seasonal_more_important_than_local: {
      en: "Buying seasonal food has a bigger climate impact than buying local food",
      de:
        "Der Kauf von saisonalen Lebensmitteln hat einen größeren Einfluss auf das Klima als der Kauf von lokalen Lebensmitteln",
    },
    seasonal_more_important_than_local_text: {
      en: (
        <>
          Transport only accounts for 6% of the greenhouse gas emissions caused by food. In beef
          from beef herds it is only 0.5%! Buying local contributes to the local economy (which is
          great too) but considering the urgency of fixing our climate it is very important to focus
          on what actually makes a difference. It’s even sometimes more climate friendly to buy
          products from other countries, produced in acquaintance with the local climate, than in
          your country but using greenhouses. To illustrate this with some numbers:{" "}
          <Link
            href="https://www.sciencedirect.com/science/article/abs/pii/S0921800902002616"
            underline="hover"
          >
            a study{" "}
          </Link>{" "}
          from Sweden shows that tomatoes produced in local greenhouses in Sweden outside of the
          season use 10 times more energy as importing tomatoes from Southern europe where they were
          in-season. This is mainly because heating greenhouses uses a lot of energy.
        </>
      ),
      de: (
        <>
          Der Transport macht nur 6% der durch Lebensmittel verursachten Treibhausgasemissionen aus.
          Bei Rindfleisch aus Rinderherden sind es sogar nur 0,5%! Der Kauf von lokalen Produkten
          trägt zur lokalen Wirtschaft bei (was auch gut ist), aber angesichts der Dringlichkeit
          unser Klima zu verbessern, ist der Fokus sehr wichtig auf das, was tatsächlich einen
          Unterschied macht. Manchmal ist es sogar klimafreundlicher, Produkte aus anderen Ländern
          zu kaufen, die im Einklang mit dem lokalen Klima produziert werden, als in deinem Land, wo
          Gewächshäusern eingesetzt werden müsse. Um dies mit einigen Zahlen zu verdeutlichen:{" "}
          <Link
            href="https://www.sciencedirect.com/science/article/abs/pii/S0921800902002616"
            underline="hover"
          >
            eine Studie{" "}
          </Link>{" "}
          aus Schweden zeigt, dass Tomaten, die in lokalen Gewächshäusern in Schweden außerhalb der
          Saison produziert wurden, 10-mal mehr Energie verbrauchen als der Import von Tomaten aus
          Südeuropa während der Saison. Das liegt vor allem daran, dass das Beheizen von
          Gewächshäusern viel Energie verbraucht.
        </>
      ),
    },
    food_waste: {
      en: "Food waste is responsible for 23% of emissions caused by food",
      de:
        "Lebensmittelabfälle sind für 23% der durch Lebensmittel verursachten Emissionen verantwortlich",
    },
    foodwaste_chart_alt: {
      en:
        "Bar chart illustrating that food production is responsible for 26% of co2 emissions from which 6% food is never eaten",
      de:
        "Das Balkendiagramm veranschaulicht, dass die Lebensmittelproduktion für 26% der CO2-Emissionen verantwortlich ist, von denen jedoch 6% nie gegessen werden",
    },
    food_waste_text: {
      en: `Around 30% of all food is wasted. This accounts for 6% of total greenhouse gas emissions!
      Other than the enormous and pointless aspect of those emissions, it seems important to
      remind that, today, more than 800 million people are still suffering from
      undernourishment. But food wastes could no longer be a problem. As consumers it’s pretty
      easy to take individual action by looking after our food and avoiding losses. And we are
      not alone in this fight. Many public and private actors are already taking actions, by
      creating mobile apps to manage individual and private food waste, by giving the food you
      don’t need to those who do, or buying the unsolds from restaurants and supermarkets. If we
      collectively start pressing big actors so they change their practices, or bring effective
      concepts to fight food waste to our location, we will be able to greatly reduce these
      pointless losses.`,
      de: `Rund 30% aller Lebensmittel werden verschwendet. Dies ist für 6% der gesamten Treibhausgasemissionen verantwortlich!
      Abgesehen von dem enormen und sinnlosen Aspekt dieser Emissionen ist es wichtig daran zu erinnern,
      dass heutzutage immer noch mehr als 800 Millionen Menschen an
      Unterernährung leiden. Aber Lebensmittelabfälle könnten schon heute kein Problem mehr sein. Als Verbraucher ist es ziemlich
      einfach, selbst aktiv zu werden, indem wir auf unsere Lebensmittel achten und Verschwendung vermeiden. Und wir sind
      nicht allein in diesem Kampf. Viele öffentliche und private Akteure ergreifen bereits Maßnahmen, wie
      die Entwicklung mobiler Apps zur Verwaltung individueller und privater Lebensmittelabfälle, das Weitergeben von 
      nicht benötigten Lebensmitteln an Menschen, die sie gebrauchen können, oder das Aufkaufen von nicht verkauften Lebensmittel von Restaurants und Supermärkten. 
      Wenn wir kollektiv Druck auf die großen Akteure ausüben, damit sie ihre Praktiken ändern, oder effektive
      Konzepte zur Bekämpfung der Lebensmittelverschwendung an unseren Standort bringen, können wir diese
      sinnlosen Verluste stark reduzieren.`,
    },
    lab_grown_meat_could_be_a_game_changer: {
      en: "Lab-grown meat could be a game changer",
      de: "Im Labor gezüchtetes Fleisch könnte unser Leben verändern",
    },
    lab_grown_meat_could_be_a_game_changer_text: {
      en: (
        <>
          Additionally to improving our current ways of producing food there are also some
          innovative and potentially game-changing solutions that think out of the box. One example
          that could have a huge impact is lab-grown meat. Lab-grown meat is a real animal muscle
          being grown without having to grow the animal around it. While it sounds a bit weird at
          first producing it on large scale would allow us to stop wasting land and energy and
          forcing animals to grow up in horrible conditions while still being able to eat a product
          that is exactly the same as meat from an animal. Just recently the Singapore Food Acency
          was{" "}
          <Link
            href="https://www.theguardian.com/environment/2020/dec/02/no-kill-lab-grown-meat-to-go-on-sale-for-first-time"
            underline="hover"
          >
            the first authority to approve a lab-grown meat product as safe for market
          </Link>
          . While lab-grown meat will be much more expensive when it starts being sold (likely in
          2021) the price will rapidly decrease as larger amounts are produced and more competition
          enters the market. According to{" "}
          <Link
            href="https://edu.gcfglobal.org/en/thenow/what-is-labgrown-meat/1/"
            underline="hover"
          >
            GCFGlobal
          </Link>{" "}
          Lab grown meat is significantly more climate-friendly as it requires 45% less energy,
          99%(!) less land use, and produces 96% fewer greenhouse gas emissions.
        </>
      ),
      de: (
        <>
          Neben der Verbesserung unserer derzeitigen Methoden zur Lebensmittelproduktion gibt es
          auch einige innovative und potenziell bahnbrechende Lösungen, die über den Tellerrand
          hinausschauen. Ein Beispiel das einen großen Einfluss haben könnte, ist im Labor
          gezüchtetes Fleisch. Laborgezüchtetes Fleisch ist ein echter Tiermuskel, der gezüchtet
          wird, ohne dass das Tier um ihn herum wachsen muss. Auch wenn es zunächst ein wenig
          seltsam klingt, die Produktion in großem Maßstab würde es uns ermöglichen, die
          Verschwendung von Land und Energie und das Zwingen von Tieren, unter schrecklichen
          Bedingungen aufzuwachsen, zu beenden und wir können immer noch ein Produkt essen, das
          genau dasselbe wie Fleisch von einem Tier ist. Erst kürzlich war die Singapore Food Acency{" "}
          <Link
            href="https://www.theguardian.com/environment/2020/dec/02/no-kill-lab-grown-meat-to-go-on-sale-for-first-time"
            underline="hover"
          >
            die erste Behörde, die ein im Labor gezüchtetes Fleischprodukt als sicher für den Markt
            zugelassen hat
          </Link>
          . Während Fleisch aus dem Labor zu Beginn viel teurer sein wird (Verkaufsstart
          wahrscheinlich im Jahr 2021), wird der Preis schnell sinken, wenn größere Mengen
          produziert werden und mehr Konkurrenz auf den Markt kommt. Laut{" "}
          <Link
            href="https://edu.gcfglobal.org/en/thenow/what-is-labgrown-meat/1/"
            underline="hover"
          >
            GCFGlobal
          </Link>{" "}
          ist Fleisch aus dem Labor deutlich klimafreundlicher, da es 45% weniger Energie, 99%(!)
          weniger Landverbrauch benötigt und 96% weniger Treibhausgasemissionen produziert.
        </>
      ),
    },
    scalable_solutions_needed: {
      en: "We need scalable solution to reduce emissions from food in time",
      de:
        "Wir brauchen eine skalierbare Lösung, um Emissionen aus Lebensmitteln rechtzeitig zu reduzieren",
    },
    scalable_solutions_needed_text: {
      en: `Making changes in our personal life makes a difference but we {"don't"} have time to wait
      for a cultural change of behavior to happen. We need to get active beyond the scope of our
      personal lifes and support innovative climate solutions. On Climate Connect you can find
      climate solutions in the food sector that other climate actors are working on. If you find
      a solution that could also work in your location, contact the creator of the solution
      directly through Climate Connect and ask them what it would take for you to bring this
      solution to your location. Only by spreading the most effective solutions we have a chance
      to stay under 1.5 °C temperature change. If you find an impactful solution from your
      location, contact them to offer them your help or give them some valuable feedback through
      the comments.`,
      de: `Änderungen in unserem persönlichen Leben machen einen Unterschied, aber wir haben {"keine"} Zeit
      auf eine kulturelle Verhaltensänderung zu warten. Wir müssen über den Rahmen 
      unseres persönlichen Lebens hinaus aktiv werden und innovative Lösungen für das Klima unterstützen. 
      Auf Climate Connect findest du Klimalösungen im Lebensmittelbereich an denen andere Klimaakteure bereits arbeiten. 
      Wenn du eine Lösung findest, die auch bei dir vor Ort funktionieren können, kontaktiere einfach die Menschen hinter der Lösung
      direkt über Climate Connect und frage nach, was du tun kannst, um diese Lösung in deinen Ort zu bringen. Nur wenn wir die 
      effektivsten Lösungen gemeinsam verbreiten und umsetzen, haben wir eine Chance
      unter 1,5 °C Erderwärmung zu bleiben. Wenn du eine wirkungsvolle Lösung bei dir vor Ort findest, kontaktiere
      sie und biete deine Hilfe an oder gib wertvolles Feedback in den Kommentaren.`,
    },
    food_call_to_action: {
      en: `Let's work together on fixing our planet! Click on "Show solution" below!`,
      de: `Lass uns gemeinsam daran arbeiten, unseren Planeten zu reparieren! Klick unten auf "Lösung anzeigen"!`,
    },
    meat_lover: {
      en: "Meat lover",
      de: "Fleischliebend",
    },
    low_meat_diet: {
      en: "Low meat diet",
      de: "Fleischarme Ernährung",
    },
    vegetarian: {
      en: "Vegetarian",
      de: "Vegetarisch",
    },
    vegan: {
      en: "Vegan",
      de: "Vegan",
    },
    beef_from_beef_herd: {
      en: "Beef (beef herd)",
      de: "Rindfleisch (Rinderherde)",
    },
    beef_from_dairy_herd: {
      en: "Beef (dairy herd)",
      de: "Rindfleisch (Milchviehherde)",
    },
    fish_farmed: {
      en: "Fish (farmed)",
      de: "Fisch (gezüchtet)",
    },
    cheese: {
      en: "Cheese",
      de: "Käse",
    },
    pig_meat: {
      en: "Pig Meat",
      de: "Schweinefleisch",
    },
    eggs: {
      en: "Eggs",
      de: "Eier",
    },
    rice: {
      en: "Rice",
      de: "Reis",
    },
    oatmeal: {
      en: "Oatmeal",
      de: "Haferflocken",
    },
    potatoes: {
      en: "Potatoes",
      de: "Kartoffeln",
    },
    nuts: {
      en: "Nuts",
      de: "Nüsse",
    },
  };
}
