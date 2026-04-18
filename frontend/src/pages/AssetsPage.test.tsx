import { screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import AssetsPage from "@/pages/AssetsPage";
import { renderWithProviders } from "@/test/render";
import { api } from "@/lib/api";

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return {
    ...actual,
    api: {
      ...actual.api,
      reference: {
        ...actual.api.reference,
        departments: vi.fn(),
      },
      assets: {
        ...actual.api.assets,
        list: vi.fn(),
      },
    },
  };
});

const mockedUseAuth = vi.fn();

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => mockedUseAuth(),
}));

describe("AssetsPage", () => {
  const mockedDepartments = vi.mocked(api.reference.departments);
  const mockedAssetsList = vi.mocked(api.assets.list);

  beforeEach(() => {
    mockedDepartments.mockResolvedValue([
      { id: "dept-1", name: "Information Technology", code: "IT", location: "Tower A", employeeCount: 10, managerId: null, managerName: null },
      { id: "dept-2", name: "Human Resources", code: "HR", location: "Tower B", employeeCount: 5, managerId: null, managerName: null },
    ]);
    mockedAssetsList.mockResolvedValue({
      items: [],
      totalItems: 0,
      page: 0,
      size: 10,
      totalPages: 1,
    });
  });

  it("defaults managers to their own department scope", async () => {
    mockedUseAuth.mockReturnValue({
      user: { role: "manager", departmentId: "dept-1", departmentName: "Information Technology" },
      hasGrant: () => false,
    });

    renderWithProviders(<AssetsPage />);

    await waitFor(() => expect(mockedAssetsList).toHaveBeenCalled());
    expect(mockedAssetsList).toHaveBeenCalledWith(expect.objectContaining({ departmentId: "dept-1" }));
    expect(screen.getByText("Information Technology")).toBeInTheDocument();
    expect(screen.queryByText(/All Departments/i)).not.toBeInTheDocument();
  });
});
