import React from "react";
import { shallow } from "enzyme";
import IndexLayout from "./../../../src/layouts/IndexLayout";
import Link from "next/link";

describe("Layout Component Tests", () => {
  it("contains correct header text", () => {
    const wrapper = shallow(<IndexLayout />);
    expect(wrapper.find("h1")).toHaveLength(1);
    expect(wrapper.find("h1").text()).toEqual(
      "Share and Collaborate on projects to reach the maximum positive impact on the world"
    );
  });

  it("contains a browse button", () => {
    const wrapper = shallow(<IndexLayout />);
    expect(wrapper.find(Link)).toHaveLength(1);
    expect(wrapper.find("button")).toHaveLength(1);
    expect(wrapper.find("button").text()).toEqual("Browse");
  });

  it("contains correct grid components", () => {
    // const wrapper = shallow(<IndexLayout />);
    // add test here when Grid Container component is completed
  });
});
