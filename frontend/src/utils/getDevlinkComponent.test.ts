import { componentRegistry } from "../../devlink/componentRegistry";
import { getDevlinkComponent } from "./getDevlinkComponent";

jest.mock("../../devlink/componentRegistry");

const MockComponentA = () => null;
const MockComponentB = () => null;
const MockComponentC = () => null;

const mockRegistry = componentRegistry as jest.Mocked<typeof componentRegistry>;

beforeEach(() => {
  mockRegistry.EnChErlangenLandingpage = MockComponentA;
  mockRegistry.DeChErlangenLandingpage = MockComponentB;
  mockRegistry.Wasseraktionswochen = MockComponentC;
  jest.spyOn(console, "warn").mockImplementation();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("getDevlinkComponent", () => {
  it("returns undefined when name is null", () => {
    expect(getDevlinkComponent(null, "en")).toBeUndefined();
    expect(console.warn).not.toHaveBeenCalled();
  });

  it("returns undefined when name is empty string", () => {
    expect(getDevlinkComponent("", "en")).toBeUndefined();
    expect(console.warn).not.toHaveBeenCalled();
  });

  it("returns the component when name has no prefix and exists in registry", () => {
    expect(getDevlinkComponent("Wasseraktionswochen", "de")).toBe(MockComponentC);
    expect(console.warn).not.toHaveBeenCalled();
  });

  it("warns and returns undefined when name has no prefix and is not in registry", () => {
    expect(getDevlinkComponent("NonExistent", "en")).toBeUndefined();
    expect(console.warn).toHaveBeenCalledWith(
      '[devlink] Component "NonExistent" not found in registry (locale: en).'
    );
  });

  it("returns En-prefixed component when stored name matches locale", () => {
    expect(getDevlinkComponent("EnChErlangenLandingpage", "en")).toBe(MockComponentA);
    expect(console.warn).not.toHaveBeenCalled();
  });

  it("swaps En to De prefix when locale is de", () => {
    expect(getDevlinkComponent("EnChErlangenLandingpage", "de")).toBe(MockComponentB);
    expect(console.warn).not.toHaveBeenCalled();
  });

  it("swaps De to En prefix when locale is en", () => {
    expect(getDevlinkComponent("DeChErlangenLandingpage", "en")).toBe(MockComponentA);
    expect(console.warn).not.toHaveBeenCalled();
  });

  it("returns De-prefixed component when stored name matches locale", () => {
    expect(getDevlinkComponent("DeChErlangenLandingpage", "de")).toBe(MockComponentB);
    expect(console.warn).not.toHaveBeenCalled();
  });

  it("returns stored component for unrecognized locale (no swap possible)", () => {
    expect(getDevlinkComponent("EnChErlangenLandingpage", "fr")).toBe(MockComponentA);
    expect(console.warn).not.toHaveBeenCalled();
  });

  it("warns and returns undefined when swapped name is not in registry", () => {
    expect(getDevlinkComponent("EnChNonexistentLandingpage", "de")).toBeUndefined();
    expect(console.warn).toHaveBeenCalledWith(
      '[devlink] Component "DeChNonexistentLandingpage" not found in registry (locale: de).'
    );
  });

  it("warns and returns undefined when prefixed name not found for unknown locale", () => {
    expect(getDevlinkComponent("EnChNonexistentLandingpage", "fr")).toBeUndefined();
    expect(console.warn).toHaveBeenCalledWith(
      '[devlink] Component "EnChNonexistentLandingpage" not found in registry (locale: fr).'
    );
  });
});
