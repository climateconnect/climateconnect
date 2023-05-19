from django.contrib.contenttypes.models import ContentType
from climate_match.models.answers import Answer, AnswerMetaData
from climate_match.models.translation import AnswerTranslation, QuestionTranslation
from climate_match.models.questions import Question
from typing import Any
from django.core.management.base import BaseCommand

from climateconnect_api.models.language import Language


class Command(BaseCommand):
    help = "Create data for the ClimateMatch"

    def handle(self, *args: Any, **options: Any) -> None:
        questions: list[dict[str, Any]] = [
            {
                "text": "Which fields are you most interested in?",
                "language": "en",
                "answer_type": "hub",
                "image": "../frontend/images/climatematch-question-1.jpg",
                "step": 1,
                "translations": {"de": "Wähle deine Herzensthemen"},
                "number_of_choices": 3,
            },
            {
                "text": "Do you want to get active longer-term or rather in a one-off project?",
                "language": "en",
                "answer_type": "answer",
                "image": "../frontend/images/climatematch-question-2.jpg",
                "step": 2,
                "translations": {
                    "de": "Möchstest du dich langfristig engagieren oder lieber bei einem einmaligen Projekt?"
                },
                "answers": [
                    {
                        "text": "I want to get active long-term.",
                        "language": "en",
                        "translations": {
                            "de": "Ich möchte mich langfristig engagieren."
                        },
                        "metadata": [
                            {"resource_type": "organization", "weight": 100},
                            {"resource_type": "project", "weight": 20},
                            {"resource_type": "idea", "weight": 20},
                        ],
                    },
                    {
                        "text": "I'd prefer a one-off project.",
                        "language": "en",
                        "translations": {"de": "Erstmal ein einmaliges Projekt."},
                        "metadata": [
                            {"resource_type": "organization", "weight": 20},
                            {"resource_type": "project", "weight": 100},
                            {"resource_type": "idea", "weight": 100},
                        ],
                    },
                    {
                        "text": "Both are fine with me.",
                        "language": "en",
                        "translations": {"de": "Mir ist beides recht."},
                        "metadata": [
                            {"resource_type": "organization", "weight": 100},
                            {"resource_type": "project", "weight": 100},
                            {"resource_type": "idea", "weight": 100},
                        ],
                    },
                ],
            },
            {
                "text": "Would you also be down to start something new? (Together with a team)",
                "language": "en",
                "answer_type": "answer",
                "image": "../frontend/images/climatematch-question-3.jpg",
                "step": 3,
                "translations": {
                    "de": "Würdest du auch etwas neues starten? (Mit jemanden zusammen)"
                },
                "answers": [
                    {
                        "text": "I'd love to",
                        "language": "en",
                        "translations": {"de": "Ja, liebend gerne"},
                        "metadata": [
                            {"resource_type": "organization", "weight": 0},
                            {"resource_type": "project", "weight": 20},
                            {"resource_type": "idea", "weight": 100},
                        ],
                    },
                    {
                        "text": "I wouldn't mind",
                        "language": "en",
                        "translations": {"de": "Das könnte ich mir vorstellen"},
                        "metadata": [
                            {"resource_type": "organization", "weight": 40},
                            {"resource_type": "project", "weight": 40},
                            {"resource_type": "idea", "weight": 60},
                        ],
                    },
                    {
                        "text": "No",
                        "language": "en",
                        "translations": {"de": "Nein"},
                        "metadata": [
                            {"resource_type": "organization", "weight": 100},
                            {"resource_type": "project", "weight": 100},
                            {"resource_type": "idea", "weight": 20},
                        ],
                    },
                ],
            },
            {
                "text": "Do you want to contribute with specific skills?",
                "language": "en",
                "answer_type": "skill",
                "image": "../frontend/images/climatematch-question-4.jpg",
                "step": 4,
                "translations": {
                    "de": "Möchtest du dich mit bestimmten Fähigkeiten einbringen?"
                },
                "number_of_choices": 3,
                "minimum_choices_required": 0,
            },
        ]
        for question in questions:
            if not Question.objects.filter(step=question["step"]).exists():
                answer_content_type = ContentType.objects.get(
                    model=question["answer_type"]
                )
                print(answer_content_type)
                question_in_db = Question.objects.create(
                    text=question["text"],
                    language=Language.objects.get(language_code=question["language"]),
                    image=question["image"],
                    step=question["step"],
                    answer_type=answer_content_type,
                )
                if "number_of_choices" in question:
                    question_in_db.number_of_choices = question["number_of_choices"]
                    if "minimum_choices_required" in question:
                        question_in_db.minimum_choices_required = question[
                            "minimum_choices_required"
                        ]
                    question_in_db.save()
                print("inserted question #{}".format(question["step"]))
                if "translations" in question:
                    for language_code in question["translations"]:
                        QuestionTranslation.objects.create(
                            question=question_in_db,
                            language=Language.objects.get(language_code=language_code),
                            text=question["translations"][language_code],
                        )
                        print(
                            "Inserted translation for question #{}".format(
                                question["step"]
                            )
                        )
                # This is just for questions with custom answers, not questions where the answers are a choice of hubs for example.
                if "answers" in question:
                    for answer in question["answers"]:
                        metadata_of_answer = []
                        for piece_of_metadata in answer["metadata"]:
                            # check if a metadata entry for this type and value already exists - otherwise create it
                            content_type = ContentType.objects.get(
                                model=piece_of_metadata["resource_type"]
                            )
                            answer_metadata = AnswerMetaData.objects.get_or_create(
                                weight=piece_of_metadata["weight"],
                                resource_type=content_type,
                            )
                            metadata_of_answer.append(answer_metadata[0])
                        answer_in_db = Answer.objects.create(
                            question=question_in_db,
                            language=Language.objects.get(
                                language_code=answer["language"]
                            ),
                            text=answer["text"],
                        )
                        for metadata_db_entry in metadata_of_answer:
                            answer_in_db.answer_metadata.add(metadata_db_entry.id)
                        answer_in_db.save()
                        print(
                            "inserted answer for question #{}".format(question["step"])
                        )
                        if "translations" in answer:
                            for language_code in answer["translations"]:
                                AnswerTranslation.objects.create(
                                    answer=answer_in_db,
                                    language=Language.objects.get(
                                        language_code=language_code
                                    ),
                                    text=answer["translations"][language_code],
                                )
            else:
                print(
                    "There was already a question for step {}".format(question["step"])
                )
