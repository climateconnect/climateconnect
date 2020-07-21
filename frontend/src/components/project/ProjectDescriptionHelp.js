import React from "react";
import { Typography } from "@material-ui/core";

export default function ProjectDescriptionHelp({ status }) {
  const bulletPoints = [
    {
      Idea: "What is the climate impact of the idea?",
      "In Progress": "What is the climate impact of the project?",
      Cancelled: "What would the climate impact of the project have been?",
      "Successfully Finished": "What was/is the climate impact of the project?",
      Recurring: "What is the climate impact of the project?"
    },
    {
      Idea: "What are you trying to achieve?",
      "In Progress": "What are you trying to achieve?",
      Cancelled: "What were you trying to achieve?",
      "Successfully Finished": "What did you achieve?",
      Recurring: "What are you achieving?"
    },
    {
      Idea: "How are you going to try to achieve it?",
      "In Progress": "How are you trying to achieve it?",
      Cancelled: "How did you try to achieve it?",
      "Successfully Finished": "How did you make your project a success?",
      Recurring: "How are you achieving it?"
    },
    {
      Idea: "What are going to be the biggest challenges?",
      "In Progress": "What are the biggest challenges?",
      Cancelled: "What were the biggest challenges?",
      "Successfully Finished": "What were the biggest challenges?",
      Recurring: "What are the biggest challenges?"
    },
    {
      "In Progress": "What insights have you gained so far?",
      Cancelled: "What insights did you gain?",
      "Successfully Finished": "What insights did you gain during the implementation?",
      Recurring: "What insights have you gained so far?"
    },
    {
      Idea: "Could this project be replicated?",
      "In Progress": "Could this project be replicated?",
      Cancelled: "What would you have needed to make this project a sucess?",
      "Successfully Finished": "How can this project be replicated by other climate protectors?",
      Recurring: "Could this project be replicated?"
    }
  ];
  console.log(status.name);
  return (
    <>
      <Typography>Please touch on the following points in your project description:</Typography>
      <ul>
        {bulletPoints.map((p, index) => (
          <li key={index}>{p[status.name] ? p[status.name] : p["In Progress"]}</li>
        ))}
      </ul>
    </>
  );
}
