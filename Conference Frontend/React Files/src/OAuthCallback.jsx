import { useContext, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "./AuthContext";

const destinationFor = (user) => {
  switch (user.role) {
    case "admin":
      return "/admin";
    case "reviewer":
      return user.isFirstLogin ? "/change-password" : "/reviewer-dashboard";
    case "chairperson":
      return "/chairperson";
    default:
      return "/paper-status";
  }
};

export default function OAuthCallback() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      navigate("/auth", { replace: true });
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      login(token);
      navigate(destinationFor(payload), { replace: true });
    } catch {
      navigate("/auth", { replace: true });
    }
  }, [login, navigate, searchParams]);

  return <div className="min-h-screen flex items-center justify-center">Signing you in…</div>;
}
