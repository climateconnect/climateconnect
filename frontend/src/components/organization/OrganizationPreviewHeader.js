import React from "react";
import { Avatar, Box, Chip, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { getImageUrl } from "../../../public/lib/imageOperations";

const useStyles = makeStyles((theme) => {
  return {
    header: {
      fontWeight: "bold",
      margin: "5px",
    },
    media: {
      height: 80,
      width: 80,
      backgroundSize: "contain",
      marginTop: theme.spacing(3),
      margin: "0 auto",
    },
    chip: {
      height: 20,
      position: "relative",
      margin: "0px 1px",
    },
    chipGroup: {
      marginTop: "-15px",
    },
  };
});

export default function OrganizationPreviewHeader({ organization }) {
  const classes = useStyles();

  return (
    <div>
      <Avatar
        alt={organization.name}
        size="large"
        src={getImageUrl(organization.thumbnail_image)}
        className={classes.media}
        component="div"
      />
      {organization.types?.length > 0 && (
        <Box className={classes.chipGroup}>
          {organization.types.map((type, id) => (
            <Chip
              key={type.key + id}
              className={classes.chip}
              label={type.name}
              size="small"
              color="primary"
            />
          ))}
        </Box>
      )}
      <Box>
        <Typography variant="h6" component="h2" className={classes.header}>
          {organization.name}
        </Typography>
      </Box>
    </div>
  );
}
