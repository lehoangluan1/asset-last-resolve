import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthRoute, ProtectedRoutes, RequireGrant } from "@/components/auth/RouteGuards";
import { vi } from "vitest";

const mockedUseAuth = vi.fn();

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => mockedUseAuth(),
}));

vi.mock("@/components/AppLayout", () => ({
  AppLayout: () => <div>App Layout</div>,
}));

describe("RouteGuards", () => {
  beforeEach(() => {
    mockedUseAuth.mockReset();
  });

  it("redirects anonymous users away from protected routes", () => {
    mockedUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: false, hasGrant: vi.fn() });

    render(
      <MemoryRouter initialEntries={["/private"]}>
        <Routes>
          <Route path="/login" element={<div>Login Screen</div>} />
          <Route path="/private" element={<ProtectedRoutes />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Login Screen")).toBeInTheDocument();
  });

  it("redirects authenticated users away from the auth route", () => {
    mockedUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false, hasGrant: vi.fn() });

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/" element={<div>Home</div>} />
          <Route path="/login" element={<AuthRoute><div>Login Screen</div></AuthRoute>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Home")).toBeInTheDocument();
  });

  it("blocks users who do not have the required grant", () => {
    mockedUseAuth.mockReturnValue({ hasGrant: () => false });

    render(
      <MemoryRouter initialEntries={["/users"]}>
        <Routes>
          <Route path="/403" element={<div>Forbidden</div>} />
          <Route path="/users" element={<RequireGrant grant="users.manage"><div>Users</div></RequireGrant>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Forbidden")).toBeInTheDocument();
  });
});
