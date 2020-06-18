import React from "react";
import { Typography, Link } from "@material-ui/core";

export default function LoginNudge({ whatToSee }) {
  return (
    <div>
      <Typography>
        <Link underline="always" color="primary">
          Log in
        </Link>{" "}
        or{" "}
        <Link underline="always" color="primary">
          sign
        </Link>{" "}
        up to see {whatToSee}.
      </Typography>
    </div>
  );
}
