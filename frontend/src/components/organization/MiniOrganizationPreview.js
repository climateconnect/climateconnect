import { IconButton, Link, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import CloseIcon from "@material-ui/icons/Close";
import React, { useContext } from "react";
import { getLocalePrefix } from "../../../public/lib/apiOperations";
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
    wordBreak: "break-word"
  },
  wrapper: {
    display: "inline-flex",
    alignItems: "center",
  },
  mediumOrgName: {
    fontSize: 16,
    wordBreak: "break-word"
  },
  mediumOrgImage: {
    height: 30,
  },
}));

export default function MiniOrganizationPreview({
  organization,
  className,
  size,
  onDelete,
  nolink,
}) {
  const { locale } = useContext(UserContext);
  if (!nolink)
    return (
      <Link
        className={className}
        color="inherit"
        href={getLocalePrefix(locale) + "/organizations/" + organization.url_slug}
        target="_blank"
      >
        <Content organization={organization} size={size} onDelete={onDelete} />
      </Link>
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
        className={`${classes.orgImage} ${size === "small" && classes.smallOrgImage} ${
          size === "medium" && classes.mediumOrgImage
        }`}
        alt={texts.organizations_logo}
      />
      {size === "small" ? (
        <>{organization.name}</>
      ) : size === "medium" ? (
        <Typography className={classes.mediumOrgName}>{organization.name}</Typography>
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
