import { Avatar } from "@material-ui/core";
import React from "react";
import { getImageUrl } from "../../../public/lib/imageOperations";

export default function UserImage({ user }) {
  console.log(user);
  return (
    <Avatar
      alt={user?.first_name + " " + user?.last_name + "'s picture"}
      component="div"
      src={getImageUrl(user?.image)}
    />
  );
}
