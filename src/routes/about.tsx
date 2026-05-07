import { createFileRoute } from "@tanstack/react-router";
import { Navbar, Footer } from "@/components/Navbar";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [
    { title: "About — NaijaTutor" },
    { name: "description", content: "Learn about NaijaTutor's mission to make adaptive Chemistry learning accessible to every Nigerian SSS student." },
    { property: "og:title", content: "About NaijaTutor" },
  ]}),
  component: () => (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container mx-auto px-4 py-20 max-w-3xl">
        <h1 className="text-4xl font-bold mb-6">About NaijaTutor</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          NaijaTutor is an adaptive learning platform built specifically for Nigerian Senior Secondary School students preparing for WAEC, NECO, and JAMB Chemistry exams. We combine carefully-curated, syllabus-aligned content with intelligent adaptive quizzes that adjust to each learner's pace.
        </p>
        <h2 className="text-2xl font-bold mt-10 mb-3">Our mission</h2>
        <p className="text-muted-foreground leading-relaxed">
          To remove the barriers that keep Nigerian students from mastering science. We believe every student deserves a personal tutor — and adaptive technology makes that possible at scale.
        </p>
        <h2 className="text-2xl font-bold mt-10 mb-3">How it works</h2>
        <p className="text-muted-foreground leading-relaxed">
          Take a quiz on any topic. NaijaTutor automatically adjusts the difficulty, identifies your weak areas, and recommends what to study next. Detailed analytics show your progress over time so you and your teachers know exactly where to focus.
        </p>
      </main>
      <Footer />
    </div>
  ),
});
