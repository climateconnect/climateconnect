//global imports
import { useState, useEffect } from "react";

export default function ElementOnScreen({ el }) {
  const [elementOnScreen, setElementOnScreen] = useState(isElementInViewport(el));

  useEffect(() => {
    let ticking = false;

    const updateElementOnScreen = () => {
      setElementOnScreen(isElementInViewport(el));
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

  return elementOnScreen;
}

const isElementInViewport = el => {
  if (!el) return false;
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) /* or $(window).height() */ &&
    rect.right <=
      (window.innerWidth || document.documentElement.clientWidth) /* or $(window).width() */
  );
};
