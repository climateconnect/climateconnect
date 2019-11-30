import React from "react";
import { shallow } from "enzyme";
import Button from "../../../src/components/general/Button";

describe("Button Component", () => {
  it("renders the correct text", () => {
    const wrapper = shallow(<Button>Button</Button>);
    expect(wrapper.text()).toEqual("Button");
  });

  it("has the correct type", () => {
    const wrapper = shallow(<Button type="big">Button</Button>);
    expect(wrapper.props()).toEqual({ children: "Button", type: "big" });
  });
});
