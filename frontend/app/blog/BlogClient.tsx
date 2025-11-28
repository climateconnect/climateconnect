"use client";

import React from "react";
import WebflowPage from "../../src/components/webflow/WebflowPage";

interface BlogClientProps {
  bodyContent: string;
  headContent: string;
}

export default function BlogClient({ bodyContent, headContent }: BlogClientProps) {
  return <WebflowPage bodyContent={bodyContent} headContent={headContent} pageKey="blog" />;
}
