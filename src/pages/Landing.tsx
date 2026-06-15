import React from "react";
import { Link } from "react-router-dom";
import { Receipt, NotebookPen, Clock, ArrowUpRight } from "lucide-react";

const tools = [
  {
    name: "Meter Reading",
    description: "Record electricity and water meter readings with advanced analytics.",
    icon: NotebookPen,
    path: "/meter-reading",
    primary: true,
    actions: [
      { name: "Record", path: "/meter-reading" },
      { name: "View", path: "/meter-reading/view" },
      { name: "Export", path: "/meter-reading/export" },
      { name: "Prices", path: "/meter-reading/utility-prices" },
    ],
  },
  {
    name: "WEB Tracker",
    description: "Track water and electricity bills over billing cycles.",
    icon: Receipt,
    path: "/web-tracker",
  },
  {
    name: "Time Tracker",
    description: "Track time spent on Airbnb management and maintenance.",
    icon: Clock,
    path: "/time-tracker",
  },
];

const Landing = () => {
  const primary = tools.find((t) => t.primary)!;
  const secondary = tools.filter((t) => !t.primary);

  return (
    <div className="min-h-[calc(100vh-8rem)] w-full bg-background">
      <div className="max-w-4xl w-full mx-auto px-6 md:px-12 py-12 md:py-16 space-y-10">
        {/* Header */}
        <header className="space-y-2 border-l-4 border-primary pl-6">
          <h1 className="text-4xl md:text-5xl font-bold text-accent tracking-tight">
            Tools
          </h1>
          <p className="text-primary/70 text-lg">
            Your personal productivity suite, refined.
          </p>
        </header>

        {/* Dashboard Grid */}
        <div className="grid gap-6">
          {/* Primary card with sub-actions */}
          <Link
            to={primary.path}
            className="group block bg-card border border-border/60 p-8 rounded-2xl hover:border-primary/40 transition-all duration-300 shadow-[var(--shadow-card)]"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-5">
                <div className="p-4 bg-primary/10 rounded-xl text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  <primary.icon className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-accent mb-1">
                    {primary.name}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {primary.description}
                  </p>
                </div>
              </div>

              <div
                className="flex flex-wrap gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                {primary.actions!.map((action) => (
                  <Link
                    key={action.name}
                    to={action.path}
                    className="px-4 py-2 bg-card border border-primary/20 text-accent rounded-lg text-sm font-medium hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                  >
                    {action.name}
                  </Link>
                ))}
              </div>
            </div>
          </Link>

          {/* Secondary cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {secondary.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.name}
                  to={tool.path}
                  className="group bg-card border border-border/60 p-8 rounded-2xl hover:border-primary/40 transition-all duration-300 shadow-[var(--shadow-card)] flex flex-col h-full"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary/5 rounded-lg text-primary/80 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-accent mb-1">
                          {tool.name}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {tool.description}
                        </p>
                      </div>
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-primary/40 group-hover:text-primary group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Section divider */}
        <div className="pt-12 border-t border-border/60 text-center">
          <p className="text-primary/40 text-sm font-medium uppercase tracking-[0.2em]">
            More tools coming soon
          </p>
        </div>
      </div>
    </div>
  );
};

export default Landing;
