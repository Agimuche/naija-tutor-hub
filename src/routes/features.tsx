import { createFileRoute } from "@tanstack/react-router";
import { Navbar, Footer } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Brain, Target, TrendingUp, Trophy, BookOpen, Zap, Sparkles, BarChart3 } from "lucide-react";

const items = [
  { icon: Brain, t: "Adaptive Quiz Engine", d: "Difficulty rises and falls with your performance, keeping you in the optimal challenge zone." },
  { icon: Target, t: "Weak Topic Detection", d: "We track every answer to surface the exact concepts you need to revisit." },
  { icon: TrendingUp, t: "Progress Analytics", d: "Charts for accuracy, streaks, and topic mastery — built with Recharts." },
  { icon: BookOpen, t: "Syllabus-aligned Notes", d: "Markdown notes for all 8 core SSS Chemistry topics." },
  { icon: Zap, t: "Instant Explanations", d: "Every question shows why the right answer is right — and why others are not." },
  { icon: Trophy, t: "Streaks & Milestones", d: "Daily learning streaks keep you consistent." },
  { icon: Sparkles, t: "Personalised Recommendations", d: "Get suggested topics and difficulty levels tailored to you." },
  { icon: BarChart3, t: "Beautiful Dashboards", d: "A modern dashboard showing scores, history, and what to study next." },
];

export const Route = createFileRoute("/features")({
  head: () => ({ meta: [
    { title: "Features — NaijaTutor" },
    { name: "description", content: "Adaptive quizzes, analytics, recommendations and curriculum-aligned notes for Nigerian Chemistry students." },
    { property: "og:title", content: "NaijaTutor Features" },
  ]}),
  component: () => (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-bold">Features</h1>
          <p className="mt-4 text-muted-foreground text-lg">Everything you need to study Chemistry smarter.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((f) => (
            <Card key={f.t} className="p-6 shadow-card border-border/60">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-hero text-primary-foreground mb-4"><f.icon className="h-6 w-6" /></div>
              <h3 className="font-semibold">{f.t}</h3>
              <p className="text-sm text-muted-foreground mt-2">{f.d}</p>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  ),
});
