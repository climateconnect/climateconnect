import { useEffect, useState } from "react";
import theme from "../../themes/theme";

export default function VisibleFooterHeight({ footerHeightProp }: any) {
  const [visibleFooterHeight, setVisibleFooterHeight] = useState(0);

  useEffect(() => {
    let ticking = false;
    const updateVisibleFooterHeight = () => {
      const scrollYInverted = document.body.offsetHeight - window.innerHeight - scrollY;
      const footerHeight = footerHeightProp ? footerHeightProp : theme.spacing(8);
      if (scrollYInverted > footerHeight) setVisibleFooterHeight(0);
      else if (scrollYInverted === footerHeight) setVisibleFooterHeight(footerHeight);
      else setVisibleFooterHeight(footerHeight - scrollYInverted);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateVisibleFooterHeight);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  });

  return visibleFooterHeight;
}
