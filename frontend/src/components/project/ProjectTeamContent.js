import React from "react";
import ProfilePreviews from "./../profile/ProfilePreviews";

function getAdditionalInfo(team) {
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
    return additionalInfo;
  });
}

export default function TeamContent({ team }) {
  return <ProfilePreviews profiles={team} allowMessage additionalInfo={getAdditionalInfo(team)} />;
}
