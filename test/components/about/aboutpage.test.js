import React from "react";
import { mount } from "enzyme";
import AboutPage from "../../../pages/about";
import about_page_info from "./../../../public/data/about_page_info";
import links from "../../../public/data/links";
import members from "./../../../public/data/members.json";

describe("About page", () => {
  const wrapper = mount(<AboutPage />);
  it("contains correct infos", () => {
    for (const info of about_page_info) {
      expect(wrapper.exists({ name: info.iconName })).toEqual(true);
      expect(wrapper.text()).toContain(info.title);
      expect(wrapper.text()).toContain(info.text);
    }
  });
  it("contains correct links", () => {
    for (const link of links) {
      expect(wrapper.exists({ href: link.href })).toEqual(true);
      expect(wrapper.exists({ name: link.iconName })).toEqual(true);
      expect(wrapper.text()).toContain(link.text);
    }
  });
  it("contains correct teamMembers", () => {
    for (const member of members) {
      expect(wrapper.text()).toContain(member.name);
      expect(wrapper.exists({ src: "images/" + member.image })).toEqual(true);
      expect(wrapper.text()).toContain(member.location);
    }
  });
});
