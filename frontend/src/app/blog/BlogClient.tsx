"use client";

import React from "react";
import dynamic from "next/dynamic";

// Dynamically import without SSR to avoid router issues
const WebflowPage = dynamic(() => import("../../components/webflow/WebflowPage"), {
  ssr: false,
});

interface BlogClientProps {
  bodyContent: string;
  headContent: string;
}

export default function BlogClient({ bodyContent, headContent }: BlogClientProps) {
  return <WebflowPage bodyContent={bodyContent} headContent={headContent} pageKey="blog" />;
}
