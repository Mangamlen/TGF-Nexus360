import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { saveAuth } from "../utils/auth";
import { toast } from "react-toastify";

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      // Decode token to get user info (role_id, employee_id)
      // This is a simplified approach. In a real app, you might want to call an API
      // to get full user details or decode the token securely on the backend.
      // For now, we'll assume the token contains basic user info needed by saveAuth
      // This assumes JWT_SECRET is available on frontend too, which is generally bad practice.
      // A better approach is to have the backend send user details alongside the token.
      
      // For this implementation, I'll parse the token to extract user_id, role_id, employee_id
      // This requires the token to be base64 encoded and readable on the client side,
      // which is typically how JWTs are structured (header.payload.signature)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const { id: user_id, role_id, employee_id } = payload;
        
        saveAuth(token, role_id, employee_id);
        toast.success("Login successful!");
        navigate("/dashboard");
      } catch (error) {
        console.error("Failed to parse token:", error);
        toast.error("Login failed. Could not process authentication token.");
        navigate("/");
      }
    } else {
      toast.error("Authentication failed. No token received.");
      navigate("/"); // Redirect to login on failure
    }
  }, [location, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <p className="text-muted-foreground">Processing authentication...</p>
    </div>
  );
}
