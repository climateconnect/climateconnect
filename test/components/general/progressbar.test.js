import React from "react";
import { shallow } from "enzyme";
import ProgressBar from "../../../src/components/general/ProgressBar";

describe("ProgressBar component", () => {
  it("renders the percentage as text", () => {
    let percentage = 30;
    const wrapper = shallow(<ProgressBar progressPercentage={percentage}></ProgressBar>);
    expect(wrapper.text()).toContain(`${percentage}%`);
  });
});
