import { createFileRoute } from "@tanstack/react-router";
import { Navbar, Footer } from "@/components/Navbar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "Who is NaijaTutor for?", a: "Senior Secondary School (SS1–SS3) Chemistry students in Nigeria, especially those preparing for WAEC, NECO and JAMB." },
  { q: "Is it free to use?", a: "Yes. You can register, take quizzes, and track progress at no cost." },
  { q: "How is the content selected?", a: "Topics and questions are aligned with the SSS Chemistry curriculum used by WAEC and NECO." },
  { q: "What does 'adaptive' mean here?", a: "After each attempt the platform tracks your accuracy and recommends harder questions when you're strong, easier ones and revision when you're weak." },
  { q: "Can teachers use it?", a: "Yes — teacher and admin accounts can manage topics, questions and student analytics." },
  { q: "Does it work offline?", a: "An internet connection is required, but the app works on any phone, tablet, or computer browser." },
];

export const Route = createFileRoute("/faq")({
  head: () => ({ meta: [
    { title: "FAQ — NaijaTutor" },
    { name: "description", content: "Answers to common questions about NaijaTutor's adaptive Chemistry learning platform." },
    { property: "og:title", content: "NaijaTutor FAQ" },
  ]}),
  component: () => (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container mx-auto px-4 py-20 max-w-3xl">
        <h1 className="text-4xl font-bold mb-10 text-center">Frequently asked questions</h1>
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map(f => (
            <AccordionItem key={f.q} value={f.q} className="border rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </main>
      <Footer />
    </div>
  ),
});
