import React from "react";
import { shallow } from "enzyme";
import ProjectPreview from "../../../src/components/project/ProjectPreview";
import Button from "../../../src/components/general/Button";
import SAMPLE_DATA from "./../../../public/data/projects.json";

describe("ProjectPreview Component", () => {
  const project = SAMPLE_DATA.projects[0];
  let wrapper;
  beforeEach(() => {
    wrapper = shallow(<ProjectPreview project={project} />);
  });
  it("contains correct images", () => {
    //TODO: Figure out how to test styled component image
    // expect(wrapper.find("Image")).toHaveLength(1);
    expect(wrapper.find("img")).toHaveLength(3);
    const images = wrapper.find("img");
    expect(images.at(0).props()).toEqual({ src: project.organisation_image });
    expect(images.at(1).props()).toEqual({ src: "./placeholder.svg" });
    expect(images.at(2).props()).toEqual({ src: "./world.svg" });
  });

  it("contains correct project data", () => {
    expect(wrapper.find("h2").text()).toEqual(project.name);
    const spans = wrapper.find("span");
    expect(spans.at(0).text()).toEqual(project.organisation_name);
    expect(spans.at(1).text()).toEqual(project.location);
    expect(spans.at(2).text()).toEqual(project.impact.toString());
  });

  it("contains correct button", () => {
    expect(wrapper.find(Button)).toHaveLength(1);
    expect(wrapper.find(Button).props()).toEqual({ children: "Get Involved", type: "outlined" });
  });
});
