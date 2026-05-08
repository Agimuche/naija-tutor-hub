import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { FlaskConical } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login — NaijaTutor" }, { name: "description", content: "Login to your NaijaTutor account." }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [loading, setLoading] = useState(false);
  return (
    <div className="min-h-screen grid place-items-center bg-gradient-hero p-4">
      <Card className="w-full max-w-md p-8 shadow-elegant">
        <Link to="/" className="flex items-center gap-2 font-bold mb-6"><div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-hero"><FlaskConical className="h-5 w-5 text-primary-foreground" /></div>NaijaTutor</Link>
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-sm text-muted-foreground mt-1">Sign in to continue learning.</p>
        <form className="mt-6 space-y-4" onSubmit={async (e) => {
          e.preventDefault(); setLoading(true);
          const { error } = await supabase.auth.signInWithPassword({ email, password });
          setLoading(false);
          if (error) return toast.error(error.message);
          toast.success("Welcome back!"); navigate({ to: "/dashboard" });
        }}>
          <div><Label>Email</Label><Input type="email" required value={email} onChange={e => setEmail(e.target.value)} /></div>
          <div><Label>Password</Label><Input type="password" required value={password} onChange={e => setPassword(e.target.value)} /></div>
          <Button disabled={loading} className="w-full bg-gradient-hero shadow-elegant">{loading ? "Signing in..." : "Sign in"}</Button>
        </form>
        <p className="text-sm text-center mt-3"><Link to="/forgot-password" className="text-muted-foreground hover:text-primary">Forgot password?</Link></p>
        <p className="text-sm text-center mt-6 text-muted-foreground">Don't have an account? <Link to="/register" className="text-primary font-medium">Create one</Link></p>
      </Card>
    </div>
  );
}
