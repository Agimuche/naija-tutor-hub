import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { FlaskConical } from "lucide-react";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Register — NaijaTutor" }, { name: "description", content: "Create your NaijaTutor student account." }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: "", email: "", password: "", gender: "", school_name: "", class_level: "" });
  const [loading, setLoading] = useState(false);
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-hero p-4 py-10">
      <Card className="w-full max-w-lg p-8 shadow-elegant">
        <Link to="/" className="flex items-center gap-2 font-bold mb-6"><div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-hero"><FlaskConical className="h-5 w-5 text-primary-foreground" /></div>NaijaTutor</Link>
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="text-sm text-muted-foreground mt-1">Free forever. Start mastering Chemistry today.</p>
        <form className="mt-6 space-y-4" onSubmit={async (e) => {
          e.preventDefault();
          if (form.password.length < 6) return toast.error("Password must be at least 6 characters");
          setLoading(true);
          const { error } = await supabase.auth.signUp({
            email: form.email, password: form.password,
            options: { emailRedirectTo: `${window.location.origin}/dashboard`, data: { full_name: form.full_name, gender: form.gender, school_name: form.school_name, class_level: form.class_level } }
          });
          setLoading(false);
          if (error) return toast.error(error.message);
          toast.success("Account created!"); navigate({ to: "/dashboard" });
        }}>
          <div><Label>Full name</Label><Input required maxLength={100} value={form.full_name} onChange={e => set("full_name", e.target.value)} /></div>
          <div className="grid md:grid-cols-2 gap-4">
            <div><Label>Email</Label><Input type="email" required maxLength={255} value={form.email} onChange={e => set("email", e.target.value)} /></div>
            <div><Label>Password</Label><Input type="password" required minLength={6} value={form.password} onChange={e => set("password", e.target.value)} /></div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label>Gender</Label>
              <Select value={form.gender} onValueChange={(v) => set("gender", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent><SelectItem value="female">Female</SelectItem><SelectItem value="male">Male</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2"><Label>School</Label><Input maxLength={150} value={form.school_name} onChange={e => set("school_name", e.target.value)} /></div>
          </div>
          <div>
            <Label>Class level</Label>
            <Select value={form.class_level} onValueChange={(v) => set("class_level", v)}>
              <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
              <SelectContent><SelectItem value="SS1">SS1</SelectItem><SelectItem value="SS2">SS2</SelectItem><SelectItem value="SS3">SS3</SelectItem></SelectContent>
            </Select>
          </div>
          <Button disabled={loading} className="w-full bg-gradient-hero shadow-elegant">{loading ? "Creating..." : "Create account"}</Button>
        </form>
        <p className="text-sm text-center mt-6 text-muted-foreground">Already have an account? <Link to="/login" className="text-primary font-medium">Sign in</Link></p>
      </Card>
    </div>
  );
}
