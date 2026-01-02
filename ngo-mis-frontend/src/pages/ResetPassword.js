import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import API from "../services/api";
import { toast } from "react-toastify";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { token } = useParams(); // Get token from URL

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
        toast.error("Password must be at least 6 characters long.");
        return;
    }

    setLoading(true);
    try {
      const res = await API.post(`/auth/reset-password/${token}`, { newPassword });
      toast.success(res.data.message || "Your password has been reset successfully.");
      navigate("/"); // Redirect to login page
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to reset password. Invalid or expired token.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="mx-auto grid w-[350px] gap-6">
        <div className="grid gap-2 text-center">
          <h1 className="text-3xl font-bold">Reset Your Password</h1>
          <p className="text-balance text-muted-foreground">
            Enter your new password below.
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </div>
        </form>
        <div className="mt-4 text-center text-sm">
          <Link to="/" className="underline text-primary hover:text-primary/90">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
