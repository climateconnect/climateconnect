import { makeStyles } from "@material-ui/core";
import React from "react";
import { getImageUrl } from "../../../public/lib/imageOperations";
import OrganizationAvatar from "../organization/OrganizationAvatar";

const useStyles = makeStyles({
  projectOrIdeaImage: {
    height: 150,
  },
});

export default function ClimateMatchResultImage({ suggestion, className }) {
  const imageUrl = getImageUrl(
    suggestion.thumbnail_image ? suggestion.thumbnail_image : suggestion.image
  );
  const classes = useStyles();
  return (
    <div className={className}>
      {suggestion.ressource_type === "organization" ? (
        <OrganizationAvatar organization={suggestion} inlineVersionOnMobile />
      ) : (
        ["project", "idea"].includes(suggestion.ressource_type) && (
          <img src={imageUrl} className={classes.projectOrIdeaImage} />
        )
      )}
    </div>
  );
}
