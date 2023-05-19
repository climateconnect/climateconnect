from climateconnect_api.models.faq import FaqQuestion


def get_field_translation(
    name_of_field: str, language_code: str, faq_question: FaqQuestion
) -> str:
    field = name_of_field
    if not language_code == "en":
        field = name_of_field + "_" + language_code + "_translation"
    return getattr(faq_question, field)


def get_section_name(faq_question: FaqQuestion, language_code: str) -> str:
    return get_field_translation("name", language_code, faq_question.section)  # type: ignore


def get_question(faq_question: FaqQuestion, language_code: str) -> str:
    return get_field_translation("question", language_code, faq_question)


def get_answer(faq_question: FaqQuestion, language_code: str) -> str:
    return get_field_translation("answer", language_code, faq_question)
