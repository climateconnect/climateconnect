//global imports
import { useEffect, useState } from "react";

export default function ElementSpaceToRight({ el }) {
  const [right, setRight] = useState(null);

  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let ticking = false;

    const updateRightOfPage = () => {
      if (el) {
        const rect = el.getBoundingClientRect();
        setRight(window.innerWidth - rect.right);
      }
      ticking = false;
    };

    const onResize = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateRightOfPage);
        ticking = true;
      }
    };

    window.addEventListener("resize", onResize);

    if (!initialized && el) {
      updateRightOfPage();
      setInitialized(true);
      ticking = true;
    }

    return () => window.removeEventListener("resize", onResize);
  });
  return right;
}
