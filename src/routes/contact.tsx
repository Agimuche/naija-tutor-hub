import { createFileRoute } from "@tanstack/react-router";
import { Navbar, Footer } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [
    { title: "Contact — NaijaTutor" },
    { name: "description", content: "Get in touch with the NaijaTutor team." },
    { property: "og:title", content: "Contact NaijaTutor" },
  ]}),
  component: ContactPage,
});

function ContactPage() {
  const [sending, setSending] = useState(false);
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container mx-auto px-4 py-20 max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold">Contact us</h1>
          <p className="mt-3 text-muted-foreground">We'd love to hear from students, teachers, and schools.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-4 md:col-span-1">
            {[
              { i: Mail, t: "Email", v: "hello@naijatutor.ng" },
              { i: Phone, t: "Phone", v: "+234 800 000 0000" },
              { i: MapPin, t: "Office", v: "Lagos, Nigeria" },
            ].map(c => (
              <Card key={c.t} className="p-5 flex items-start gap-3 shadow-card">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-hero text-primary-foreground"><c.i className="h-5 w-5" /></div>
                <div><div className="font-semibold text-sm">{c.t}</div><div className="text-sm text-muted-foreground">{c.v}</div></div>
              </Card>
            ))}
          </div>
          <Card className="md:col-span-2 p-8 shadow-card">
            <form onSubmit={(e) => { e.preventDefault(); setSending(true); setTimeout(() => { setSending(false); toast.success("Message sent! We'll respond shortly."); (e.target as HTMLFormElement).reset(); }, 600); }} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div><Label>Name</Label><Input required maxLength={100} /></div>
                <div><Label>Email</Label><Input required type="email" maxLength={255} /></div>
              </div>
              <div><Label>Message</Label><Textarea required rows={5} maxLength={1000} /></div>
              <Button disabled={sending} className="bg-gradient-hero shadow-elegant">{sending ? "Sending..." : "Send message"}</Button>
            </form>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
