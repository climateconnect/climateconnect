//global imports
import { useState, useEffect } from "react";

export default function BottomOfPage({ initBottomOfPage, marginToTrigger }) {
  const [bottomOfPage, setBottomOfPage] = useState(initBottomOfPage);

  useEffect(() => {
    let ticking = false;

    const updateBottomOfPage = () => {
      const scrollY = window.pageYOffset;
      const triggerMargin = marginToTrigger ? marginToTrigger : 0;
      setBottomOfPage(
        parseInt(window.innerHeight) + parseInt(scrollY) + parseInt(triggerMargin) >=
          document.body.offsetHeight
      );
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateBottomOfPage);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, [initBottomOfPage]);

  return bottomOfPage;
}
