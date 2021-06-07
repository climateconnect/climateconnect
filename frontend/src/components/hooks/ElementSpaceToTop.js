//global imports
import { useEffect, useState } from "react";

export default function ElementSpaceToTop({ el }) {
  const [top, setTop] = useState({
    page: null,
    screen: null,
  });

  useEffect(() => {
    let ticking = false;

    const updateTopOfPage = () => {
      const scrollY = window.pageYOffset;
      if (el) {
        const rect = el.getBoundingClientRect();
        setTop({
          screen: rect.top,
          page: scrollY + rect.top,
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

    return () => window.removeEventListener("scroll", onScroll);
  });

  return top;
}
