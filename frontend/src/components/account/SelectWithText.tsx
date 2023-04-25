import React from "react";
import makeStyles from "@mui/styles/makeStyles";
import InsertInvitationIcon from "@mui/icons-material/InsertInvitation";
import GroupIcon from "@mui/icons-material/Group";
import SubTitleWithContent from "../general/SubTitleWithContent";

const useStyles = makeStyles((theme) => ({
  headline: {
    textAlign: "center",
    marginTop: theme.spacing(4),
  },
  selectContainer: {
    display: "flex",
    flexDirection: "row",
    [theme.breakpoints.down("md")]: {
      flexDirection: "column",
    },
  },
  getInvolvedContainer: {
    display: "flex",
    flexDirection: "column",
    marginRight: theme.spacing(10),
    [theme.breakpoints.down("md")]: {
      marginRight: theme.spacing(0),
    },
  },
  sizeContainer: {
    display: "flex",
    flexDirection: "column",
    [theme.breakpoints.down("md")]: {
      marginRight: theme.spacing(0),
    },
  },
}));

export default function SelectWithText({ types, info }) {
  const classes = useStyles();

  const hideGetInvolvedField =
    types.map((type) => type.hide_get_involved).includes(true) || types.length === 0;

  const orgSizeValue = info.options.find((o) => o?.key === info.value?.organization_size)?.name;
  const orgSizeLabel = info?.organization_size?.name;

  const getInvolvedLabel = info?.get_involved.name;
  const getInvolvedValue = info?.value.get_involved;

  return (
    <div className={classes.selectContainer}>
      {!hideGetInvolvedField && getInvolvedValue && (
        <div className={classes.getInvolvedContainer}>
          <SubTitleWithContent
            subTitleIcon={{ icon: InsertInvitationIcon }}
            subtitle={getInvolvedLabel}
            content={getInvolvedValue}
          />
        </div>
      )}

      {orgSizeValue && (
        <div className={classes.sizeContainer}>
          <SubTitleWithContent
            subTitleIcon={{ icon: GroupIcon }}
            subtitle={orgSizeLabel}
            content={orgSizeValue}
          />
        </div>
      )}
    </div>
  );
}
