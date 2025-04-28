
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { WaterIcon, ZapIcon, FileTextIcon } from "lucide-react";

const tools = [
  {
    name: "WEB Tracker",
    description: "Track your Water, Electricity, and Bills in one place",
    icon: <FileTextIcon className="h-10 w-10 text-blue-500" />,
    path: "/web-tracker",
    color: "bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200",
    iconBg: "bg-blue-100"
  },
  // More tools will be added here in the future
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
            <Link to={tool.path} key={tool.name} className="block no-underline">
              <Card className={`h-full transition-all duration-300 hover:shadow-lg ${tool.color}`}>
                <CardHeader>
                  <div className={`${tool.iconBg} w-16 h-16 rounded-full flex items-center justify-center mb-4`}>
                    {tool.icon}
                  </div>
                  <CardTitle>{tool.name}</CardTitle>
                  <CardDescription>{tool.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  {/* Additional content can be added here */}
                </CardContent>
                <CardFooter>
                  <Button variant="secondary" className="w-full">
                    Launch Tool
                  </Button>
                </CardFooter>
              </Card>
            </Link>
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
