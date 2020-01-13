import React from "react";
import { shallow } from "enzyme";
import Header from "../../../src/components/general/Header";

describe("Header Component", () => {
  it("contains a logo image", () => {
    const wrapper = shallow(<Header />);
    expect(wrapper.find("img")).toHaveLength(1);
    expect(wrapper.find("img").prop("alt")).toEqual("Climate Connect");
  });
});
