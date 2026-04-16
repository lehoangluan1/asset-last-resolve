import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { StatusPage } from "@/components/StatusPage";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <StatusPage
      code="404"
      title="Page Not Found"
      message="The page or resource you were looking for does not exist, may have moved, or is not available from this URL."
      primaryAction={{
        label: "Go to Dashboard",
        onClick: () => navigate("/", { replace: true }),
      }}
      secondaryAction={{
        label: "Go Back",
        onClick: () => navigate(-1),
      }}
    />
  );
};

export default NotFound;
