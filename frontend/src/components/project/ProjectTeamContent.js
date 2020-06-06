import React from "react";
import ProfilePreviews from "./../profile/ProfilePreviews";

function getTeamWithAdditionalInfo(team) {
  return team.map(m => {
    const additionalInfo = [];
    if (m.role)
      additionalInfo.push({
        text: m.role,
        importance: "high"
      });
    if (m.timeperweek)
      additionalInfo.push({
        text: m.timeperweek + (m.timeperweek > 1 ? " hours" : " hour") + " per week",
        importance: "low"
      });
    return { ...m, additionalInfo: additionalInfo };
  });
}

export default function TeamContent({ team }) {
  return (
    <ProfilePreviews
      profiles={getTeamWithAdditionalInfo(team)}
      allowMessage
      showAdditionalInfo={true}
    />
  );
}
