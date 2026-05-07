import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Navbar, Footer } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_app/topics/$slug")({
  component: TopicPage,
});

type Difficulty = "beginner" | "intermediate" | "advanced";

function TopicPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [topic, setTopic] = useState<any>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("beginner");
  const [questions, setQuestions] = useState<any[]>([]);
  const [active, setActive] = useState(false);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<{ q: string; chosen: number; correct: number }[]>([]);
  const [showExp, setShowExp] = useState(false);
  const [done, setDone] = useState(false);
  const [recommend, setRecommend] = useState<string>("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("topics").select("*").eq("slug", slug).maybeSingle();
      setTopic(data);
      // Adaptive default difficulty: based on user history for this topic
      if (data && user) {
        const { data: prev } = await supabase.from("quiz_attempts").select("score,total,difficulty").eq("user_id", user.id).eq("topic_id", data.id).order("completed_at", { ascending: false }).limit(3);
        if (prev && prev.length) {
          const avg = prev.reduce((s, a) => s + a.score / a.total, 0) / prev.length;
          setDifficulty(avg >= 0.8 ? "advanced" : avg >= 0.5 ? "intermediate" : "beginner");
        }
      }
    })();
  }, [slug, user]);

  async function startQuiz() {
    if (!topic) return;
    const { data } = await supabase.from("questions").select("*").eq("topic_id", topic.id).eq("difficulty", difficulty);
    if (!data || data.length === 0) return toast.error("No questions for this difficulty yet.");
    setQuestions([...data].sort(() => Math.random() - 0.5).slice(0, 4));
    setActive(true); setIdx(0); setSelected(null); setAnswers([]); setShowExp(false); setDone(false);
  }

  function submitAnswer() {
    if (selected === null) return;
    const q = questions[idx];
    setAnswers(a => [...a, { q: q.id, chosen: selected, correct: q.correct_index }]);
    setShowExp(true);
  }

  async function nextQ() {
    if (idx + 1 < questions.length) { setIdx(i => i + 1); setSelected(null); setShowExp(false); return; }
    // finish
    const score = answers.filter(a => a.chosen === a.correct).length;
    const total = questions.length;
    if (user) {
      await supabase.from("quiz_attempts").insert({ user_id: user.id, topic_id: topic.id, difficulty, score, total, answers });
    }
    const pct = score / total;
    setRecommend(pct >= 0.8 ? "Excellent! Try the next difficulty level." : pct >= 0.5 ? "Good — review missed questions then try again." : "Revise the notes above and retry the beginner quiz.");
    setDone(true);
  }

  if (!topic) return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading...</div>;

  const score = answers.filter(a => a.chosen === a.correct).length;

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />
      <main className="container mx-auto px-4 py-10 flex-1 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{topic.title}</h1>
          <p className="text-muted-foreground mt-2">{topic.description}</p>
        </div>

        <Tabs defaultValue="notes">
          <TabsList><TabsTrigger value="notes">Notes</TabsTrigger><TabsTrigger value="quiz">Quiz</TabsTrigger></TabsList>

          <TabsContent value="notes">
            <Card className="p-8 shadow-card">
              <article className="prose prose-slate max-w-none whitespace-pre-wrap text-sm leading-relaxed">{topic.notes}</article>
            </Card>
          </TabsContent>

          <TabsContent value="quiz">
            {!active && !done && (
              <Card className="p-8 shadow-card">
                <h3 className="font-semibold text-lg">Choose difficulty</h3>
                <p className="text-sm text-muted-foreground mt-1">We've suggested <Badge className="ml-1 capitalize">{difficulty}</Badge> based on your history.</p>
                <div className="flex gap-2 mt-4 flex-wrap">
                  {(["beginner", "intermediate", "advanced"] as Difficulty[]).map(d => (
                    <Button key={d} variant={difficulty === d ? "default" : "outline"} onClick={() => setDifficulty(d)} className={difficulty === d ? "bg-gradient-hero" : ""}>{d}</Button>
                  ))}
                </div>
                <Button onClick={startQuiz} size="lg" className="mt-6 bg-gradient-accent text-accent-foreground shadow-elegant">Start Quiz</Button>
              </Card>
            )}

            {active && !done && questions[idx] && (
              <Card className="p-8 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-muted-foreground">Question {idx + 1} of {questions.length}</div>
                  <Badge className="capitalize">{difficulty}</Badge>
                </div>
                <Progress value={((idx + (showExp ? 1 : 0)) / questions.length) * 100} className="mb-6" />
                <h3 className="font-semibold text-lg mb-5">{questions[idx].question}</h3>
                <div className="space-y-2">
                  {(questions[idx].options as string[]).map((opt, i) => {
                    const isCorrect = i === questions[idx].correct_index;
                    const isSelected = selected === i;
                    let cls = "border-border hover:border-primary";
                    if (showExp) {
                      if (isCorrect) cls = "border-success bg-success/10";
                      else if (isSelected) cls = "border-destructive bg-destructive/10";
                    } else if (isSelected) cls = "border-primary bg-primary/5";
                    return (
                      <button key={i} disabled={showExp} onClick={() => setSelected(i)} className={`w-full text-left p-4 rounded-lg border-2 transition-all ${cls}`}>
                        <div className="flex items-start gap-3">
                          <span className="font-semibold text-sm">{String.fromCharCode(65 + i)}.</span>
                          <span className="flex-1">{opt}</span>
                          {showExp && isCorrect && <CheckCircle2 className="h-5 w-5 text-success" />}
                          {showExp && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-destructive" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {showExp && (
                  <div className="mt-5 p-4 rounded-lg bg-muted text-sm">
                    <strong>Explanation:</strong> {questions[idx].explanation}
                  </div>
                )}
                <div className="mt-6 flex justify-end">
                  {!showExp ? <Button onClick={submitAnswer} disabled={selected === null} className="bg-gradient-hero">Submit</Button>
                    : <Button onClick={nextQ} className="bg-gradient-accent text-accent-foreground">{idx + 1 < questions.length ? "Next" : "Finish"}</Button>}
                </div>
              </Card>
            )}

            {done && (
              <Card className="p-8 shadow-card text-center">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-hero text-primary-foreground mx-auto mb-4"><Sparkles className="h-8 w-8" /></div>
                <h2 className="text-2xl font-bold">Quiz complete!</h2>
                <p className="text-4xl font-bold mt-4 text-primary">{score}/{questions.length}</p>
                <p className="text-muted-foreground mt-2">{Math.round((score / questions.length) * 100)}% accuracy</p>
                <div className="mt-6 p-4 rounded-lg bg-muted text-sm flex items-start gap-2 text-left">
                  <Sparkles className="h-4 w-4 text-accent shrink-0 mt-0.5" /> <span>{recommend}</span>
                </div>
                <div className="mt-6 flex gap-2 justify-center">
                  <Button variant="outline" onClick={() => { setActive(false); setDone(false); }}>Try Again</Button>
                  <Button onClick={() => navigate({ to: "/_app/dashboard" })} className="bg-gradient-hero">Back to Dashboard</Button>
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
