//global imports
import { useEffect, useState } from "react";

export default function ElementOnScreen({ el, triggerIfUnderScreen }) {
  const [elementOnScreen, setElementOnScreen] = useState(
    isElementInViewport(el, triggerIfUnderScreen)
  );
  useEffect(() => {
    let ticking = false;

    const updateElementOnScreen = () => {
      setElementOnScreen(isElementInViewport(el, triggerIfUnderScreen));
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateElementOnScreen);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  });

  useEffect(() => {
    setElementOnScreen(isElementInViewport(el, triggerIfUnderScreen));
  }, el);

  return elementOnScreen;
}

const isElementInViewport = (el, triggerIfUnderScreen) => {
  if (!el) return false;
  const rect = el.getBoundingClientRect();
  return (
    (triggerIfUnderScreen || rect.top >= 0) &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) /* or $(window).height() */ &&
    rect.right <=
      (window.innerWidth || document.documentElement.clientWidth) /* or $(window).width() */
  );
};
