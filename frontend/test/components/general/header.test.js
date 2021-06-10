import { ThemeProvider } from "@material-ui/core/styles";
import { mount } from "enzyme";
import React from "react";
import Header from "../../../src/components/header/Header";
import theme from "../../../src/themes/theme";

describe("Header Component", () => {
  it("contains a logo image", () => {
    const wrapper = mount(
      <ThemeProvider theme={theme}>
        <Header />
      </ThemeProvider>
    );
    expect(wrapper.find("img")).toHaveLength(1);
    expect(wrapper.find("img").prop("alt")).toEqual("Climate Connect logo");
  });
});
