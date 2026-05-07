import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Navbar, Footer } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line, CartesianGrid } from "recharts";
import { Flame, Trophy, Target, BookOpen, ArrowRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — NaijaTutor" }] }),
  component: Dashboard,
});

interface Topic { id: string; slug: string; title: string; description: string | null; }
interface Attempt { id: string; topic_id: string; score: number; total: number; difficulty: string; completed_at: string; }

function Dashboard() {
  const { user } = useAuth();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [profile, setProfile] = useState<{ full_name: string | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [t, a, p] = await Promise.all([
        supabase.from("topics").select("id,slug,title,description").order("order_index"),
        supabase.from("quiz_attempts").select("id,topic_id,score,total,difficulty,completed_at").eq("user_id", user.id).order("completed_at", { ascending: false }),
        supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
      ]);
      setTopics(t.data || []); setAttempts(a.data || []); setProfile(p.data); setLoading(false);
    })();
  }, [user]);

  // Analytics
  const totalAttempts = attempts.length;
  const overallPct = totalAttempts ? Math.round((attempts.reduce((s, a) => s + a.score, 0) / attempts.reduce((s, a) => s + a.total, 0)) * 100) : 0;
  const topicsCompleted = new Set(attempts.map(a => a.topic_id)).size;

  const topicStats = topics.map(t => {
    const ta = attempts.filter(a => a.topic_id === t.id);
    const pct = ta.length ? Math.round((ta.reduce((s, x) => s + x.score, 0) / ta.reduce((s, x) => s + x.total, 0)) * 100) : 0;
    return { ...t, attempts: ta.length, pct };
  });
  const weak = topicStats.filter(t => t.attempts > 0 && t.pct < 60).sort((a, b) => a.pct - b.pct);
  const strong = topicStats.filter(t => t.attempts > 0 && t.pct >= 80);
  const recommended = weak[0] || topicStats.find(t => t.attempts === 0) || topicStats[0];

  // Streak
  const days = new Set(attempts.map(a => new Date(a.completed_at).toDateString()));
  let streak = 0; const d = new Date();
  while (days.has(d.toDateString())) { streak++; d.setDate(d.getDate() - 1); }

  const trend = [...attempts].slice(0, 10).reverse().map((a, i) => ({ name: `#${i + 1}`, score: Math.round((a.score / a.total) * 100) }));
  const chartData = topicStats.filter(t => t.attempts > 0).map(t => ({ name: t.title.split(" ")[0], score: t.pct }));

  if (loading) return <div className="min-h-screen grid place-items-center"><p className="text-muted-foreground">Loading...</p></div>;

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />
      <main className="container mx-auto px-4 py-10 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {profile?.full_name?.split(" ")[0] || "Student"} 👋</h1>
            <p className="text-muted-foreground mt-1">Here's your learning snapshot.</p>
          </div>
          <Button asChild className="bg-gradient-hero shadow-elegant"><Link to="/_app/topics">Browse Topics <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { i: Trophy, l: "Overall Score", v: `${overallPct}%`, c: "text-accent" },
            { i: BookOpen, l: "Topics Completed", v: `${topicsCompleted}/${topics.length}`, c: "text-primary" },
            { i: Target, l: "Quiz Attempts", v: totalAttempts, c: "text-secondary" },
            { i: Flame, l: "Day Streak", v: streak, c: "text-accent" },
          ].map(k => (
            <Card key={k.l} className="p-5 shadow-card">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">{k.l}</div>
                <k.i className={`h-5 w-5 ${k.c}`} />
              </div>
              <div className="text-3xl font-bold mt-2">{k.v}</div>
            </Card>
          ))}
        </div>

        {/* Recommendation */}
        {recommended && (
          <Card className="p-6 mb-8 bg-gradient-hero text-primary-foreground shadow-elegant border-0">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium opacity-90"><Sparkles className="h-4 w-4" /> Recommended for you</div>
                <h2 className="text-2xl font-bold mt-2">{recommended.title}</h2>
                <p className="opacity-85 text-sm mt-1">{recommended.attempts === 0 ? "Start with a beginner quiz to gauge your level." : `Your average is ${recommended.pct}% — let's strengthen this topic.`}</p>
              </div>
              <Button asChild size="lg" className="bg-gradient-accent text-accent-foreground shadow-elegant"><Link to="/_app/topics/$slug" params={{ slug: recommended.slug }}>Start Quiz</Link></Button>
            </div>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 lg:col-span-2 shadow-card">
            <h3 className="font-semibold mb-4">Topic Mastery</h3>
            {chartData.length === 0 ? <p className="text-sm text-muted-foreground py-12 text-center">Take a quiz to see your mastery.</p> : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 250)" />
                  <XAxis dataKey="name" fontSize={11} />
                  <YAxis domain={[0, 100]} fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="score" fill="oklch(0.38 0.16 258)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
          <Card className="p-6 shadow-card">
            <h3 className="font-semibold mb-4">Performance Trend</h3>
            {trend.length === 0 ? <p className="text-sm text-muted-foreground py-12 text-center">No data yet.</p> : (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 250)" />
                  <XAxis dataKey="name" fontSize={11} />
                  <YAxis domain={[0, 100]} fontSize={11} />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="oklch(0.74 0.16 55)" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 shadow-card">
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-destructive"><Target className="h-4 w-4" /> Weak Topics</h3>
            {weak.length === 0 ? <p className="text-sm text-muted-foreground">No weak topics yet — great work!</p> : (
              <ul className="space-y-3">{weak.slice(0, 4).map(t => (
                <li key={t.id} className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <Link to="/_app/topics/$slug" params={{ slug: t.slug }} className="font-medium hover:text-primary truncate block">{t.title}</Link>
                    <Progress value={t.pct} className="h-2 mt-1" />
                  </div>
                  <span className="text-sm font-semibold text-destructive">{t.pct}%</span>
                </li>
              ))}</ul>
            )}
          </Card>
          <Card className="p-6 shadow-card">
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-success"><Trophy className="h-4 w-4" /> Strong Topics</h3>
            {strong.length === 0 ? <p className="text-sm text-muted-foreground">Keep going to unlock your strong topics.</p> : (
              <ul className="space-y-3">{strong.slice(0, 4).map(t => (
                <li key={t.id} className="flex items-center justify-between gap-3">
                  <span className="font-medium">{t.title}</span>
                  <Badge className="bg-success text-success-foreground">{t.pct}%</Badge>
                </li>
              ))}</ul>
            )}
          </Card>
        </div>

        <Card className="p-6 shadow-card">
          <h3 className="font-semibold mb-4">Recent Quiz History</h3>
          {attempts.length === 0 ? <p className="text-sm text-muted-foreground">No quizzes yet. <Link to="/_app/topics" className="text-primary">Start your first one →</Link></p> : (
            <div className="divide-y">
              {attempts.slice(0, 8).map(a => {
                const topic = topics.find(t => t.id === a.topic_id);
                const pct = Math.round((a.score / a.total) * 100);
                return (
                  <div key={a.id} className="py-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium text-sm">{topic?.title}</div>
                      <div className="text-xs text-muted-foreground capitalize">{a.difficulty} • {new Date(a.completed_at).toLocaleDateString()}</div>
                    </div>
                    <Badge variant={pct >= 70 ? "default" : "secondary"}>{a.score}/{a.total} ({pct}%)</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </main>
      <Footer />
    </div>
  );
}
