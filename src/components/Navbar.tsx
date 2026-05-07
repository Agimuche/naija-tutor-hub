import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { FlaskConical, LogOut } from "lucide-react";

export function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-hero shadow-elegant">
            <FlaskConical className="h-5 w-5 text-primary-foreground" />
          </div>
          <span>NaijaTutor</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link to="/features" className="text-muted-foreground hover:text-foreground transition-colors">Features</Link>
          <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">About</Link>
          <Link to="/faq" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</Link>
          <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/dashboard" })}>Dashboard</Button>
              <Button variant="ghost" size="icon" onClick={async () => { await signOut(); navigate({ to: "/" }); }}><LogOut className="h-4 w-4" /></Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/login" })}>Login</Button>
              <Button size="sm" className="bg-gradient-hero shadow-elegant" onClick={() => navigate({ to: "/register" })}>Get Started</Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-muted/30 mt-20">
      <div className="container mx-auto px-4 py-10 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} NaijaTutor — Adaptive Chemistry Learning for Nigerian Students.</p>
      </div>
    </footer>
  );
}
