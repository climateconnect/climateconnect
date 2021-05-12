import React from 'react';


export default function getIdeaTexts({idea, user, url_slug, locale}) {
    return {
        share_your_idea_and_find_the_right_collaborators: {
            "en": "Share your idea and find the right collaborators!",
            "de": "Teile deine Idee und finde die richtigen Mitwirkenden!"
        },
        share_idea: {
            "en": "SHARE IDEA",
            "de": "IDEE TEILEN"
        },
        no_ideas_found: {
            "en": "No ideas found.",
            "de": "Keine Ideen gefunden."
        }
    };
}