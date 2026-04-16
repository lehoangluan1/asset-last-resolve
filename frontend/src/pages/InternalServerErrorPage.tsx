import { useNavigate } from "react-router-dom";
import { StatusPage } from "@/components/StatusPage";

const InternalServerErrorPage = () => {
  const navigate = useNavigate();

  return (
    <StatusPage
      code="500"
      title="Internal Server Error"
      message="Something went wrong on our side while loading this page. Please try again or return to the dashboard."
      primaryAction={{
        label: "Retry",
        onClick: () => window.location.reload(),
      }}
      secondaryAction={{
        label: "Go to Dashboard",
        onClick: () => navigate("/", { replace: true }),
      }}
    />
  );
};

export default InternalServerErrorPage;
