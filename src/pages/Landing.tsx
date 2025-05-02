
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Droplet, Receipt, Table, FileText, NotebookPen, Clock } from "lucide-react";

const tools = [
  {
    name: "Meter reading recorder",
    description: "Quickly record your electricity and water meter readings",
    icon: <NotebookPen className="h-10 w-10 text-emerald-500" />,
    path: "/meter-reading",
    color: "bg-gradient-to-br from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200",
    iconBg: "bg-emerald-100",
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
    icon: <Receipt className="h-10 w-10 text-blue-500" />,
    path: "/web-tracker",
    color: "bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200",
    iconBg: "bg-blue-100"
  },
  {
    name: "Time Tracker",
    description: "Track time spent managing your Airbnbs",
    icon: <Clock className="h-10 w-10 text-purple-500" />,
    path: "/time-tracker",
    color: "bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200",
    iconBg: "bg-purple-100"
  }
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto py-16 px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Personal Tools Suite</h1>
          <p className="text-xl text-muted-foreground">
            One place for all your productivity tools
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tools.map((tool) => (
            <Card key={tool.name} className={`h-full transition-all duration-300 hover:shadow-lg ${tool.color}`}>
              <CardHeader>
                <div className={`${tool.iconBg} w-16 h-16 rounded-full flex items-center justify-center mb-4`}>
                  {tool.icon}
                </div>
                <CardTitle>{tool.name}</CardTitle>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                {tool.actions && (
                  <div className="space-y-2">
                    {tool.actions.map((action) => (
                      <Link 
                        key={action.name}
                        to={action.path}
                        className="block no-underline"
                      >
                        <Button 
                          variant="secondary" 
                          className="w-full justify-start"
                        >
                          {action.icon}
                          {action.name}
                        </Button>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
              {!tool.actions && (
                <CardFooter>
                  <Link to={tool.path} className="block w-full no-underline">
                    <Button variant="secondary" className="w-full">
                      Launch Tool
                    </Button>
                  </Link>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-20 text-muted-foreground">
          <p>More tools coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default Landing;
