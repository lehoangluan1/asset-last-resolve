import { screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import MaintenancePage from "@/pages/MaintenancePage";
import { renderWithProviders } from "@/test/render";
import { api } from "@/lib/api";

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return {
    ...actual,
    api: {
      ...actual.api,
      maintenance: {
        ...actual.api.maintenance,
        list: vi.fn(),
      },
      assets: {
        ...actual.api.assets,
        list: vi.fn(),
      },
      reference: {
        ...actual.api.reference,
        usersByRoles: vi.fn(),
      },
    },
  };
});

const mockedUseAuth = vi.fn();

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => mockedUseAuth(),
}));

describe("MaintenancePage", () => {
  const mockedMaintenanceList = vi.mocked(api.maintenance.list);
  const mockedAssetsList = vi.mocked(api.assets.list);
  const mockedUsersByRoles = vi.mocked(api.reference.usersByRoles);

  beforeEach(() => {
    mockedMaintenanceList.mockResolvedValue({
      items: [{
        id: "record-1",
        assetId: "asset-1",
        assetCode: "AST-1",
        assetName: "Laptop A",
        type: "Inspection",
        description: "Inspect laptop",
        techCondition: "good",
        status: "scheduled",
        priority: "normal",
        assignedToId: "tech-1",
        assignedTo: "Tech User",
        scheduledDate: "2026-04-20",
        completedDate: null,
        cost: 0,
        notes: "Notes",
        createdAt: "2026-04-18T00:00:00Z",
      }],
      totalItems: 1,
      page: 0,
      size: 10,
      totalPages: 1,
    });
    mockedAssetsList.mockResolvedValue({
      items: [],
      totalItems: 0,
      page: 0,
      size: 100,
      totalPages: 1,
    });
    mockedUsersByRoles.mockResolvedValue([]);
  });

  it("hides update status actions for officers", async () => {
    mockedUseAuth.mockReturnValue({
      user: { id: "officer-1", role: "officer" },
      hasGrant: (grant: string) => grant === "maintenance.manage",
    });

    renderWithProviders(<MaintenancePage />);

    await waitFor(() => expect(screen.getByText("Laptop A")).toBeInTheDocument());
    expect(screen.queryByRole("button", { name: /update status/i })).not.toBeInTheDocument();
    expect(screen.queryByText("Action")).not.toBeInTheDocument();
  });

  it("shows update status for the assigned technician", async () => {
    mockedUseAuth.mockReturnValue({
      user: { id: "tech-1", role: "technician" },
      hasGrant: (grant: string) => grant === "maintenance.manage",
    });

    renderWithProviders(<MaintenancePage />);

    await waitFor(() => expect(screen.getByRole("button", { name: /update status/i })).toBeInTheDocument());
  });
});
