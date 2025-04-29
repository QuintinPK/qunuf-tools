
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Droplet, Receipt, Table, FileText, NotebookPen, ArrowRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const tools = [
  {
    name: "Meter Reading Recorder",
    description: "Record your utility meter readings and track your consumption over time",
    icon: <NotebookPen className="h-12 w-12 text-emerald-500" />,
    path: "/meter-reading",
    color: "from-emerald-50 to-emerald-100",
    hoverColor: "from-emerald-100 to-emerald-200",
    iconBg: "bg-emerald-100",
    iconRing: "ring-emerald-200",
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
    description: "Track all water and electricity bills in one centralized dashboard",
    icon: <Receipt className="h-12 w-12 text-blue-500" />,
    path: "/web-tracker",
    color: "from-blue-50 to-blue-100",
    hoverColor: "from-blue-100 to-blue-200",
    iconBg: "bg-blue-100",
    iconRing: "ring-blue-200"
  }
];

const Landing = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pb-12">
      <div className="container mx-auto py-12 px-4 sm:px-6">
        {/* Header with gradient text */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Personal Tools Suite
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Streamline your household utilities tracking and management
          </p>
        </div>
        
        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {tools.map((tool) => (
            <Card 
              key={tool.name} 
              className={`h-full transition-all duration-300 hover:shadow-lg border-0 bg-gradient-to-br ${tool.color} hover:${tool.hoverColor} rounded-xl overflow-hidden transform hover:-translate-y-1`}
            >
              <CardHeader className="pb-2">
                <div className={`${tool.iconBg} w-20 h-20 rounded-2xl flex items-center justify-center mb-4 shadow-md ring-2 ${tool.iconRing}`}>
                  {tool.icon}
                </div>
                <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">{tool.name}</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300 text-base">
                  {tool.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-2 pb-4">
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
                          className="w-full justify-between text-gray-700 bg-white/70 hover:bg-white dark:bg-gray-800/70 dark:hover:bg-gray-800 dark:text-gray-200 shadow-sm border border-gray-100 dark:border-gray-700"
                        >
                          <span className="flex items-center gap-2">
                            {action.icon}
                            <span>{action.name}</span>
                          </span>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        </Button>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
              
              {!tool.actions && (
                <CardFooter className="pt-0">
                  <Link to={tool.path} className="block w-full no-underline">
                    <Button 
                      className="w-full justify-between bg-white/70 hover:bg-white dark:bg-gray-800/70 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-sm border border-gray-100 dark:border-gray-700"
                    >
                      <span>Launch Tool</span>
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
        
        {/* Coming Soon Section */}
        <div className="text-center mt-16 max-w-2xl mx-auto">
          <div className="p-6 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-100 dark:border-gray-700 shadow-md">
            <h2 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">More Tools Coming Soon</h2>
            <p className="text-gray-500 dark:text-gray-400">
              We're constantly developing new features to help you manage your home utilities efficiently.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
