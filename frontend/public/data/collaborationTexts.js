export default function getCollaborationTexts(texts) {
  return {
    allow: {
      Idea: texts.allow_collaboration_on_your_project,
      "In Progress": texts.allow_collaboration_on_your_project,
      Cancelled: texts.encourage_collaboration_to_make_your_project_a_success,
      "Successfully Finished": texts.would_you_assist_in_the_replication_of_your_project,
      Recurring: texts.allow_collaboration_on_your_project,
    },
    skills: {
      Idea: texts.add_skills_that_would_be_beneficial_for_collaborators_to_have,
      "In Progress": texts.add_skills_that_would_be_beneficial_for_collaborators_to_have,
      Cancelled: texts.add_skills_that_are_helpful_to_make_your_project_a_success,
      "Successfully Finished": texts.add_skills_that_are_helpful_to_replicate_your_project,
      Recurring: texts.add_skills_that_would_be_beneficial_for_collaborators_to_have,
    },
    connections: {
      Idea: texts.add_connections_that_would_be_beneficial_for_collaborators_to_have,
      "In Progress": texts.add_connections_that_would_be_beneficial_for_collaborators_to_have,
      Cancelled: texts.add_connections_that_would_be_beneficial_to_make_your_project_a_success,
      "Successfully Finished":
        texts.add_connection_that_would_be_beneficial_to_have_to_replicate_your_project,
      Recurring: texts.add_connections_that_would_be_beneficial_for_collaborators_to_have,
    },
  };
}
