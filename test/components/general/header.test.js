import React from "react";
import { shallow } from "enzyme";
import Header from "../../../src/components/general/Header";
import Link from "../../../src/components/ui/Link";

describe("Header Component", () => {
  it("contains correct image", () => {
    const wrapper = shallow(<Header />);
    expect(wrapper.find("img")).toHaveLength(1);
  });
  it("contains three links", () => {
    const wrapper = shallow(<Header />);
    expect(wrapper.find(Link)).toHaveLength(3);
  });
  it("links contain correct props", () => {
    const wrapper = shallow(<Header />);

    const expectedProps = [
      { href: "browse", children: "Browse" },
      { href: "create", children: "Create A Project" },
      { href: "signin", children: "Sign In", type: "button" }
    ];
    const expectedTexts = ["Browse", "Create A Project", "Sign In"];

    for (let i = 0; i < 3; i++) {
      const link = wrapper.find(Link).at(i);
      expect(link.props()).toEqual(expectedProps[i]);
      expect(
        link
          .dive()
          .dive()
          .text()
      ).toEqual(expectedTexts[i]);
    }
  });
});
