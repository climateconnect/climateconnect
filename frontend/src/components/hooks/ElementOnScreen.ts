//global imports
import { useEffect, useState } from "react";

//returns true if the el is currently visible on screen
//@el: ref of the element
//@triggerIfUnderScreen: should the hook return true, if the el is under the current scroll position
export default function ElementOnScreen({
  el,
  triggerIfUnderScreen,
  minSpaceFromBottom = 0,
}: {
  el;
  triggerIfUnderScreen?: boolean;
  minSpaceFromBottom?: number;
}) {
  const [elementOnScreen, setElementOnScreen] = useState(
    isElementInViewport(el, triggerIfUnderScreen, minSpaceFromBottom)
  );
  useEffect(() => {
    let ticking = false;

    const updateElementOnScreen = () => {
      setElementOnScreen(isElementInViewport(el, triggerIfUnderScreen, minSpaceFromBottom));
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
    setElementOnScreen(isElementInViewport(el, triggerIfUnderScreen, minSpaceFromBottom));
  }, el);

  return elementOnScreen;
}

const isElementInViewport = (el, triggerIfUnderScreen, minSpaceFromBottom) => {
  if (!el) return false;
  const rect = el.getBoundingClientRect();
  return ((triggerIfUnderScreen || rect.top >= 0) &&
  rect.left >= 0 &&
  rect.bottom <=
    (window.innerHeight || document.documentElement.clientHeight) -
      minSpaceFromBottom /* or $(window).height() */ && rect.right <=
    (window.innerWidth || document.documentElement.clientWidth)) /* or $(window).width() */;
};
