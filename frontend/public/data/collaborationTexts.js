export default function getCollaborationTexts(texts) {
  return {
    allow: {
      idea: texts.allow_collaboration_on_your_project,
      inprogress: texts.allow_collaboration_on_your_project,
      cancelled: texts.encourage_collaboration_to_make_your_project_a_success,
      finished: texts.would_you_assist_in_the_replication_of_your_project,
      recurring: texts.allow_collaboration_on_your_project,
    },
    skills: {
      idea: texts.add_skills_that_would_be_beneficial_for_collaborators_to_have,
      inprogress: texts.add_skills_that_would_be_beneficial_for_collaborators_to_have,
      cancelled: texts.add_skills_that_are_helpful_to_make_your_project_a_success,
      finished: texts.add_skills_that_are_helpful_to_replicate_your_project,
      recurring: texts.add_skills_that_would_be_beneficial_for_collaborators_to_have,
    },
    connections: {
      idea: texts.add_connections_that_would_be_beneficial_for_collaborators_to_have,
      inprogress: texts.add_connections_that_would_be_beneficial_for_collaborators_to_have,
      cancelled: texts.add_connections_that_would_be_beneficial_to_make_your_project_a_success,
      finished: texts.add_connection_that_would_be_beneficial_to_have_to_replicate_your_project,
      recurring: texts.add_connections_that_would_be_beneficial_for_collaborators_to_have,
    },
  };
}
