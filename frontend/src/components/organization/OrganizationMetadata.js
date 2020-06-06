import React from "react";
import { Box, Tooltip } from "@material-ui/core";
import PlaceIcon from "@material-ui/icons/Place";
import GroupIcon from "@material-ui/icons/Group";
import ExploreIcon from '@material-ui/icons/Explore';
import { makeStyles } from "@material-ui/core/styles";
import organization_types from "./../../../public/data/organization_types.json";
import organization_info_metadata from "../../../public/data/organization_info_metadata";

const useStyles = makeStyles(theme => {
  return {
    root: {
      textAlign: "left",
      paddingLeft: theme.spacing(3)
    },
    orgLogo: {
      height: "0.9rem",
      marginBottom: -2
    },
    cardIconBox: {
      width: 40,
      display: "inline-block",
      [theme.breakpoints.down("xs")]: {
        display: "none"
      }
    },
    cardIcon: {
      verticalAlign: "bottom",
      marginBottom: -2,
      marginTop: 2
    },
    textContent: {
      textOverflow: "hidden"
    }
  };
});

export default function OrganizationMetaData({ organization, showMembers, showOrganizationType }) {
  const classes = useStyles();
  const additionalInfo = organization.types.reduce((arr, type) => {
    const fullType = organization_types.organization_types.find(ot => ot.key===type)
    if(fullType.additionalInfo){
      fullType.additionalInfo.map(i => {
        arr.push({
          key: i,
          name: organization_info_metadata[i].name,
          value: organization.info[i],
          icon: organization_info_metadata[i].icon,
          iconName: organization_info_metadata[i].iconName
        })
      })
      return arr
    }
  }, [])
  return (
    <Box className={classes.root}>
      <Box className={classes.textContent}>
        <span className={classes.cardIconBox}>
          <Tooltip title="location">
            <PlaceIcon className={classes.cardIcon} />
          </Tooltip>
        </span>
        {organization.info.location}
      </Box>
      {showMembers && (
        <Box>
          <span className={classes.cardIconBox}>
          <Tooltip title="number of members">
            <GroupIcon className={classes.cardIcon} />
          </Tooltip>
          </span>
          <span className={classes.textContent}>{organization.members.length} members</span>
        </Box>
      )}
      {showOrganizationType && (
        <>
          <Box>
            <span className={classes.cardIconBox}>
              <Tooltip title="organization types">
                <ExploreIcon className={classes.cardIcon} />
              </Tooltip>
            </span>
            <span className={classes.textContent}>
              {organization.types.map((type, index) => {
                const fullType = organization_types.organization_types.find(ot => ot.key===type)
                return (
                  <React.Fragment key={index}>{fullType.name}{(index!==organization.types.length-1) && ", "}</React.Fragment>
                )
              })}
            </span>
          </Box>
          {additionalInfo.map((i, index) => {
            if(i.value)
              return(
                <Box key={index}>
                  <span className={classes.cardIconBox}>
                    <Tooltip title={i.name}>
                      <i.icon className={classes.cardIcon} />
                    </Tooltip>
                  </span>                
                  <span className={classes.textContent}>{i.value}</span>
                  
                </Box>
              )
          })}
        </>
      )}
    </Box>
  );
}
