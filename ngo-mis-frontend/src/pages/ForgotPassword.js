import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export default function ForgotPassword() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md text-center">
        <h1 className="text-4xl font-bold mb-8">Work in Progress</h1>
        <p className="text-lg text-muted-foreground mb-8">
          This feature is not yet implemented. Please check back later.
        </p>
        <Button asChild>
          <Link to="/">Back to Login</Link>
        </Button>
      </div>
    </div>
  );
}
