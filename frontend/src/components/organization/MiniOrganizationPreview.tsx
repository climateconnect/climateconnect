import { Avatar, IconButton, Link, Theme, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import CloseIcon from "@mui/icons-material/Close";
import React, { useContext } from "react";
import { getLocalePrefix } from "../../../public/lib/apiOperations";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import { getImageUrl } from "./../../../public/lib/imageOperations";
import Truncate from "react-truncate";

const useStyles = makeStyles<Theme, { showBorder: boolean }>((theme) => ({
  orgName: {
    display: "inline-block",
    wordBreak: "break-word",
  },
  smallAvatar: (props) => ({
    height: 20,
    width: 20,
    border: props.showBorder ? "0.5px solid gray" : undefined,
  }),
  mediumAvatar: (props) => ({
    height: 30,
    width: 30,
    border: props.showBorder ? "0.5px solid gray" : undefined,
  }),
  avatarWrapper: {
    display: "inline-block",
    verticalAlign: "middle",
    marginRight: theme.spacing(1),
    wordBreak: "break-word",
  },
  wrapper: {
    display: "flex",
    alignItems: "center",
  },
  mediumOrgName: {
    fontSize: 16,
    wordBreak: "break-word",
  },
  inlineWrapper: {
    display: "inline-block",
  },
  boldOrgName: {
    fontSize: 18,
    fontWeight: 600,
    display: "inline-block",
  },
}));

export default function MiniOrganizationPreview({
  organization,
  className,
  size,
  onDelete,
  nolink,
  doNotShowName,
  inline,
}: any) {
  const { locale } = useContext(UserContext);
  if (!nolink)
    return (
      <Link
        className={className}
        color="inherit"
        href={getLocalePrefix(locale) + "/organizations/" + organization.url_slug}
        target="_blank"
        underline="hover"
      >
        <Content
          organization={organization}
          size={size}
          onDelete={onDelete}
          doNotShowName={doNotShowName}
          inline={inline}
        />
      </Link>
    );
  else
    return (
      <div className={className}>
        <Content
          organization={organization}
          size={size}
          onDelete={onDelete}
          doNotShowName={doNotShowName}
          inline={inline}
        />
      </div>
    );
}

function Content({ organization, size, onDelete, doNotShowName, inline }) {
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "organization", locale: locale, organization: organization });
  const classes = useStyles({ showBorder: doNotShowName });
  const avatarProps = {
    alt: texts.organizations_logo,
    src: getImageUrl(organization.thumbnail_image),
    className: `${(size === "tiny" || size === "small") && classes.smallAvatar} ${
      size === "medium" && classes.mediumAvatar
    }`,
  };
  return (
    <div className={inline ? classes.inlineWrapper : classes.wrapper}>
      <div className={classes.avatarWrapper}>
        <Avatar {...avatarProps} />
      </div>
      {!doNotShowName && (
        <>
          {size === "tiny" || size === "small" ? (
            <Typography className={size === "small" ? classes.boldOrgName : ""}>
              {organization.name}
            </Typography>
          ) : size === "medium" ? (
            <Typography className={classes.mediumOrgName}>{organization.name}</Typography>
          ) : (
            <Typography variant="h5" className={classes.orgName}>
              {organization.name}
            </Typography>
          )}
          {onDelete && (
            <IconButton onClick={() => onDelete(organization)} size="large">
              <CloseIcon />
            </IconButton>
          )}
        </>
      )}
    </div>
  );
}
