import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { api, HttpError } from "@/lib/api";
import { AUTH_STORAGE_KEY } from "@/lib/auth-storage";
import { vi } from "vitest";

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return {
    ...actual,
    api: {
      auth: {
        login: vi.fn(),
        me: vi.fn(),
        changePassword: vi.fn(),
      },
    },
  };
});

function AuthProbe() {
  const { user, isAuthenticated, login, logout, hasGrant } = useAuth();

  return (
    <div>
      <div data-testid="auth-state">{isAuthenticated ? "authenticated" : "anonymous"}</div>
      <div data-testid="username">{user?.username ?? "none"}</div>
      <div data-testid="grant">{hasGrant("users.manage") ? "has-grant" : "no-grant"}</div>
      <button onClick={() => login("admin", "demo123")}>login</button>
      <button onClick={() => logout()}>logout</button>
    </div>
  );
}

describe("AuthContext", () => {
  const mockedLogin = vi.mocked(api.auth.login);
  const mockedMe = vi.mocked(api.auth.me);

  it("logs in, stores the session, and exposes grants", async () => {
    mockedMe.mockResolvedValue({
      id: "1",
      username: "admin",
      name: "Sarah Chen",
      email: "admin@example.com",
      role: "admin",
      departmentId: "d1",
      departmentName: "IT",
      status: "active",
      grants: ["dashboard.read", "users.manage"],
      createdAt: "2026-04-16T00:00:00Z",
    });
    mockedLogin.mockResolvedValue({
      token: "jwt-token",
      expiresAt: "2026-04-16T00:00:00Z",
      user: {
        id: "1",
        username: "admin",
        name: "Sarah Chen",
        email: "admin@example.com",
        role: "admin",
        departmentId: "d1",
        departmentName: "IT",
        status: "active",
        grants: ["dashboard.read", "users.manage"],
        createdAt: "2026-04-16T00:00:00Z",
      },
    });

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "login" }));

    await waitFor(() => expect(screen.getByTestId("auth-state")).toHaveTextContent("authenticated"));
    expect(screen.getByTestId("username")).toHaveTextContent("admin");
    expect(screen.getByTestId("grant")).toHaveTextContent("has-grant");
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toContain("jwt-token");
  });

  it("restores an existing session and refreshes the current user", async () => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
      token: "seed-token",
      user: {
        id: "1",
        username: "admin",
        name: "Old Name",
        email: "admin@example.com",
        role: "admin",
        departmentId: "d1",
        departmentName: "IT",
        status: "active",
        grants: ["dashboard.read"],
        createdAt: "2026-04-16T00:00:00Z",
      },
    }));

    mockedMe.mockResolvedValue({
      id: "1",
      username: "admin",
      name: "Refreshed Name",
      email: "admin@example.com",
      role: "admin",
      departmentId: "d1",
      departmentName: "IT",
      status: "active",
      grants: ["dashboard.read", "users.manage"],
      createdAt: "2026-04-16T00:00:00Z",
    });

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("username")).toHaveTextContent("admin"));
    expect(screen.getByTestId("grant")).toHaveTextContent("has-grant");
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toContain("Refreshed Name");
  });

  it("returns to anonymous state when refresh fails", async () => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
      token: "seed-token",
      user: {
        id: "1",
        username: "admin",
        name: "Old Name",
        email: "admin@example.com",
        role: "admin",
        departmentId: "d1",
        departmentName: "IT",
        status: "active",
        grants: ["dashboard.read"],
        createdAt: "2026-04-16T00:00:00Z",
      },
    }));
    mockedMe.mockRejectedValue(new HttpError(401, "Unauthorized"));

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("auth-state")).toHaveTextContent("anonymous"));
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });
});
