import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar, Footer } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Brain, Target, TrendingUp, Trophy, BookOpen, Zap, Star, ArrowRight, FlaskConical } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NaijaTutor — Adaptive SSS Chemistry Learning" },
      { name: "description", content: "Personalized chemistry quizzes, adaptive recommendations, and progress analytics for Nigerian Senior Secondary students." },
    ],
  }),
  component: Index,
});

const features = [
  { icon: Brain, title: "Adaptive Quizzes", desc: "Smart engine adjusts difficulty based on your performance." },
  { icon: Target, title: "Personal Recommendations", desc: "Targeted revision for your weakest topics." },
  { icon: TrendingUp, title: "Progress Analytics", desc: "Beautiful charts track your mastery over time." },
  { icon: BookOpen, title: "Curriculum-aligned Notes", desc: "Notes mapped to WAEC and NECO Chemistry syllabus." },
  { icon: Zap, title: "Instant Feedback", desc: "Detailed explanations after every question." },
  { icon: Trophy, title: "Learning Streaks", desc: "Stay motivated with daily streaks and milestones." },
];

const stats = [
  { v: "8", l: "Core Topics" },
  { v: "100+", l: "Practice Questions" },
  { v: "3", l: "Difficulty Levels" },
  { v: "24/7", l: "Anywhere Access" },
];

const testimonials = [
  { name: "Chinwe O.", school: "FGGC Owerri", quote: "The adaptive quizzes helped me finally understand stoichiometry. My WAEC mock score jumped 22 points!" },
  { name: "Tunde A.", school: "Kings College Lagos", quote: "I love the instant explanations. It's like having a chemistry tutor in my pocket." },
  { name: "Aisha M.", school: "QC Kaduna", quote: "The weak-topic recommendations are spot on. I knew exactly what to revise." },
];

function Index() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-95" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,oklch(0.7_0.15_215/0.3),transparent_60%)]" />
        <div className="container mx-auto px-4 py-24 md:py-36 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl text-primary-foreground">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur px-4 py-1.5 text-xs font-medium ring-1 ring-white/20">
              <FlaskConical className="h-3.5 w-3.5" /> Built for Nigerian SSS Chemistry students
            </span>
            <h1 className="mt-6 text-4xl md:text-6xl font-bold leading-[1.05]">
              Master Chemistry with <span className="bg-gradient-accent bg-clip-text text-transparent">adaptive learning</span> that fits you.
            </h1>
            <p className="mt-6 text-lg md:text-xl text-white/85 max-w-2xl">
              NaijaTutor personalises every quiz, identifies your weak topics, and guides you to your best WAEC and NECO results.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-gradient-accent text-accent-foreground shadow-elegant hover:opacity-95">
                <Link to="/register">Start Learning Free <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white/20">
                <Link to="/features">Explore Features</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section className="container mx-auto px-4 -mt-10 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <Card key={s.l} className="p-6 text-center shadow-card border-border/60">
              <div className="text-3xl md:text-4xl font-bold text-primary">{s.v}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.l}</div>
            </Card>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="container mx-auto px-4 py-24">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl md:text-4xl font-bold">Everything you need to ace Chemistry</h2>
          <p className="mt-4 text-muted-foreground">A complete adaptive learning toolkit, designed around how Nigerian students actually study.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <Card className="p-6 h-full shadow-card hover:shadow-elegant transition-shadow border-border/60">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-hero text-primary-foreground mb-4">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg">{f.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">{f.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-muted/30 py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl md:text-4xl font-bold mb-14">Loved by students across Nigeria</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <Card key={t.name} className="p-6 shadow-card border-border/60">
                <div className="flex gap-1 text-accent mb-3">{[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}</div>
                <p className="text-sm leading-relaxed">"{t.quote}"</p>
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.school}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ preview */}
      <section className="container mx-auto px-4 py-24 max-w-3xl">
        <h2 className="text-center text-3xl md:text-4xl font-bold mb-10">Frequently asked questions</h2>
        <Accordion type="single" collapsible className="space-y-3">
          {[
            { q: "Is NaijaTutor free?", a: "Yes — sign up and start learning all 8 core SSS Chemistry topics today." },
            { q: "Does it work on phones?", a: "Absolutely. NaijaTutor is fully responsive and works on any device." },
            { q: "Is the content WAEC/NECO aligned?", a: "Yes, content is structured around the SSS Chemistry curriculum." },
            { q: "How does adaptive learning work?", a: "We track your performance and adjust question difficulty and recommendations in real time." },
          ].map((f) => (
            <AccordionItem key={f.q} value={f.q} className="border rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 pb-24">
        <Card className="overflow-hidden border-0 bg-gradient-hero text-primary-foreground shadow-elegant">
          <div className="p-10 md:p-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold">Ready to transform your Chemistry grades?</h2>
            <p className="mt-4 text-white/85 max-w-xl mx-auto">Join thousands of Nigerian students learning smarter, not harder.</p>
            <Button asChild size="lg" className="mt-8 bg-gradient-accent text-accent-foreground shadow-elegant">
              <Link to="/register">Create Free Account <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </Card>
      </section>
      <Footer />
    </div>
  );
}
