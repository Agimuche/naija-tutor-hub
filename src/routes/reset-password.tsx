import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { FlaskConical } from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Set new password — NaijaTutor" }] }),
  component: ResetPage,
});

function ResetPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-hero p-4">
      <Card className="w-full max-w-md p-8 shadow-elegant">
        <Link to="/" className="flex items-center gap-2 font-bold mb-6">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-hero"><FlaskConical className="h-5 w-5 text-primary-foreground" /></div>
          NaijaTutor
        </Link>
        <h1 className="text-2xl font-bold">Set a new password</h1>
        <form className="mt-6 space-y-4" onSubmit={async (e) => {
          e.preventDefault();
          if (password.length < 6) return toast.error("Password must be at least 6 characters.");
          if (password !== confirm) return toast.error("Passwords don't match.");
          setLoading(true);
          const { error } = await supabase.auth.updateUser({ password });
          setLoading(false);
          if (error) return toast.error(error.message);
          toast.success("Password updated.");
          navigate({ to: "/dashboard" });
        }}>
          <div><Label>New password</Label><Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          <div><Label>Confirm password</Label><Input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} /></div>
          <Button disabled={loading} className="w-full bg-gradient-hero shadow-elegant">{loading ? "Updating..." : "Update password"}</Button>
        </form>
      </Card>
    </div>
  );
}
