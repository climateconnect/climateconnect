import React from "react";
import { shallow } from "enzyme";
import Footer from "../../../src/components/general/Footer";

describe("Footer Component Tests", () => {
  it("contains a copyright symbol and the current year", () => {
    const text = shallow(<Footer />).text();
    expect(text).toContain("©");
    expect(text).toContain(new Date().getFullYear().toString());
  });
});
