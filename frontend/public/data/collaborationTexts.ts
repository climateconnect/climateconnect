export default function getCollaborationTexts(texts) {
  return {
    allow: {
      project: texts.allow_collaboration_on_your_project,
      idea: texts.are_you_looking_for_more_people_to_help_implement_the_idea,
      event: texts.are_you_looking_for_people_to_help_with_the_event
    },
    skills: {
      project: texts.add_skills_that_would_be_beneficial_for_collaborators_to_have,
      idea: texts.add_skills_that_would_be_beneficial_for_collaborators_to_have_idea,
      event: texts.add_skills_that_would_be_beneficial_for_collaborators_to_have
    },
    connections: {
      project: texts.add_connections_that_would_be_beneficial_for_collaborators_to_have,
      idea: texts.add_connections_that_would_be_beneficial_for_collaborators_to_have_idea,
      event: texts.add_connections_that_would_be_beneficial_for_collaborators_to_have_event
    },
  };
}
