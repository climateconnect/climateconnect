import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res
    .status(200)
    .json({ sha: process.env.BUILD_SHA ?? "dev", built_at: process.env.BUILD_TIMESTAMP ?? null });
}
