import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Navbar, Footer } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { User } from "lucide-react";

export const Route = createFileRoute("/_app/profile")({
  head: () => ({ meta: [{ title: "Profile — NaijaTutor" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [pwd, setPwd] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => setProfile(data ?? {
      id: user.id, full_name: "", gender: "", school_name: "", class_level: "",
    }));
  }, [user]);

  if (!profile) return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />
      <main className="container mx-auto px-4 py-10 flex-1 max-w-3xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-hero text-primary-foreground"><User className="h-6 w-6" /></div>
          <div>
            <h1 className="text-3xl font-bold">Your profile</h1>
            <p className="text-muted-foreground text-sm">{user?.email}</p>
          </div>
        </div>

        <Card className="p-8 shadow-card">
          <h2 className="font-semibold text-lg mb-4">Personal information</h2>
          <form className="grid sm:grid-cols-2 gap-4" onSubmit={async (e) => {
            e.preventDefault(); setSaving(true);
            const { error } = await supabase.from("profiles").update({
              full_name: profile.full_name, gender: profile.gender,
              school_name: profile.school_name, class_level: profile.class_level,
            }).eq("id", user!.id);
            setSaving(false);
            if (error) return toast.error(error.message);
            toast.success("Profile updated.");
          }}>
            <div className="sm:col-span-2"><Label>Full name</Label><Input value={profile.full_name ?? ""} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} /></div>
            <div><Label>Gender</Label><Input value={profile.gender ?? ""} onChange={(e) => setProfile({ ...profile, gender: e.target.value })} /></div>
            <div><Label>Class level</Label><Input value={profile.class_level ?? ""} onChange={(e) => setProfile({ ...profile, class_level: e.target.value })} placeholder="SSS1, SSS2, SSS3" /></div>
            <div className="sm:col-span-2"><Label>School</Label><Input value={profile.school_name ?? ""} onChange={(e) => setProfile({ ...profile, school_name: e.target.value })} /></div>
            <div className="sm:col-span-2"><Button disabled={saving} className="bg-gradient-hero shadow-elegant">{saving ? "Saving..." : "Save changes"}</Button></div>
          </form>
        </Card>

        <Card className="p-8 shadow-card mt-6">
          <h2 className="font-semibold text-lg mb-4">Change password</h2>
          <form className="space-y-4 max-w-sm" onSubmit={async (e) => {
            e.preventDefault();
            if (pwd.length < 6) return toast.error("Password must be at least 6 characters.");
            setPwdLoading(true);
            const { error } = await supabase.auth.updateUser({ password: pwd });
            setPwdLoading(false);
            if (error) return toast.error(error.message);
            setPwd(""); toast.success("Password updated.");
          }}>
            <div><Label>New password</Label><Input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} /></div>
            <Button disabled={pwdLoading} variant="outline">{pwdLoading ? "Updating..." : "Update password"}</Button>
          </form>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
