import { Typography } from "@mui/material";
import React, { useContext } from "react";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";

export default function ProjectDescriptionHelp({ status }) {
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale: locale });
  const bulletPoints = [
    {
      Idea: texts.what_is_the_climate_impact_of_the_idea,
      "In Progress": texts.what_is_the_climate_impact_of_the_idea,
      Cancelled: texts.what_would_the_climate_impact_of_the_project_have_been,
      "Successfully Finished": texts.what_was_or_is_the_climate_impact_of_the_project,
      Recurring: texts.what_is_the_climate_impact_of_the_idea,
    },
    {
      Idea: texts.what_are_you_trying_to_achieve,
      "In Progress": texts.what_are_you_trying_to_achieve,
      Cancelled: texts.what_were_you_trying_to_achieve,
      "Successfully Finished": texts.what_did_you_achieve,
      Recurring: texts.what_are_you_achieving,
    },
    {
      Idea: texts.how_are_you_going_to_try_to_achieve_it,
      "In Progress": texts.how_are_you_trying_to_achieve_it,
      Cancelled: texts.how_did_you_try_to_achieve_it,
      "Successfully Finished": texts.how_did_you_make_your_project_a_success,
      Recurring: texts.how_are_you_achieving_it,
    },
    {
      Idea: texts.what_are_going_to_be_the_biggest_challenges,
      "In Progress": texts.what_are_the_biggest_challenges,
      Cancelled: texts.what_were_the_biggest_challenges,
      "Successfully Finished": texts.what_were_the_biggest_challenges,
      Recurring: texts.what_are_the_biggest_challenges,
    },
    {
      "In Progress": texts.which_insights_have_you_gained_so_far,
      Cancelled: texts.which_insights_did_you_gain,
      "Successfully Finished": texts.which_insights_did_you_gain_during_the_implementation,
      Recurring: texts.which_insights_have_you_gained_so_far,
    },
    {
      Idea: texts.could_this_project_be_replicated_somewhere_else,
      "In Progress": texts.could_this_project_be_replicated_somewhere_else,
      Cancelled: texts.what_would_you_have_needed_to_make_this_project_a_sucess,
      "Successfully Finished": texts.how_can_this_project_be_replicated_by_other_climate_protectors,
      Recurring: texts.could_this_project_be_replicated_somewhere_else,
    },
  ];
  return (
    <>
      <Typography>
        {texts.please_touch_on_the_following_points_in_your_project_description}:
      </Typography>
      <ul>
        {bulletPoints.map((p, index) => (
          <li key={index}>{p[status.name] ? p[status.name] : p["In Progress"]}</li>
        ))}
      </ul>
      <Typography>{texts.if_you_want_to_include_a_video_in_your_project_description}</Typography>
    </>
  );
}
