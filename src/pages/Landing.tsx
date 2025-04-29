
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Droplet, Receipt, Table, FileText, NotebookPen } from "lucide-react";

const tools = [
  {
    name: "Meter reading recorder",
    description: "Quickly record your electricity and water meter readings",
    icon: <NotebookPen className="h-12 w-12 text-emerald-500" />,
    path: "/meter-reading",
    color: "bg-gradient-to-br from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200",
    iconBg: "bg-emerald-100/60",
    actions: [
      {
        name: "Record Reading",
        icon: <NotebookPen className="h-4 w-4" />,
        path: "/meter-reading"
      },
      {
        name: "View Data",
        icon: <Table className="h-4 w-4" />,
        path: "/meter-reading/view"
      },
      {
        name: "Export CSV",
        icon: <FileText className="h-4 w-4" />,
        path: "/meter-reading/export"
      }
    ]
  },
  {
    name: "WEB Tracker",
    description: "Track all water and electricity bills in one place",
    icon: <Receipt className="h-12 w-12 text-blue-500" />,
    path: "/web-tracker",
    color: "bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200",
    iconBg: "bg-blue-100/60"
  }
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 pb-12">
      <div className="container mx-auto py-24 px-4">
        <div className="text-center mb-20">
          <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            Personal Tools Suite
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your complete solution for home utilities management and tracking
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tools.map((tool) => (
            <Card 
              key={tool.name} 
              className={`h-full transition-all duration-300 hover:shadow-xl rounded-xl border border-transparent hover:border-muted ${tool.color}`}
            >
              <CardHeader>
                <div className="flex items-center justify-center mb-6">
                  <div className={`${tool.iconBg} w-20 h-20 rounded-2xl flex items-center justify-center shadow-sm`}>
                    {tool.icon}
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-center">{tool.name}</CardTitle>
                <CardDescription className="text-center text-base mt-2">{tool.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                {tool.actions && (
                  <div className="space-y-3">
                    {tool.actions.map((action) => (
                      <Link 
                        key={action.name}
                        to={action.path}
                        className="block no-underline"
                      >
                        <Button 
                          variant="secondary" 
                          className="w-full justify-start gap-2 rounded-lg shadow-sm hover:shadow bg-white/80"
                        >
                          {action.icon}
                          <span>{action.name}</span>
                        </Button>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
              {!tool.actions && (
                <CardFooter className="pt-2">
                  <Link to={tool.path} className="block w-full no-underline">
                    <Button 
                      variant="secondary" 
                      className="w-full gap-2 rounded-lg shadow-sm hover:shadow bg-white/80"
                    >
                      <Receipt className="h-4 w-4" />
                      <span>Launch Tool</span>
                    </Button>
                  </Link>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-20">
          <p className="text-muted-foreground/80">More tools coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default Landing;
