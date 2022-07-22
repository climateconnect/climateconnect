from xml.dom.minidom import TypeInfo
from climateconnect_api.models.faq import FaqQuestion


def get_attributeFun(
    attribute_name: str, language_code: str, faq_question: FaqQuestion
) -> str:
    attribute = attribute_name
    if not language_code == "en":
        attribute = attribute_name + "_" + language_code + "_translation"
    return getattr(faq_question, attribute)


def get_section_name(faq_question: FaqQuestion, language_code: str) -> str:
    return get_attributeFun("name", language_code, faq_question.section)


def get_question(faq_question: FaqQuestion, language_code: str) -> str:
    return get_attributeFun("question", language_code, faq_question)


def get_answer(faq_question: FaqQuestion, language_code: str) -> str:
    return get_attributeFun("answer", language_code, faq_question)
