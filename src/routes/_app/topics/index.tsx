import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar, Footer } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Beaker, ArrowRight, Search } from "lucide-react";

export const Route = createFileRoute("/_app/topics/")({
  head: () => ({ meta: [{ title: "Topics — NaijaTutor" }] }),
  component: TopicsList,
});

function TopicsList() {
  const [topics, setTopics] = useState<any[]>([]);
  const [q, setQ] = useState("");
  useEffect(() => { supabase.from("topics").select("*").order("order_index").then(({ data }) => setTopics(data || [])); }, []);
  const filtered = topics.filter(t => t.title.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />
      <main className="container mx-auto px-4 py-10 flex-1">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div><h1 className="text-3xl font-bold">Chemistry Topics</h1><p className="text-muted-foreground mt-1">8 core SSS Chemistry topics, with notes and adaptive quizzes.</p></div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search topics..." value={q} onChange={e => setQ(e.target.value)} />
          </div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(t => (
            <Link key={t.id} to="/_app/topics/$slug" params={{ slug: t.slug }}>
              <Card className="p-6 h-full shadow-card hover:shadow-elegant transition-all hover:-translate-y-0.5">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-hero text-primary-foreground mb-4"><Beaker className="h-6 w-6" /></div>
                <h3 className="font-semibold text-lg">{t.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{t.description}</p>
                <div className="mt-4 flex items-center text-sm text-primary font-medium">Open topic <ArrowRight className="ml-1 h-3.5 w-3.5" /></div>
              </Card>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
