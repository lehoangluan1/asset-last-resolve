import { screen } from "@testing-library/react";
import { AppSidebar } from "@/components/AppSidebar";
import { renderWithProviders } from "@/test/render";
import { vi } from "vitest";

const mockedUseAuth = vi.fn();

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => mockedUseAuth(),
}));

describe("AppSidebar", () => {
  it("shows administration links for admins", () => {
    mockedUseAuth.mockReturnValue({
      hasGrant: (grant: string) => ["dashboard.read", "users.manage", "reference.manage"].includes(grant),
    });

    renderWithProviders(<AppSidebar />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("User Management")).toBeInTheDocument();
    expect(screen.getByText("Reference Data")).toBeInTheDocument();
  });

  it("hides administration links for employees", () => {
    mockedUseAuth.mockReturnValue({
      hasGrant: (grant: string) => ["dashboard.read", "assets.read", "borrows.read"].includes(grant),
    });

    renderWithProviders(<AppSidebar />);

    expect(screen.queryByText("User Management")).not.toBeInTheDocument();
    expect(screen.queryByText("Reference Data")).not.toBeInTheDocument();
    expect(screen.getByText("Borrow Requests")).toBeInTheDocument();
  });
});
