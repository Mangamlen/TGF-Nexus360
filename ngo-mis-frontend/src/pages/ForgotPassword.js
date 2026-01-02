import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import API from "../services/api";
import { toast } from "react-toastify";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.warn("Please enter your email address.");
      return;
    }
    setLoading(true);
    try {
      const res = await API.post("/auth/forgot-password", { email });
      toast.success(res.data.message || "Password reset link sent to your email.");
      setEmail("");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to send password reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="mx-auto grid w-[350px] gap-6">
        <div className="grid gap-2 text-center">
          <h1 className="text-3xl font-bold">Forgot Password?</h1>
          <p className="text-balance text-muted-foreground">
            Enter your email below to receive a password reset link.
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </div>
        </form>
        <div className="mt-4 text-center text-sm">
          Remember your password?{" "}
          <Link to="/" className="underline text-primary hover:text-primary/90">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
