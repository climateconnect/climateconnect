import React from "react";
import { mount } from "enzyme";
import ProjectPreview from "../../../src/components/project/ProjectPreview";

import SAMPLE_DATA from "./../../../public/data/projects.json";

describe("ProjectPreview Component", () => {
  const project = SAMPLE_DATA.projects[0];

  it("contains correct project data", () => {
    const wrapper = mount(<ProjectPreview project={project} />);
    expect(wrapper.text()).toContain(project.name);
    expect(wrapper.text()).toContain(project.location);
    expect(wrapper.text()).toContain(project.creator_name);
  });
});
