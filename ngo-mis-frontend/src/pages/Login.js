import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import { saveAuth } from "../utils/auth";
import { Button } from "../components/ui/button";

import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "react-toastify";
import { Chrome, Apple } from "lucide-react"; // Building icon for logo

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return toast.warn("Please enter both email and password.");
    }
    setLoading(true);
    try {
      const res = await API.post("/auth/login", { email, password });
      saveAuth(res.data.token, res.data.user.role_id, res.data.user.employee_id);
      if (res.data.user.role_id === 1) { // Assuming role_id 1 is Admin
        navigate("/dashboard");
      } else {
        navigate("/reports");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="hidden bg-primary lg:flex lg:flex-col items-center justify-center text-primary-foreground p-12">
        <div className="text-center">
            <img src="/images/GF_logo.jpg" alt="GF Logo" className="h-24 w-24 mx-auto mb-4 rounded-lg shadow-lg" />
            <h1 className="text-4xl font-bold mb-2">TGF Nexus360</h1>
            <p className="text-lg text-primary-foreground/90">
                Streamlining operations for a brighter future.
            </p>
        </div>
      </div>
      <div className="flex items-center justify-center py-12 px-4 min-h-screen bg-background">
        <div className="mx-auto grid w-[350px] gap-6">
           <div className="grid gap-2 text-center">
             <h1 className="text-3xl font-bold">Welcome Back!</h1>
             <p className="text-balance text-muted-foreground">
               Enter your credentials to access your account
             </p>
           </div>
           <form onSubmit={handleLogin}>
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
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="/forgot-password"
                    className="ml-auto inline-block text-sm underline text-primary hover:text-primary/90"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>
            </div>
          </form>
           <div className="relative my-4">
             <div className="absolute inset-0 flex items-center">
               <span className="w-full border-t" />
             </div>
             <div className="relative flex justify-center text-xs uppercase">
               <span className="bg-background px-2 text-muted-foreground">
                 Or continue with
               </span>
             </div>
           </div>
           <div className="grid grid-cols-2 gap-4">
            <Button variant="outline">
                <Apple className="mr-2 h-4 w-4" />
                Apple ID
            </Button>
            <a href="http://localhost:5000/api/auth/google">
              <Button variant="outline" className="w-full">
                  <Chrome className="mr-2 h-4 w-4" />
                  Google
              </Button>
            </a>
           </div>
        </div>
      </div>
    </div>
  );
}
