import React from "react";
import { shallow } from "enzyme";
import CreateProjectLayout from "../../../src/layouts/CreateProjectLayout";

describe("Create project layout", () => {
  it("contains correct header text", () => {
    const wrapper = shallow(<CreateProjectLayout />);
    expect(wrapper.find("h1")).toHaveLength(1);
    expect(wrapper.find("h1").text()).toEqual("Create a Project");
  });

  it("Updates state when organization dropdown value is changed", () => {
    // const wrapper = mount(<CreateProjectLayout />);
    // todo - what is a good way to test this?
  });
});
