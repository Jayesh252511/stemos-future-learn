import { Link } from "@tanstack/react-router";
import { Sparkles, Github, Twitter, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t mt-32">
      <div className="mx-auto max-w-7xl px-6 py-16 grid gap-12 md:grid-cols-5">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-hero flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-semibold">STEMOS</span>
          </div>
          <p className="mt-4 text-sm text-muted-foreground max-w-xs">
            The AI-powered learning operating system for the next generation of STEM students.
          </p>
          <div className="flex gap-3 mt-6">
            {[Twitter, Github, Linkedin].map((Icon, i) => (
              <a key={i} href="#" className="h-9 w-9 rounded-lg border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {[
          { title: "Product", links: [["AI Tutor", "/tutor"], ["Quizzes", "/quiz"], ["Learning Paths", "/paths"], ["Dashboard", "/dashboard"]] },
          { title: "Subjects", links: [["Mathematics", "/paths"], ["Physics", "/paths"], ["Chemistry", "/paths"], ["Programming", "/paths"]] },
          { title: "Company", links: [["About", "#"], ["Careers", "#"], ["Pricing", "/#pricing"], ["Contact", "#"]] },
        ].map((col) => (
          <div key={col.title}>
            <h4 className="text-sm font-semibold mb-4">{col.title}</h4>
            <ul className="space-y-2.5">
              {col.links.map(([label, to]) => (
                <li key={label}>
                  <Link to={to} className="text-sm text-muted-foreground hover:text-foreground transition">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t">
        <div className="mx-auto max-w-7xl px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">© 2026 STEMOS Inc. All rights reserved.</p>
          <p className="text-xs text-muted-foreground">Built for curious minds.</p>
        </div>
      </div>
    </footer>
  );
}
