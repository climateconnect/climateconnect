import * as React from "react";
import { EASING_FUNCTIONS } from "../utils";
import { Props } from "./Basic";
export declare const TabsWrapper: React.ForwardRefExoticComponent<
  import("./Basic").ElementProps<"div"> & {
    current: string;
    easing: keyof typeof EASING_FUNCTIONS;
    fadeIn: number;
    fadeOut: number;
    children?:
      | React.ReactElement<
          TabsMenuProps | TabsContentProps,
          string | React.JSXElementConstructor<any>
        >
      | React.ReactElement<
          TabsMenuProps | TabsContentProps,
          string | React.JSXElementConstructor<any>
        >[]
      | undefined;
  } & {
    children?: React.ReactNode;
  } & React.RefAttributes<HTMLDivElement>
>;
type TabsMenuProps = {
  tag?: React.ElementType;
  className?: string;
  children?: React.ReactElement<TabsLinkProps>[];
};
export declare const TabsMenu: React.ForwardRefExoticComponent<
  TabsMenuProps & React.RefAttributes<unknown>
>;
type TabsLinkProps = Props<
  "a",
  {
    "data-w-tab": string;
  }
>;
export declare const TabsLink: React.ForwardRefExoticComponent<
  import("./Basic").ElementProps<"a"> & {
    "data-w-tab": string;
  } & {
    children?: React.ReactNode;
  } & React.RefAttributes<HTMLAnchorElement>
>;
type TabsContentProps = {
  tag?: React.ElementType;
  className?: string;
  children?:
    | React.ReactElement<TabsPaneProps>[]
    | React.ReactElement<TabsPaneProps>;
};
export declare const TabsContent: React.ForwardRefExoticComponent<
  TabsContentProps & React.RefAttributes<unknown>
>;
type TabsPaneProps = React.PropsWithChildren<{
  tag?: React.ElementType;
  className?: string;
  "data-w-tab": string;
}>;
export declare const TabsPane: React.ForwardRefExoticComponent<
  {
    tag?: React.ElementType<any, keyof React.JSX.IntrinsicElements> | undefined;
    className?: string | undefined;
    "data-w-tab": string;
  } & {
    children?: React.ReactNode;
  } & React.RefAttributes<unknown>
>;
export {};
