import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Receipt, Table, FileText, NotebookPen, Clock, Tag, ArrowRight } from "lucide-react";

const tools = [
  {
    name: "Meter Reading",
    description: "Record electricity and water meter readings",
    icon: NotebookPen,
    path: "/meter-reading",
    actions: [
      { name: "Record", path: "/meter-reading" },
      { name: "View", path: "/meter-reading/view" },
      { name: "Export", path: "/meter-reading/export" },
      { name: "Prices", path: "/meter-reading/utility-prices" }
    ]
  },
  {
    name: "WEB Tracker",
    description: "Track water and electricity bills",
    icon: Receipt,
    path: "/web-tracker"
  },
  {
    name: "Time Tracker",
    description: "Track time spent on Airbnb management",
    icon: Clock,
    path: "/time-tracker"
  }
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-16 px-6">
        <header className="mb-16">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Tools
          </h1>
          <p className="text-muted-foreground mt-2">
            Personal productivity suite
          </p>
        </header>
        
        <div className="space-y-4">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Card 
                key={tool.name} 
                className="group border border-border/50 bg-card hover:border-border hover:shadow-sm transition-all duration-200"
              >
                <div className="flex items-start justify-between p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-lg bg-muted">
                      <Icon className="h-5 w-5 text-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-medium text-foreground">
                        {tool.name}
                      </CardTitle>
                      <CardDescription className="mt-1 text-sm">
                        {tool.description}
                      </CardDescription>
                      
                      {tool.actions && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {tool.actions.map((action) => (
                            <Link key={action.name} to={action.path}>
                              <Button 
                                variant="secondary" 
                                size="sm"
                                className="h-8 text-xs font-medium"
                              >
                                {action.name}
                              </Button>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {!tool.actions && (
                    <Link to={tool.path}>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-9 w-9 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
        
        <footer className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">
            More tools coming soon
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Landing;
