import { useState, useEffect } from "react";

//@el: ref of an element
//returns an object containing width and height of the referenced element and its top/left position within its container
export default function useElementProps({ el }) {
  const [props, setProps] = useState({
    height: 0,
    width: 0,
    top: 0,
    left: 0,
  });

  useEffect(() => {
    setProps({
      height: el.current.clientHeight,
      width: el.current.clientWidth,
      top: el.current.clientTop,
      left: el.current.clientLeft,
    });
  }, []);

  return props;
}
