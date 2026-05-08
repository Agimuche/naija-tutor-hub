import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { FlaskConical } from "lucide-react";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Reset password — NaijaTutor" }, { name: "description", content: "Reset your NaijaTutor password." }] }),
  component: ForgotPage,
});

function ForgotPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-hero p-4">
      <Card className="w-full max-w-md p-8 shadow-elegant">
        <Link to="/" className="flex items-center gap-2 font-bold mb-6">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-hero"><FlaskConical className="h-5 w-5 text-primary-foreground" /></div>
          NaijaTutor
        </Link>
        <h1 className="text-2xl font-bold">Forgot password?</h1>
        <p className="text-sm text-muted-foreground mt-1">We'll send a reset link to your email.</p>
        {sent ? (
          <div className="mt-6 p-4 rounded-lg bg-success/10 text-sm">Check your inbox for a password reset link.</div>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={async (e) => {
            e.preventDefault(); setLoading(true);
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
              redirectTo: `${window.location.origin}/reset-password`,
            });
            setLoading(false);
            if (error) return toast.error(error.message);
            setSent(true);
            toast.success("Reset link sent.");
          }}>
            <div><Label>Email</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <Button disabled={loading} className="w-full bg-gradient-hero shadow-elegant">{loading ? "Sending..." : "Send reset link"}</Button>
          </form>
        )}
        <p className="text-sm text-center mt-6 text-muted-foreground">Remembered it? <Link to="/login" className="text-primary font-medium">Sign in</Link></p>
      </Card>
    </div>
  );
}
