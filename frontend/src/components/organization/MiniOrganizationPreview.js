import { IconButton, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import CloseIcon from "@material-ui/icons/Close";
import React, { useContext } from "react";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import { getImageUrl } from "./../../../public/lib/imageOperations";

const useStyles = makeStyles((theme) => ({
  orgImage: {
    height: 35,
    marginRight: theme.spacing(1),
  },
  smallOrgImage: {
    height: 20,
  },
  orgName: {
    display: "inline-block",
  },
  wrapper: {
    display: "inline-flex",
    alignItems: "center",
  },
}));

export default function MiniOrganizationPreview({
  organization,
  className,
  size,
  onDelete,
  nolink,
}) {
  if (!nolink)
    return (
      <a className={className}>
        <Content organization={organization} size={size} onDelete={onDelete} />
      </a>
    );
  else
    return (
      <div className={className}>
        <Content organization={organization} size={size} onDelete={onDelete} />
      </div>
    );
}

function Content({ organization, size, onDelete }) {
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "organization", locale: locale, organization: organization });
  const classes = useStyles();
  return (
    <span className={classes.wrapper}>
      <img
        src={getImageUrl(organization.thumbnail_image)}
        className={`${classes.orgImage} ${size === "small" && classes.smallOrgImage}`}
        alt={texts.organizations_logo}
      />
      {size === "small" ? (
        <>{organization.name}</>
      ) : (
        <Typography variant="h5" className={classes.orgName}>
          {organization.name}
        </Typography>
      )}
      {onDelete && (
        <IconButton onClick={() => onDelete(organization)}>
          <CloseIcon />
        </IconButton>
      )}
    </span>
  );
}
