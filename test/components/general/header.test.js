import React from "react";
import { mount } from "enzyme";
import { ThemeProvider } from "@material-ui/core/styles";
import Header from "../../../src/components/general/Header";
import theme from "../../../src/themes/theme";

describe("Header Component", () => {
  it("contains a logo image", () => {
    const wrapper = mount(
      <ThemeProvider theme={theme}>
        <Header />
      </ThemeProvider>
    );
    expect(wrapper.find("img")).toHaveLength(1);
    expect(wrapper.find("img").prop("alt")).toEqual("Climate Connect");
  });
});
