import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Image, FileText, Copy } from "lucide-react";
import { Chat } from "@/types/whatsapp";
import { toast } from "sonner";

interface ExportOptionsProps {
  chat: Chat;
}

export const ExportOptions = ({ chat }: ExportOptionsProps) => {
  const exportAsJSON = () => {
    const dataStr = JSON.stringify(chat, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `whatsapp-chat-${chat.contact.name.replace(/\s+/g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Chat exported as JSON");
  };

  const copyToClipboard = () => {
    const chatText = chat.messages
      .map(msg => `${msg.isOwn ? 'You' : chat.contact.name}: ${msg.content}`)
      .join('\n');
    
    navigator.clipboard.writeText(chatText).then(() => {
      toast.success("Chat copied to clipboard");
    }).catch(() => {
      toast.error("Failed to copy chat");
    });
  };

  const exportAsImage = () => {
    // This would require html2canvas implementation
    toast.info("Image export coming soon!");
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
        >
          <Image className="h-4 w-4 mr-2" />
          As Image
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