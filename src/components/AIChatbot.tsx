import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import {
  Send,
  Bot,
  User,
  Lightbulb,
  TrendingUp,
  AlertCircle,
  X,
} from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "ai";
  content: string;
  timestamp: Date;
}

interface AIChatbotProps {
  open: boolean;
  onClose: () => void;
}

export function AIChatbot({ open, onClose }: AIChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "ai",
      content: "Hello! I'm your AI assistant. I can help you with formulas, data analysis, and spreadsheet tips. How can I help you today?",
      timestamp: new Date(),
    },
    {
      id: "2",
      sender: "user",
      content: "How do I use the VLOOKUP formula?",
      timestamp: new Date(),
    },
    {
      id: "3",
      sender: "ai",
      content: "Great question! VLOOKUP is a powerful function. Here's how to use it:\n\n1. **Syntax**: =VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup])\n\n2. **Example**: =VLOOKUP(A2, D2:F10, 3, FALSE)\n   - A2: The value you're looking for\n   - D2:F10: The table range to search\n   - 3: Return value from 3rd column\n   - FALSE: Exact match\n\n3. **Step-by-step**:\n   • Select your lookup value\n   • Define your data table\n   • Choose which column to return\n   • Decide exact or approximate match\n\nWould you like me to create an example for you?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");

  const insights = [
    {
      icon: TrendingUp,
      title: "Top Performance",
      description: "Top 5 product sales are: Product A ($12,500), Product B ($9,800), Product C ($7,200)...",
      color: "text-yellow-600",
    },
    {
      icon: AlertCircle,
      title: "Data Quality",
      description: "Detected inconsistent data in Column C. 3 cells have different formatting.",
      color: "text-yellow-500",
    },
    {
      icon: Lightbulb,
      title: "Smart Suggestion",
      description: "Your data could benefit from a pivot table to analyze sales by region and quarter.",
      color: "text-yellow-500",
    },
  ];

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInput("");

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        content: "I understand your question. Let me help you with that...",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  if (!open) return null;

  return (
    <div className="fixed right-0 top-0 h-screen w-80 bg-card border-l border-border flex flex-col shadow-2xl z-50 overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{background: 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)'}}>
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-medium">AI Assistant</h3>
            <p className="text-xs text-muted-foreground">Always here to help</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* AI Insights Section - Collapsible */}
      <div className="p-3 border-b border-border bg-accent/30 flex-shrink-0 max-h-56 overflow-auto">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="w-3.5 h-3.5 text-yellow-500" />
          <h4 className="text-xs font-medium">AI Insights</h4>
        </div>
        <div className="space-y-2">
          {insights.slice(0, 2).map((insight, index) => (
            <div
              key={index}
              className="p-2 rounded-md bg-background border border-border hover:border-primary/50 transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-2">
                <insight.icon className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${insight.color}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium mb-0.5">{insight.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {insight.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-3 min-h-0">
        <div className="space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 ${
                message.sender === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                style={message.sender === "ai" ? {background: 'linear-gradient(135deg, #FFFACD 0%, #FFD700 25%, #FFFACD 50%, #FFD700 75%, #FFFACD 100%)'} : {backgroundColor: 'hsl(var(--primary))'}}
              >
                {message.sender === "ai" ? (
                  <Bot className="w-3.5 h-3.5" />
                ) : (
                  <User className="w-3.5 h-3.5 text-primary-foreground" />
                )}
              </div>
              <div
                className={`flex-1 min-w-0 ${
                  message.sender === "user" ? "text-right" : "text-left"
                }`}
              >
                <div
                  className={`inline-block p-2 rounded-lg max-w-[90%] ${
                    message.sender === "ai"
                      ? "bg-accent text-accent-foreground"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  <p className="text-xs whitespace-pre-line leading-relaxed">{message.content}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 px-1">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-3 border-t border-border flex-shrink-0">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask me anything..."
            className="flex-1 h-9 text-sm"
          />
          <Button onClick={handleSend} size="icon" className="h-9 w-9 flex-shrink-0">
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1.5">
          Try: "How do I sum a range?"
        </p>
      </div>
    </div>
  );
}
