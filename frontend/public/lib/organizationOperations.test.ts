import { getIsUserFollowing } from "./organizationOperations";
import { apiRequest } from "./apiOperations";

jest.mock("./apiOperations", () => ({
  apiRequest: jest.fn(),
}));

const mockedApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;

describe("getIsUserFollowing", () => {
  beforeEach(() => {
    mockedApiRequest.mockReset();
  });

  it("skips the follow-status request for guest users", async () => {
    await expect(getIsUserFollowing("my-org", undefined, "en")).resolves.toBeNull();
    expect(mockedApiRequest).not.toHaveBeenCalled();
  });

  it("requests the follow-status endpoint for authenticated users", async () => {
    mockedApiRequest.mockResolvedValue({ data: { is_following: true } } as any);

    await expect(getIsUserFollowing("my-org", "token", "en")).resolves.toBe(true);
    expect(mockedApiRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "get",
        url: "/api/organizations/my-org/am_i_following/",
        token: "token",
        locale: "en",
      })
    );
  });
});
