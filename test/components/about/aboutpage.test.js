import React from "react";
import { mount } from "enzyme";
import AboutPage from "../../../pages/about";
//data
import info from "./../../../public/data/info.json";
import links from "./../../../public/data/links.json";
import members from "./../../../public/data/members.json";

describe("About page", () => {
  const wrapper = mount(<AboutPage />);
  it("contains correct infos", () => {
    for (const i of info) {
      //just look for the actual icon class, because looking for 2 classes in one find statement doesn't work
      const icon = i.icon.replace("fa ", "");
      expect(wrapper.exists("." + icon)).toEqual(true);
      expect(wrapper.text()).toContain(i.title);
      expect(wrapper.text()).toContain(i.text);
    }
  });
  it("contains correct links", () => {
    for (const link of links) {
      const icon = link.icon.replace("fas ", "");
      expect(wrapper.exists({ href: link.href })).toEqual(true);
      expect(wrapper.exists("." + icon)).toEqual(true);
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
