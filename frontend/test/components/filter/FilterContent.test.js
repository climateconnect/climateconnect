import { findAllItems, reduceFilters } from "../../../src/components/filter/FilterContent";

describe("FilterContent", () => {
  describe("findAllItems", () => {
    it("should stop traversing if only top-level item", () => {
      const stubFilter = {
        icon: "react-element",
        iconName: "ExploreIcon",
        // No items to choose from
        itemsToChooseFrom: [],
        itemType: "project categories",
        key: "category",
        title: "Categories",
        tooltipText: "Only shows projects from selected fields",
        type: "openMultiSelectDialogButton",
      };
      const filtersToCheck = new Set();

      const foundItems = findAllItems(stubFilter, filtersToCheck);
      expect(foundItems).toBe(stubFilter);
    });

    it("should return correct matched item", () => {
      const stubFilter = {
        icon: "react-element",
        iconName: "ExploreIcon",
        itemsToChooseFrom: [{ name: "Test" }],
        itemType: "project categories",
        key: "category",
        title: "Categories",
        tooltipText: "Only shows projects from selected fields",
        type: "openMultiSelectDialogButton",
      };
      const filtersToCheck = new Set(["Test"]);

      const foundItems = findAllItems(stubFilter, filtersToCheck);
      expect(foundItems).toStrictEqual([{ name: "Test" }]);
    });
  });

  describe("reduceFilters", () => {
    it("should stop traversing if only top-level item", () => {
      const stubFilter = {
        icon: "react-element",
        iconName: "ExploreIcon",
        // No items to choose from
        itemsToChooseFrom: [],
        itemType: "project categories",
        key: "category",
        title: "Categories",
        tooltipText: "Only shows projects from selected fields",
        type: "openMultiSelectDialogButton",
      };
      const filtersToCheck = new Set();

      const foundItems = findAllItems(stubFilter, filtersToCheck);
      expect(foundItems).toBe(stubFilter);
    });

    // TODO
    it("handles mixed filter types (e.g. categories and skills)", () => {});

    it("handles non-nested and nested (e.g. subcategories or items to choose from) within the same filter", () => {});
  });
});
