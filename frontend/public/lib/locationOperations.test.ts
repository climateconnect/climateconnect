import { getNameFromExactLocation, getNameFromLocation } from "./locationOperations";
const GIVEN_HAMLET_TYPE = "hamlet";
const GIVEN_HAMLET_LOCATION_WITH_TOWN = {
  display_name: "Display-Name-Sample",
  type: GIVEN_HAMLET_TYPE,
  addresstype: GIVEN_HAMLET_TYPE,
  class: "place",
  name: "Hamlet-Sample",
  address: {
    country: "Country-Sample",
    state: "State-Sample",
    hamlet: "Hamlet-Sample",
    county: "County-Sample",
    town: "Town-Sample",
  },
};

const GIVEN_HAMLET_LOCATION_WITHOUT_TOWN = {
  display_name: "Display-Name-Sample",
  type: GIVEN_HAMLET_TYPE,
  addresstype: GIVEN_HAMLET_TYPE,
  class: "place",
  name: "Hamlet-Sample",
  address: {
    country: "Country-Sample",
    state: "State-Sample",
    hamlet: "Hamlet-Sample",
    county: "County-Sample",
  },
};

describe("getNameFromExactLocation", () => {
  describe("given location is a concrete place of type village", () => {
    const given_concrete_place_location = {
      osm_type: "node",
      class: "place",
      type: "village",
      addresstype: "village",
      name: "Place-Sample",
      display_name: "Display-Name-Sample",
      address: {
        village: "Village-Sample",
        town: "Town-Sample",
        county: "County-Sample",
        state: "State-Sample",
        postcode: "ZIP-Sample",
        country: "Country-Sample",
      },
    };
    it("should return exact location", () => {
      const result = getNameFromExactLocation(given_concrete_place_location);

      expect(result).toEqual({
        name: "Village-Sample, Town-Sample, Country-Sample",
        city: "Town-Sample",
        state: "State-Sample",
        country: "Country-Sample",
      });
    });
  });

  describe("given location is a concrete place of type amenity", () => {
    const given_concrete_place_location = {
      class: "amenity",
      type: "cafe",
      addresstype: "amenity",
      name: "Haus Windheim No.2",
      display_name: "Display-Name-Sample",
      address: {
        amenity: "Amenity-Sample",
        house_number: "House-Number-Sample",
        road: "Road-Sample",
        suburb: "Suburb-Sample",
        village: "Village-Sample",
        town: "Town-Sample",
        county: "County-Sample",
        state: "State-Sample",
        postcode: "ZIP-Sample",
        country: "Country-Sample",
      },
    };
    it("should return exact location", () => {
      const result = getNameFromExactLocation(given_concrete_place_location);

      expect(result).toEqual({
        name: "Amenity-Sample, Road-Sample House-Number-Sample, Town-Sample, Country-Sample",
        city: "Town-Sample",
        state: "State-Sample",
        country: "Country-Sample",
      });
    });
  });

  describe("given location is a concrete place of type hamlet", () => {
    describe("when town exists", () => {
      it("should return exact location with town", () => {
        const result = getNameFromExactLocation(GIVEN_HAMLET_LOCATION_WITH_TOWN);
        expect(result).toEqual({
          name: "Hamlet-Sample, Town-Sample, Country-Sample",
          city: "Town-Sample",
          state: "State-Sample",
          country: "Country-Sample",
        });
      });
    });
    describe("when town does not exist", () => {
      it("should return exact location with county", () => {
        const result = getNameFromExactLocation(GIVEN_HAMLET_LOCATION_WITHOUT_TOWN);
        expect(result).toEqual({
          city: "County-Sample", // NOT A CITY
          state: "State-Sample",
          country: "Country-Sample",
          name: "Hamlet-Sample, County-Sample, Country-Sample",
        });
      });
    });
  });
});

describe("getNameFromLocation", () => {
  it("should return custom name for manually added locations", () => {
    const location = {
      added_manually: true,
      name: "Custom Location",
      city: "Sample City",
      state: "Sample State",
      country: "Sample Country",
    };

    const result = getNameFromLocation(location);

    expect(result).toEqual({
      name: "Custom Location",
      city: "Sample City",
      state: "Sample State",
      country: "Sample Country",
    });
  });

  it("should return legacy format when legacy format is enabled", () => {
    process.env.ENABLE_LEGACY_LOCATION_FORMAT = "true";

    const location = {
      city: "Legacy City",
      country: "Legacy Country",
    };

    const result = getNameFromLocation(location);

    expect(result).toBe("Legacy CityLegacy Country");

    delete process.env.ENABLE_LEGACY_LOCATION_FORMAT;
  });

  it("should return display_name if address or country is not present", () => {
    const location = {
      display_name: "Dummy Location Name",
      address: null,
    };

    const result = getNameFromLocation(location);

    expect(result).toBe("Dummy Location Name");
  });

  it("should return country and display_name for country locations", () => {
    const location = {
      type: "administrative",
      address: { country: "India", country_code: "in" },
      display_name: "India",
    };

    const result = getNameFromLocation(location);

    expect(result).toEqual({
      country: "India",
      name: "India",
    });
  });

  it("should return full parsed name for a generic location", () => {
    const location = {
      display_name: "Generic Location",
      addresstype: "county",
      type: "administrative",
      address: {
        city: "City-Sample", // TODO why was a city in this example? Was there a real example like that?
        state: "State-Sample",
        county: "County-Sample",
        country: "Country-Sample",
      },
    };

    const result = getNameFromLocation(location);

    expect(result).toEqual({
      city: "City-Sample",
      state: "State-Sample",
      country: "Country-Sample",
      name: "City-Sample, Country-Sample",
    });
  });

  it("should override name with custom mapping when name is in CUSTOM_NAME_MAPPINGS", () => {
    const location = {
      display_name: "Scotland, United Kingdom",
      type: "administrative",
      addresstype: "state",
      name: "Scotland",
      address: {
        country: "United Kingdom",
        state: "Scotland",
      },
    };

    const result = getNameFromLocation(location);

    expect(result.name).toBe("Scotland");
  });
  describe("given location type is a hamlet", () => {
    it("should return the city in the middle part in name when it exists", () => {
      const result = getNameFromLocation(GIVEN_HAMLET_LOCATION_WITH_TOWN);
      expect(result).toEqual({
        city: "Hamlet-Sample", // TODO: is this a problem?
        state: "State-Sample",
        country: "Country-Sample",
        name: "Hamlet-Sample, Town-Sample, Country-Sample",
      });
    });
    it("should return the county in the middle part in name when town does not exist", () => {
      const result = getNameFromLocation(GIVEN_HAMLET_LOCATION_WITHOUT_TOWN);
      expect(result).toEqual({
        city: "Hamlet-Sample",
        state: "State-Sample",
        country: "Country-Sample",
        name: "Hamlet-Sample, County-Sample, Country-Sample",
      });
    });
  });
});
