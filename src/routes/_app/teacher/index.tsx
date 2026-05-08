import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Navbar, Footer } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, GraduationCap } from "lucide-react";

export const Route = createFileRoute("/_app/teacher/")({
  head: () => ({ meta: [{ title: "Teacher Dashboard — NaijaTutor" }] }),
  component: TeacherIndex,
});

function TeacherIndex() {
  const { isTeacher, loading } = useAuth();
  const navigate = useNavigate();
  const [topics, setTopics] = useState<any[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!loading && !isTeacher) navigate({ to: "/dashboard" });
  }, [loading, isTeacher, navigate]);

  useEffect(() => {
    (async () => {
      const { data: ts } = await supabase.from("topics").select("*").order("order_index");
      setTopics(ts || []);
      const { data: qs } = await supabase.from("questions").select("topic_id");
      const c: Record<string, number> = {};
      (qs || []).forEach((q: any) => { c[q.topic_id] = (c[q.topic_id] || 0) + 1; });
      setCounts(c);
    })();
  }, []);

  if (!isTeacher) return null;

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />
      <main className="container mx-auto px-4 py-10 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-hero text-primary-foreground"><GraduationCap className="h-6 w-6" /></div>
            <div>
              <h1 className="text-3xl font-bold">Teacher Studio</h1>
              <p className="text-muted-foreground text-sm">Create, edit, and publish chemistry topics & quizzes.</p>
            </div>
          </div>
          <Button asChild className="bg-gradient-hero shadow-elegant"><Link to="/_app/teacher/topics/new">
            <Plus className="h-4 w-4 mr-2" /> New Topic
          </Link></Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topics.map((t) => (
            <Card key={t.id} className="p-5 shadow-card hover:shadow-elegant transition-all">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold">{t.title}</h3>
                <Badge variant={t.published ? "default" : "secondary"}>{t.published ? "Published" : "Draft"}</Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{t.description}</p>
              <div className="text-xs text-muted-foreground mt-3">{counts[t.id] || 0} questions</div>
              <div className="flex gap-2 mt-4">
                <Button asChild size="sm" variant="outline" className="flex-1"><Link to="/_app/teacher/topics/$id" params={{ id: t.id }}>
                  <Pencil className="h-3 w-3 mr-1.5" /> Edit
                </Link></Button>
              </div>
            </Card>
          ))}
          {topics.length === 0 && <p className="text-muted-foreground text-sm col-span-full text-center py-12">No topics yet. Create your first one!</p>}
        </div>
      </main>
      <Footer />
    </div>
  );
}
