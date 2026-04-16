import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthRoute, ProtectedRoutes, RequireGrant } from "@/components/auth/RouteGuards";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import AssetsPage from "./pages/AssetsPage";
import AssetDetailPage from "./pages/AssetDetailPage";
import AssetFormPage from "./pages/AssetFormPage";
import AssignmentsPage from "./pages/AssignmentsPage";
import BorrowRequestsPage from "./pages/BorrowRequestsPage";
import VerificationPage from "./pages/VerificationPage";
import DiscrepanciesPage from "./pages/DiscrepanciesPage";
import MaintenancePage from "./pages/MaintenancePage";
import DisposalPage from "./pages/DisposalPage";
import ReportsPage from "./pages/ReportsPage";
import AdminPage from "./pages/AdminPage";
import UserManagementPage from "./pages/UserManagementPage";
import ProfilePage from "./pages/ProfilePage";
import NotificationsPage from "./pages/NotificationsPage";
import SearchResultsPage from "./pages/SearchResultsPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import ForbiddenPage from "./pages/ForbiddenPage";
import InternalServerErrorPage from "./pages/InternalServerErrorPage";
import NotFound from "./pages/NotFound";
import { grants } from "@/lib/permissions";
import { ROUTER_BASENAME } from "@/lib/env";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter basename={ROUTER_BASENAME}>
          <Routes>
            <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
            <Route path="/401" element={<UnauthorizedPage />} />
            <Route path="/403" element={<ForbiddenPage />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="/500" element={<InternalServerErrorPage />} />
            <Route element={<ProtectedRoutes />}>
              <Route path="/" element={<RequireGrant grant={grants.dashboardRead}><DashboardPage /></RequireGrant>} />
              <Route path="/assets" element={<RequireGrant grant={grants.assetsRead}><AssetsPage /></RequireGrant>} />
              <Route path="/assets/new" element={<RequireGrant grant={grants.assetsManage}><AssetFormPage /></RequireGrant>} />
              <Route path="/assets/:id" element={<RequireGrant grant={grants.assetsRead}><AssetDetailPage /></RequireGrant>} />
              <Route path="/assets/:id/edit" element={<RequireGrant grant={grants.assetsManage}><AssetFormPage /></RequireGrant>} />
              <Route path="/assignments" element={<RequireGrant grant={grants.assignmentsRead}><AssignmentsPage /></RequireGrant>} />
              <Route path="/borrow-requests" element={<RequireGrant grant={grants.borrowsRead}><BorrowRequestsPage /></RequireGrant>} />
              <Route path="/verification" element={<RequireGrant grant={grants.verificationRead}><VerificationPage /></RequireGrant>} />
              <Route path="/discrepancies" element={<RequireGrant grant={grants.discrepanciesRead}><DiscrepanciesPage /></RequireGrant>} />
              <Route path="/maintenance" element={<RequireGrant grant={grants.maintenanceRead}><MaintenancePage /></RequireGrant>} />
              <Route path="/disposal" element={<RequireGrant grant={grants.disposalRead}><DisposalPage /></RequireGrant>} />
              <Route path="/reports" element={<RequireGrant grant={grants.reportsRead}><ReportsPage /></RequireGrant>} />
              <Route path="/admin" element={<RequireGrant grant={grants.referenceManage}><AdminPage /></RequireGrant>} />
              <Route path="/users" element={<RequireGrant grant={grants.usersManage}><UserManagementPage /></RequireGrant>} />
              <Route path="/profile" element={<RequireGrant grant={grants.profileRead}><ProfilePage /></RequireGrant>} />
              <Route path="/notifications" element={<RequireGrant grant={grants.notificationsRead}><NotificationsPage /></RequireGrant>} />
              <Route path="/search" element={<SearchResultsPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
