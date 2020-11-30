//global imports
import {useState, useEffect } from "react";

export default function TopOfPage ({
  initTopOfPage
}) {
  const [topOfPage, setTopOfPage] = useState(initTopOfPage);

  useEffect(() => {
    let ticking = false;

    const updateTopOfPage = () => {
      const scrollY = window.pageYOffset;
      setTopOfPage(scrollY === 0.0);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateTopOfPage);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll)

    return () => window.removeEventListener("scroll", onScroll);
  }, [initTopOfPage]);

  return topOfPage;
};
