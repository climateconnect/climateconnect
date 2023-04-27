import React from "react";
import IdeaCardContent from "./IdeaPreview";

export default {
  title: "ideas/IdeaPreview",
  component: IdeaCardContent,
};

const mockIdeaData = {
  id: 1,
  name: "1 idea",
  short_description: "One idea, One nation",
};

const Template = (args) => <IdeaCardContent {...args} />;
export const Default = Template.bind();

Default.args = {
  idea: mockIdeaData,
};
