import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, User, Upload, X } from "lucide-react";
import { Contact } from "@/types/whatsapp";
import { toast } from "sonner";

interface ContactSelectorProps {
  contacts: Contact[];
  onContactSelect: (contact: Contact) => void;
  onContactAdd: (contacts: Contact[]) => void;
}

export const ContactSelector = ({ contacts, onContactSelect, onContactAdd }: ContactSelectorProps) => {
  const [newContactName, setNewContactName] = useState("");
  const [newContactAvatar, setNewContactAvatar] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddContact = () => {
    if (newContactName.trim()) {
      const newContact: Contact = {
        id: Date.now().toString(),
        name: newContactName.trim(),
        avatar: newContactAvatar || undefined,
        isOnline: Math.random() > 0.5,
        lastSeen: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 3600000) : undefined,
      };
      
      onContactAdd([...contacts, newContact]);
      setNewContactName("");
      setNewContactAvatar(null);
      setShowAddForm(false);
      toast.success("Contact added successfully");
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("File size must be less than 5MB");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewContactAvatar(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearAvatar = () => {
    setNewContactAvatar(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          Contacts
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {showAddForm && (
          <div className="space-y-3 p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={newContactAvatar || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {newContactName.charAt(0).toUpperCase() || <User className="h-5 w-5" />}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-2">
                <Input
                  placeholder="Contact name"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddContact()}
                />
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1"
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    {newContactAvatar ? "Change Photo" : "Add Photo"}
                  </Button>
                  
                  {newContactAvatar && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={clearAvatar}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddContact} disabled={!newContactName.trim()}>
                Add Contact
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
              onClick={() => onContactSelect(contact)}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={contact.avatar} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {contact.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{contact.name}</p>
                <p className="text-xs text-muted-foreground">
                  {contact.isOnline ? "Online" : "Offline"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};