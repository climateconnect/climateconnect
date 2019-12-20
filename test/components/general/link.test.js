import React from "react";
import { shallow } from "enzyme";
import Link from "../../../src/components/ui/Link";

describe("Link Component", () => {
  it("renders the correct text", () => {
    const wrapper = shallow(<Link>Button</Link>);
    expect(wrapper.dive().text()).toEqual("Button");
  });

  it("has the correct type", () => {
    const wrapper = shallow(<Link type="big">Button</Link>);
    expect(wrapper.props()).toEqual({ children: "Button", type: "big" });
  });
});
