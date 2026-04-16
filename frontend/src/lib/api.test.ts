import { AUTH_STORAGE_KEY } from "@/lib/auth-storage";
import { api, HttpError } from "@/lib/api";
import { vi } from "vitest";

describe("api client", () => {
  it("attaches the stored bearer token to authenticated requests", async () => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
      token: "seed-token",
      user: {
        id: "1",
        username: "admin",
        name: "Admin",
        email: "admin@example.com",
        role: "admin",
        departmentId: "d1",
        departmentName: "IT",
        status: "active",
        grants: ["dashboard.read"],
        createdAt: "2026-04-16T00:00:00Z",
      },
    }));

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
      id: "1",
      username: "admin",
      name: "Admin",
      email: "admin@example.com",
      role: "admin",
      departmentId: "d1",
      departmentName: "IT",
      status: "active",
      grants: ["dashboard.read"],
      createdAt: "2026-04-16T00:00:00Z",
    }), { status: 200 }));

    await api.auth.me();

    const [, init] = fetchSpy.mock.calls[0];
    expect(new Headers(init?.headers).get("Authorization")).toBe("Bearer seed-token");
  });

  it("clears the session and dispatches an unauthorized event on 401 responses", async () => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
      token: "seed-token",
      user: {
        id: "1",
        username: "admin",
        name: "Admin",
        email: "admin@example.com",
        role: "admin",
        departmentId: "d1",
        departmentName: "IT",
        status: "active",
        grants: ["dashboard.read"],
        createdAt: "2026-04-16T00:00:00Z",
      },
    }));

    const unauthorizedHandler = vi.fn();
    window.addEventListener("auth:unauthorized", unauthorizedHandler);
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
      status: 401,
      error: "Unauthorized",
      message: "Unauthorized",
      path: "/api/auth/me",
      timestamp: "2026-04-16T00:00:00Z",
    }), { status: 401 }));

    await expect(api.auth.me()).rejects.toBeInstanceOf(HttpError);
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
    expect(unauthorizedHandler).toHaveBeenCalled();
  });
});
