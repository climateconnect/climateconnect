import { makeStyles } from "@material-ui/core/styles";
import React from "react";

import ROLE_TYPES from "../../../public/data/role_types";
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
  availabilityOptions,
  blockClassName,
  handleRemoveMember,
  handleSetProjectData,
  projectData,
  rolesOptions,
}) {
  const classes = useStyles();

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
      <div className={classes.memberContainer}>
        {projectData.team_members.map((m, index) => {
          if (m) {
            return (
              <MiniProfileInput
                availabilityOptions={availabilityOptions}
                className={classes.member}
                creatorRole={rolesOptions.find((r) => r.role_type === ROLE_TYPES.all_type)}
                fullRolesOptions={rolesOptions}
                key={index}
                onChange={handleChangeMember}
                onDelete={m.role.role_type !== ROLE_TYPES.all_type && (() => handleRemoveMember(m))}
                profile={m}
                rolesOptions={rolesOptions}
              />
            );
          }
        })}
      </div>
    </div>
  );
}
