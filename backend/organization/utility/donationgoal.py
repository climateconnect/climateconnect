from climateconnect_api.models.donation import DonationGoal


def get_donationgoal_name(donation_goal: DonationGoal, language_code: str) -> str:
    lang_translation_attr = "name_{}_translation".format(language_code)
    if hasattr(donation_goal, lang_translation_attr):
        translation = getattr(donation_goal, lang_translation_attr)
        if language_code != "en" and translation is not None:
            return translation
    return donation_goal.name
<<<<<<< HEAD
=======


def get_donationgoal_call_to_action_text(
    donation_goal: DonationGoal, language_code: str
) -> str:
    lang_translation_attr = "call_to_action_text_{}_translation".format(language_code)
    if hasattr(donation_goal, lang_translation_attr):
        translation = getattr(donation_goal, lang_translation_attr)
        if language_code != "en" and translation is not None:
            return translation
    return donation_goal.call_to_action_text
>>>>>>> master
