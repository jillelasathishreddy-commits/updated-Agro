import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const MOCK_QA = [
  { keywords: ["help", "what can you do"], answer: "I can help you with crop recommendations, disease detection, market prices, and soil analysis. What would you like to know?" },
  { keywords: ["crop", "recommend"], answer: "To get crop recommendations, please enter your soil type, moisture level, and location in the Soil & Water Analysis section on the Home page!" },
  { keywords: ["disease", "sick", "plant"], answer: "You can use our Disease Detection feature! Just navigate to the 'Detect' tab and upload a picture of the affected plant." },
  { keywords: ["market", "price", "sell"], answer: "You can check current market prices by selecting a location and crop in the Crop Market Prices section on the Home page." },
  { keywords: ["weather", "rain", "temperature"], answer: "The 7-day weather forecast is available at the top of the Home page, helping you plan your farming activities." },
];

const MENU_OPTIONS = [
  "🌱 Crop Recommendations",
  "🐛 Plant Disease Detection",
  "💰 Check Market Prices",
  "⛅ Weather Forecast",
];

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
}

interface AiAssistantChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiAssistantChat = ({ isOpen, onClose }: AiAssistantChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", text: "Hello! I am your Agro-PEC AI Assistant. How can I help you with your farming today?", sender: "bot" }
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const processUserMessage = (userText: string) => {
    const newUserMessage: Message = { id: Date.now().toString(), text: userText, sender: "user" };
    setMessages((prev) => [...prev, newUserMessage]);

    setTimeout(() => {
      const lowerText = userText.toLowerCase();
      let botResponse = "I'm not sure about that. Try asking about crops, diseases, market prices, or weather!";
      
      for (const qa of MOCK_QA) {
        if (qa.keywords.some((kw) => lowerText.includes(kw))) {
          botResponse = qa.answer;
          break;
        }
      }

      const newBotMessage: Message = { id: (Date.now() + 1).toString(), text: botResponse, sender: "bot" };
      setMessages((prev) => [...prev, newBotMessage]);
    }, 600);
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;
    const userText = inputValue.trim();
    setInputValue("");
    processUserMessage(userText);
  };

  const handleOptionClick = (option: string) => {
    processUserMessage(option);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-24 right-4 z-50 w-80 sm:w-96 glass-card rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-border/50"
          style={{ height: "450px", maxHeight: "60vh" }}
        >
          <div className="gradient-primary p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <h3 className="font-semibold text-sm">Agro Assistant</h3>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50 backdrop-blur-sm">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`flex gap-2 max-w-[85%] ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === "user" ? "bg-primary text-white" : "bg-accent text-accent-foreground"}`}>
                    {msg.sender === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>
                  <div className={`p-2.5 rounded-2xl text-sm ${msg.sender === "user" ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-muted text-foreground rounded-tl-none"}`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
            
            {messages.length === 1 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col gap-2 mt-2 ml-10 mr-4"
              >
                <p className="text-xs text-muted-foreground mb-1">Select a query to start:</p>
                {MENU_OPTIONS.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleOptionClick(option)}
                    className="text-sm text-left bg-background border border-primary/20 text-primary hover:bg-primary hover:text-white transition-colors py-2 px-3 rounded-xl shadow-sm"
                  >
                    {option}
                  </button>
                ))}
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 bg-card border-t border-border">
            <form onSubmit={handleSend} className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask something..."
                className="flex-1 bg-muted border-0 focus-visible:ring-1 focus-visible:ring-primary rounded-xl"
              />
              <Button type="submit" size="icon" className="rounded-xl shrink-0 gradient-primary border-0" disabled={!inputValue.trim()}>
                <Send className="w-4 h-4 text-white" />
              </Button>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
