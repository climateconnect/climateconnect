import React from "react";
import { shallow } from "enzyme";
import Header from "../../../src/components/general/Header";
import Link from "../../../src/components/ui/Link";

describe("Header Component", () => {
  it("contains correct image", () => {
    const wrapper = shallow(<Header />);
    expect(wrapper.find("img")).toHaveLength(1);
  });
  it("contains four links", () => {
    const wrapper = shallow(<Header />);
    expect(wrapper.find(Link)).toHaveLength(4);
  });
  it("links contain correct props", () => {
    const wrapper = shallow(<Header />);

    const expectedProps = [
      { href: "forum" },
      { href: "browse" },
      { href: "create" },
      { href: "signin", type: "button" }
    ];
    const expectedTexts = ["Forum", "Browse", "Create A Project", "SIGN IN"];

    for (let i = 0; i < 4; i++) {
      const link = wrapper.find(Link).at(i);
      expect(link.props()).toEqual(expectedProps[i]);
      expect(link.text()).toEqual(expectedTexts[i]);
    }
  });
});
