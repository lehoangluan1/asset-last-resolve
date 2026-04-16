import { useNavigate } from "react-router-dom";
import { StatusPage } from "@/components/StatusPage";
import { useAuth } from "@/contexts/AuthContext";

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <StatusPage
      code="401"
      title="Unauthorized"
      message="Your session is missing or has expired. Please sign in again to continue using the workspace."
      primaryAction={{
        label: "Login Again",
        onClick: () => {
          logout();
          navigate("/login", { replace: true });
        },
      }}
      secondaryAction={{
        label: "Go Back",
        onClick: () => navigate(-1),
      }}
      tertiaryAction={{
        label: "Go to Dashboard",
        onClick: () => navigate("/", { replace: true }),
      }}
    />
  );
};

export default UnauthorizedPage;
