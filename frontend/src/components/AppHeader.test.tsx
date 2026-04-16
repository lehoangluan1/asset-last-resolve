import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";
import { vi } from "vitest";

const mockedUseAuth = vi.fn();

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => mockedUseAuth(),
}));

vi.mock("@/components/NotificationPanel", () => ({
  NotificationBell: () => <div>Notifications</div>,
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
  },
}));

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{`${location.pathname}${location.search}`}</div>;
}

function renderHeader(route = "/assets") {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="*" element={<><AppHeader /><LocationProbe /></>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("AppHeader", () => {
  beforeEach(() => {
    mockedUseAuth.mockReturnValue({
      user: { name: "Admin User", role: "admin" },
      logout: vi.fn(),
    });
  });

  it("submits a trimmed query to the global search route", () => {
    renderHeader();
    fireEvent.change(screen.getByPlaceholderText("Search assets, users, requests..."), {
      target: { value: "  ThinkPad  " },
    });

    fireEvent.submit(screen.getByPlaceholderText("Search assets, users, requests...").closest("form") as HTMLFormElement);

    expect(screen.getByTestId("location")).toHaveTextContent("/search?q=ThinkPad");
  });

  it("ignores empty submissions", () => {
    renderHeader();
    fireEvent.change(screen.getByPlaceholderText("Search assets, users, requests..."), {
      target: { value: "   " },
    });

    fireEvent.submit(screen.getByPlaceholderText("Search assets, users, requests...").closest("form") as HTMLFormElement);

    expect(screen.getByTestId("location")).toHaveTextContent("/assets");
  });
});
