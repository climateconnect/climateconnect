import theme from "../../themes/theme";
import { useState, useEffect } from "react";

export default function BottomOfPageAboveFooter() {
  const [bottomAboveFooter, setBottomAboveFooter] = useState(0);

  useEffect(() => {
    let ticking = false;
    const updateBottom = () => {
      const scrollYInverted = document.body.offsetHeight - window.innerHeight - scrollY;
      const footerHeight = theme.spacing(8);
      if (scrollYInverted > footerHeight) setBottomAboveFooter(0);
      else if (scrollYInverted === footerHeight) setBottomAboveFooter(footerHeight);
      else setBottomAboveFooter(footerHeight - scrollYInverted);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateBottom);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  });

  return bottomAboveFooter;
}
