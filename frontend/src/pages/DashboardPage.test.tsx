import { screen, waitFor } from "@testing-library/react";
import DashboardPage from "@/pages/DashboardPage";
import { renderWithProviders } from "@/test/render";
import { api } from "@/lib/api";
import { vi } from "vitest";

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return {
    ...actual,
    api: {
      ...actual.api,
      dashboard: {
        get: vi.fn(),
      },
    },
  };
});

const mockedUseAuth = vi.fn();

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => mockedUseAuth(),
}));

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Bar: () => <div>Bar</div>,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  PieChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Pie: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Cell: () => null,
  Legend: () => null,
}));

describe("DashboardPage", () => {
  const mockedDashboardGet = vi.mocked(api.dashboard.get);

  it("shows operational quick actions for users with the right grants", async () => {
    mockedUseAuth.mockReturnValue({
      user: { departmentName: "IT" },
      hasGrant: (grant: string) => ["assets.manage", "assignments.read", "borrows.read", "verification.read"].includes(grant),
    });
    mockedDashboardGet.mockResolvedValue({
      role: "admin",
      stats: [{ key: "total-assets", label: "Total Assets", value: 12, variant: "primary" }],
      departmentDistribution: [{ name: "IT", value: 12 }],
      statusBreakdown: [{ name: "In Use", value: 9 }],
      activeCampaign: {
        id: "ver-1",
        name: "Q2 Verification",
        scope: "IT",
        dueDate: "2026-06-30",
        totalTasks: 10,
        completedTasks: 7,
        discrepancyCount: 2,
      },
      recentActivity: [],
      upcomingDeadlines: [],
    });

    renderWithProviders(<DashboardPage />);

    await waitFor(() => expect(screen.getByText("Total Assets")).toBeInTheDocument());
    expect(screen.getByRole("button", { name: /add asset/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /assignments/i })).toBeInTheDocument();
    expect(screen.getByText("Q2 Verification")).toBeInTheDocument();
  });

  it("hides asset creation for read-only users", async () => {
    mockedUseAuth.mockReturnValue({
      user: { departmentName: "HR" },
      hasGrant: (grant: string) => grant === "borrows.read",
    });
    mockedDashboardGet.mockResolvedValue({
      role: "employee",
      stats: [{ key: "active-borrows", label: "Active Borrows", value: 2, variant: "info" }],
      departmentDistribution: [{ name: "HR", value: 2 }],
      statusBreakdown: [{ name: "Borrowed", value: 2 }],
      activeCampaign: null,
      recentActivity: [],
      upcomingDeadlines: [],
    });

    renderWithProviders(<DashboardPage />);

    await waitFor(() => expect(screen.getByText("Active Borrows")).toBeInTheDocument());
    expect(screen.queryByRole("button", { name: /add asset/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /borrow/i })).toBeInTheDocument();
  });
});
