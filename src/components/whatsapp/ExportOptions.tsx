import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Image, FileText, Copy } from "lucide-react";
import { Chat } from "@/types/whatsapp";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";

interface ExportOptionsProps {
  chat: Chat;
}

export const ExportOptions = ({ chat }: ExportOptionsProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();
  const exportAsJSON = () => {
    const dataStr = JSON.stringify(chat, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `whatsapp-chat-${chat.contact.name.replace(/\s+/g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Success",
      description: "Chat exported as JSON",
    });
  };

  const copyToClipboard = () => {
    const chatText = chat.messages
      .map(msg => `${msg.isOwn ? 'You' : chat.contact.name}: ${msg.content}`)
      .join('\n');
    
    navigator.clipboard.writeText(chatText).then(() => {
      toast({
        title: "Success",
        description: "Chat copied to clipboard",
      });
    }).catch(() => {
      toast({
        title: "Error",
        description: "Failed to copy chat",
        variant: "destructive",
      });
    });
  };

  const exportAsImage = async () => {
    setIsExporting(true);
    try {
      // Find the chat interface element
      const chatElement = document.querySelector('.whatsapp-chat-interface') as HTMLElement;
      if (!chatElement) {
        toast({
          title: "Error",
          description: "Chat interface not found. Make sure you have an active chat.",
          variant: "destructive",
        });
        return;
      }

      // Create canvas from the element
      const canvas = await html2canvas(chatElement, {
        backgroundColor: '#ECE5DD',
        scale: 2, // Higher quality
        useCORS: true,
        logging: false,
      });

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `whatsapp-chat-${chat.contact.name}-${new Date().toISOString().split('T')[0]}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          toast({
            title: "Success",
            description: "Chat exported as image successfully!",
          });
        }
      }, 'image/png');
    } catch (error) {
      console.error('Error exporting image:', error);
      toast({
        title: "Error",
        description: "Failed to export chat as image",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Export Chat</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-2">
        <Button
          variant="outline"
          size="sm"
          onClick={exportAsImage}
          className="w-full justify-start"
          disabled={isExporting}
        >
          <Image className="h-4 w-4 mr-2" />
          {isExporting ? "Exporting..." : "As Image"}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={exportAsJSON}
          className="w-full justify-start"
        >
          <FileText className="h-4 w-4 mr-2" />
          As JSON
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={copyToClipboard}
          className="w-full justify-start"
        >
          <Copy className="h-4 w-4 mr-2" />
          Copy Text
        </Button>
      </CardContent>
    </Card>
  );
};