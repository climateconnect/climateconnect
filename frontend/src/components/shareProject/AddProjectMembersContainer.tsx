import { Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import React, { useContext } from "react";
import ROLE_TYPES from "../../../public/data/role_types";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import MiniProfileInput from "../profile/MiniProfileInput";

const useStyles = makeStyles((theme) => {
  return {
    memberContainer: {
      display: "flex",
      flexWrap: "wrap",
    },
    member: {
      width: theme.spacing(40),
      textAlign: "center",
      marginRight: theme.spacing(4),
      marginTop: theme.spacing(2),
    },
    info: {
      textAlign: "center",
      fontWeight: "bold",
      marginBottom: theme.spacing(2),
    },
    infoIcon: {
      marginBottom: -6,
    },
  };
});

export default function AddProjectMembersContainer({
  projectData,
  blockClassName,
  handleRemoveMember,
  availabilityOptions,
  rolesOptions,
  handleSetProjectData,
}) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale: locale });

  const handleChangeMember = (m) => {
    handleSetProjectData({
      ...projectData,
      team_members: [
        ...projectData.team_members.map((t) => {
          if (t.url_slug === m.url_slug) return m;
          else return t;
        }),
      ],
    });
  };
  return (
    <div className={blockClassName}>
      <Typography className={classes.info}>
        <InfoOutlinedIcon className={classes.infoIcon} />{" "}
        {texts.use_the_search_bar_to_add_members_to_your_project}
      </Typography>
      <div className={classes.memberContainer}>
        {projectData.team_members.map((m, index) => {
          if (m)
            return (
              <MiniProfileInput
                key={index}
                className={classes.member}
                profile={m}
                onDelete={m.role.role_type !== ROLE_TYPES.all_type && (() => handleRemoveMember(m))}
                availabilityOptions={availabilityOptions}
                rolesOptions={rolesOptions}
                onChange={handleChangeMember}
                creatorRole={rolesOptions.find((r) => r.role_type === ROLE_TYPES.all_type)}
                fullRolesOptions={rolesOptions}
              />
            );
        })}
      </div>
    </div>
  );
}
