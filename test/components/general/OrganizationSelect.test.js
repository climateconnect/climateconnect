import React from "react";
import OrganizationSelect from "../../../src/components/general/OrganizationSelect";
import renderer from "react-test-renderer";

describe("OrganizationSelect component", () => {
  let organizations = [
    {
      name: "sneep Erlangen e.V.",
      organization_image: "tmp-data/assets/images/sneep.png",
      id: 44
    },
    {
      name: "Climate Action Tech",
      organization_image: "tmp-data/assets/images/climate-action-tech.png",
      id: 45
    }
  ];
  it("renders each organization as a MenuItem", () => {
    const tree = renderer.create(
      <OrganizationSelect organizations={organizations}></OrganizationSelect>
    );
    expect(tree).toMatchSnapshot();
  });
});
