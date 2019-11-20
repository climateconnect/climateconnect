import React from "react";
import { shallow } from "enzyme";
import Header from "../../../src/components/general/Header";
import Link from "../../../src/components/ui/Link";

describe("Header Component Tests", () => {
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
      { href: "forum", text: "Forum" },
      { href: "browse", text: "Browse" },
      { href: "create", text: "Create A Project" },
      { href: "signin", text: "SIGN IN", type: "button" }
    ];

    for (let i = 0; i < 4; i++) {
      const link = wrapper.find(Link).at(i);
      expect(link.props()).toEqual(expectedProps[i]);
    }
  });
});
