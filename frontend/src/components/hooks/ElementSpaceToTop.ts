//global imports
import { useEffect, useState } from "react";

export default function ElementSpaceToTop({ el }) {
  const [top, setTop] = useState({
    page: null,
    screen: null,
    pageBottom: null,
    screenBottom: null,
  });

  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let ticking = false;

    const updateTopOfPage = () => {
      const scrollY = window.pageYOffset;
      if (el) {
        const rect = el.getBoundingClientRect();
        setTop({
          screen: rect.top,
          page: scrollY + rect.top,
          screenBottom: rect.bottom,
          pageBottom: rect.bottom + window.innerHeight,
        });
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateTopOfPage);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll);

    if (!initialized) {
      updateTopOfPage();
      setInitialized(true);
      ticking = true;
    }

    return () => window.removeEventListener("scroll", onScroll);
  });

  return top;
}
