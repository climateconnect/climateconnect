import React from "react";
import InfiniteScroll from "react-infinite-scroller";
import { Grid, GridProps } from "@mui/material";

// hack to fix the types of InfiniteScroll for containing a Grid.
declare class _InfiniteScrollGrid extends React.Component<
  Omit<InfiniteScroll["props"], "element"> & { element: typeof Grid; component: string } & GridProps
> {}

export default (InfiniteScroll as any) as typeof _InfiniteScrollGrid;
