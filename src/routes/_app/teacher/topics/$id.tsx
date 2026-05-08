import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Navbar, Footer } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Trash2, Plus, ArrowLeft, Save, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_app/teacher/topics/$id")({
  head: () => ({ meta: [{ title: "Edit Topic — NaijaTutor" }] }),
  component: EditTopic,
});

type Question = {
  id?: string;
  topic_id?: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  _isNew?: boolean;
};

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function EditTopic() {
  const { id } = Route.useParams();
  const { user, isTeacher, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const isNew = id === "new";

  const [topic, setTopic] = useState<any>({ title: "", slug: "", description: "", notes: "", published: false, order_index: 100 });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !isTeacher) navigate({ to: "/dashboard" });
  }, [authLoading, isTeacher, navigate]);

  useEffect(() => {
    if (isNew) return;
    (async () => {
      const { data: t } = await supabase.from("topics").select("*").eq("id", id).maybeSingle();
      const { data: qs } = await supabase.from("questions").select("*").eq("topic_id", id).order("difficulty");
      if (t) setTopic(t);
      setQuestions((qs || []).map((q: any) => ({ ...q, options: q.options as string[] })));
      setLoading(false);
    })();
  }, [id, isNew]);

  async function saveTopic(publish?: boolean) {
    if (!topic.title.trim()) return toast.error("Title is required.");
    setSaving(true);
    const slug = topic.slug?.trim() || slugify(topic.title);
    const payload = {
      title: topic.title.trim(),
      slug,
      description: topic.description || null,
      notes: topic.notes || null,
      order_index: topic.order_index ?? 100,
      published: publish ?? topic.published,
      created_by: user?.id,
    };
    let topicId = topic.id;
    if (isNew) {
      const { data, error } = await supabase.from("topics").insert(payload).select().single();
      setSaving(false);
      if (error) return toast.error(error.message);
      toast.success("Topic created.");
      navigate({ to: "/_app/teacher/topics/$id", params: { id: data.id } });
      return;
    } else {
      const { error } = await supabase.from("topics").update(payload).eq("id", topicId);
      if (error) { setSaving(false); return toast.error(error.message); }
    }

    // Save questions
    for (const q of questions) {
      if (!q.question.trim()) continue;
      if (q.options.some((o) => !o.trim())) continue;
      const data = {
        topic_id: topicId,
        question: q.question.trim(),
        options: q.options,
        correct_index: q.correct_index,
        explanation: q.explanation || null,
        difficulty: q.difficulty,
      };
      if (q._isNew || !q.id) {
        await supabase.from("questions").insert(data);
      } else {
        await supabase.from("questions").update(data).eq("id", q.id);
      }
    }
    setSaving(false);
    toast.success(publish ? "Published!" : "Saved.");
    if (publish !== undefined) setTopic({ ...topic, published: publish });
    // refresh
    const { data: qs } = await supabase.from("questions").select("*").eq("topic_id", topicId).order("difficulty");
    setQuestions((qs || []).map((q: any) => ({ ...q, options: q.options as string[] })));
  }

  function addQuestion(difficulty: Question["difficulty"]) {
    setQuestions((q) => [...q, { question: "", options: ["", "", "", ""], correct_index: 0, explanation: "", difficulty, _isNew: true }]);
  }

  async function removeQuestion(idx: number) {
    const q = questions[idx];
    if (q.id && !q._isNew) {
      const { error } = await supabase.from("questions").delete().eq("id", q.id);
      if (error) return toast.error(error.message);
    }
    setQuestions((qs) => qs.filter((_, i) => i !== idx));
  }

  async function deleteTopic() {
    if (!confirm("Delete this topic and all its questions?")) return;
    await supabase.from("questions").delete().eq("topic_id", id);
    const { error } = await supabase.from("topics").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Topic deleted.");
    navigate({ to: "/_app/teacher" });
  }

  if (loading || authLoading) return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />
      <main className="container mx-auto px-4 py-10 flex-1 max-w-5xl">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/_app/teacher" })} className="mb-4"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Studio</Button>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-3xl font-bold">{isNew ? "New Topic" : "Edit Topic"}</h1>
            {!isNew && <Badge className="mt-2" variant={topic.published ? "default" : "secondary"}>{topic.published ? "Published" : "Draft"}</Badge>}
          </div>
          <div className="flex gap-2">
            {!isNew && <Button variant="outline" onClick={deleteTopic}><Trash2 className="h-4 w-4 mr-2" /> Delete</Button>}
            <Button variant="outline" disabled={saving} onClick={() => saveTopic()}><Save className="h-4 w-4 mr-2" /> Save Draft</Button>
            <Button disabled={saving} onClick={() => saveTopic(true)} className="bg-gradient-hero shadow-elegant"><CheckCircle2 className="h-4 w-4 mr-2" /> {topic.published ? "Save & Publish" : "Publish"}</Button>
          </div>
        </div>

        <Tabs defaultValue="details">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="questions">Questions ({questions.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <Card className="p-6 shadow-card space-y-4">
              <div><Label>Title</Label><Input value={topic.title} onChange={(e) => setTopic({ ...topic, title: e.target.value, slug: topic.slug || slugify(e.target.value) })} /></div>
              <div><Label>Slug (URL)</Label><Input value={topic.slug} onChange={(e) => setTopic({ ...topic, slug: slugify(e.target.value) })} /></div>
              <div><Label>Description</Label><Textarea rows={3} value={topic.description ?? ""} onChange={(e) => setTopic({ ...topic, description: e.target.value })} /></div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><Label>Order index</Label><Input type="number" value={topic.order_index ?? 100} onChange={(e) => setTopic({ ...topic, order_index: parseInt(e.target.value || "0") })} /></div>
                <div className="flex items-end gap-3"><Switch checked={topic.published} onCheckedChange={(v) => setTopic({ ...topic, published: v })} /><Label>Published</Label></div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="notes">
            <Card className="p-6 shadow-card">
              <Label>Lesson notes (Markdown supported)</Label>
              <Textarea rows={20} className="font-mono text-sm mt-2" value={topic.notes ?? ""} onChange={(e) => setTopic({ ...topic, notes: e.target.value })} placeholder="## Introduction&#10;&#10;Write your lesson notes here..." />
            </Card>
          </TabsContent>

          <TabsContent value="questions">
            <div className="flex flex-wrap gap-2 mb-4">
              {(["beginner", "intermediate", "advanced"] as const).map((d) => (
                <Button key={d} variant="outline" size="sm" onClick={() => addQuestion(d)}>
                  <Plus className="h-3 w-3 mr-1.5" /> Add {d}
                </Button>
              ))}
            </div>
            <div className="space-y-4">
              {questions.map((q, idx) => (
                <Card key={idx} className="p-5 shadow-card">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <Badge className="capitalize">{q.difficulty}</Badge>
                      <span className="text-sm text-muted-foreground">Question {idx + 1}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select value={q.difficulty} onValueChange={(v: any) => setQuestions((qs) => qs.map((x, i) => i === idx ? { ...x, difficulty: v } : x))}>
                        <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="icon" onClick={() => removeQuestion(idx)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </div>
                  <Textarea placeholder="Question text" rows={2} value={q.question} onChange={(e) => setQuestions((qs) => qs.map((x, i) => i === idx ? { ...x, question: e.target.value } : x))} />
                  <div className="space-y-2 mt-3">
                    {q.options.map((opt, oi) => (
                      <div key={oi} className="flex items-center gap-2">
                        <input type="radio" name={`correct-${idx}`} checked={q.correct_index === oi} onChange={() => setQuestions((qs) => qs.map((x, i) => i === idx ? { ...x, correct_index: oi } : x))} className="h-4 w-4 accent-primary" />
                        <span className="font-semibold text-sm w-5">{String.fromCharCode(65 + oi)}.</span>
                        <Input value={opt} placeholder={`Option ${String.fromCharCode(65 + oi)}`} onChange={(e) => setQuestions((qs) => qs.map((x, i) => i === idx ? { ...x, options: x.options.map((o, j) => j === oi ? e.target.value : o) } : x))} />
                      </div>
                    ))}
                  </div>
                  <div className="mt-3"><Label className="text-xs">Explanation</Label><Textarea rows={2} value={q.explanation} onChange={(e) => setQuestions((qs) => qs.map((x, i) => i === idx ? { ...x, explanation: e.target.value } : x))} /></div>
                </Card>
              ))}
              {questions.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No questions yet. Add one above.</p>}
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
