import React, { useContext } from "react";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import Form from "./../general/Form";


export default function AddInterests({
  selectedHubs,
  allHubs,
  handleSubmit,
  handleGoBack,
  onSelectNewHub,
  onClickRemoveHub,
  onInterestsInfoTextFieldChange,
  interestsInfo,
}) {
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "profile", locale: locale });
  const fields = [
    {
      type: "interests",
      allHubs: allHubs,
      selectedHubs: selectedHubs,
      onClickRemoveHub: onClickRemoveHub,
      onSelectNewHub: onSelectNewHub,
      onInterestsInfoTextFieldChange: onInterestsInfoTextFieldChange,
      interestsInfo: interestsInfo,
    },
  ];

  const messages = {
    headerMessage: texts.signup_step_3_headline,
    headingMessage: texts.your_areas_of_interest,
    explanationMessage: texts.let_the_climate_community_know_what_you_are_already_doing,
    submitMessage: texts.finish_sign_up,
    skipMessage: texts.skip,
  };

  return (
    <Form
      fields={fields}
      messages={messages}
      onSubmit={(event, values, skipInterests) => handleSubmit(event, values, skipInterests)}
      onGoBack={handleGoBack}
      alignButtonsRight
    />
  );
}
