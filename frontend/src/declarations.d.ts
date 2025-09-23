declare module "*.svg" {
  import { ReactComponent as ReactSVG } from "react";
  const content: ReactSVG;
  export default content;
}

declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}
