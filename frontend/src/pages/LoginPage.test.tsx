import { fireEvent, screen, waitFor } from "@testing-library/react";
import LoginPage from "@/pages/LoginPage";
import { renderWithProviders } from "@/test/render";
import { vi } from "vitest";

const mockedUseAuth = vi.fn();
const successToast = vi.fn();

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => mockedUseAuth(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => successToast(...args),
  },
}));

describe("LoginPage", () => {
  it("shows a validation error when fields are empty", async () => {
    mockedUseAuth.mockReturnValue({ login: vi.fn() });

    renderWithProviders(<LoginPage />);
    fireEvent.click(screen.getByRole("button", { name: "Sign In" }));

    expect(await screen.findByText("Please enter both username and password")).toBeInTheDocument();
  });

  it("submits demo account login from the quick-login list", async () => {
    const login = vi.fn().mockResolvedValue({ success: true });
    mockedUseAuth.mockReturnValue({ login });

    renderWithProviders(<LoginPage />);
    fireEvent.click(screen.getByRole("button", { name: /admin administrator/i }));

    await waitFor(() => expect(login).toHaveBeenCalledWith("admin", "demo123"));
    expect(successToast).toHaveBeenCalledWith("Welcome back!");
  });
});
