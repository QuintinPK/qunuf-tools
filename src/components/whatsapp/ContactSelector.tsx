import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, User } from "lucide-react";
import { Contact } from "@/types/whatsapp";

interface ContactSelectorProps {
  contacts: Contact[];
  onContactSelect: (contact: Contact) => void;
  onContactAdd: (contacts: Contact[]) => void;
}

export const ContactSelector = ({ contacts, onContactSelect, onContactAdd }: ContactSelectorProps) => {
  const [newContactName, setNewContactName] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddContact = () => {
    if (newContactName.trim()) {
      const newContact: Contact = {
        id: Date.now().toString(),
        name: newContactName.trim(),
        isOnline: Math.random() > 0.5,
        lastSeen: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 3600000) : undefined,
      };
      
      onContactAdd([...contacts, newContact]);
      setNewContactName("");
      setShowAddForm(false);
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
          <div className="space-y-2 p-3 bg-muted rounded-lg">
            <Input
              placeholder="Contact name"
              value={newContactName}
              onChange={(e) => setNewContactName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddContact()}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddContact} disabled={!newContactName.trim()}>
                Add
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