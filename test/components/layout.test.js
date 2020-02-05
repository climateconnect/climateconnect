import React from "react";
import { shallow } from "enzyme";
import Layout from "./../../src/components/layouts/layout";
import Header from "./../../src/components/general/Header";
import Footer from "./../../src/components/general/Footer";

describe("Layout Component Tests", () => {
  it("contains a header and footer", () => {
    const wrapper = shallow(<Layout title="Test page" />);
    expect(wrapper.find(Header)).toHaveLength(1);
    expect(wrapper.find(Footer)).toHaveLength(1);
  });
});
