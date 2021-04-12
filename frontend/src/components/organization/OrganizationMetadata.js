import { Box, Tooltip, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ExploreIcon from "@material-ui/icons/Explore";
import PlaceIcon from "@material-ui/icons/Place";
import React from "react";
import getOrganizationInfoMetadata from "../../../public/data/organization_info_metadata";

const useStyles = makeStyles((theme) => {
  return {
    root: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      textAlign: "left",
    },
    orgLogo: {
      height: "0.9rem",
      marginBottom: -2,
    },
    cardIconBox: {
      width: 40,
      flex: "0 0 40px",
      display: "inline-block",
      [theme.breakpoints.down("xs")]: {
        display: "none",
      },
    },
    infoLink: {
      display: "flex",
      marginBottom: theme.spacing(0.5),
    },
    textContent: {
      fontSize: 14,
      whiteSpace: "normal",
    },
  };
});

export default function OrganizationMetaData({ organization, showOrganizationType }) {
  const classes = useStyles();
  const organization_info_metadata = getOrganizationInfoMetadata();
  const additionalInfo = organization.types.reduce((arr, type) => {
    if (type.additional_info) {
      type.additional_info.map((i) => {
        arr.push({
          key: i,
          name: organization_info_metadata[i].name,
          value: organization.info[i],
          icon: organization_info_metadata[i].icon,
          iconName: organization_info_metadata[i].iconName,
        });
      });
    }
    return arr;
  }, []);
  return (
    <Box className={classes.root}>
      <div className={classes.infoLinks}>
        <Box className={classes.infoLink}>
          <span className={classes.cardIconBox}>
            <Tooltip title="location">
              <PlaceIcon className={classes.cardIcon} />
            </Tooltip>
          </span>
          <div>
            <Typography className={classes.textContent}>{organization.info.location}</Typography>
          </div>
        </Box>
        {showOrganizationType && (
          <>
            <Box className={classes.infoLink}>
              <span className={classes.cardIconBox}>
                <Tooltip title="organization types">
                  <ExploreIcon className={classes.cardIcon} />
                </Tooltip>
              </span>
              <span className={classes.textContent}>
                {organization.types.map((type, index) => {
                  return (
                    <React.Fragment key={type.id}>
                      {type.name}
                      {index !== organization.types.length - 1 && ", "}
                    </React.Fragment>
                  );
                })}
              </span>
            </Box>
            {additionalInfo.map((i, index) => {
              if (i.value)
                return (
                  <Box key={index}>
                    <span className={classes.cardIconBox}>
                      <Tooltip title={i.name}>
                        <i.icon className={classes.cardIcon} />
                      </Tooltip>
                    </span>
                    <Typography className={classes.textContent}>{i.value}</Typography>
                  </Box>
                );
            })}
          </>
        )}
      </div>
    </Box>
  );
}
