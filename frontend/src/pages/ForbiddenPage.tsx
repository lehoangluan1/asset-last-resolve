import { useNavigate } from "react-router-dom";
import { StatusPage } from "@/components/StatusPage";

const ForbiddenPage = () => {
  const navigate = useNavigate();

  return (
    <StatusPage
      code="403"
      title="Forbidden"
      message="You are signed in, but you do not have permission to view this page or perform this action."
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

export default ForbiddenPage;
