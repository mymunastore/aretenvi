import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Bot, User, Minimize2, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

interface Message {
  id: string;
  content: string;
  message_type: 'user' | 'ai' | 'system';
  created_at: string;
  intent?: string;
  confidence?: number;
}

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
  onMinimize: () => void;
  isMinimized: boolean;
}

const AIChat = ({ isOpen, onClose, onMinimize, isMinimized }: AIChatProps) => {
  const { customer } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && customer && !sessionId) {
      initializeChat();
    }
  }, [isOpen, customer, sessionId, initializeChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeChat = useCallback(async () => {
    if (!customer) return;

    try {
      const newSessionId = crypto.randomUUID();
      
      // Create AI chat session
      const { error: sessionError } = await supabase
        .from('ai_chat_sessions')
        .insert({
          customer_id: customer.id,
          session_id: newSessionId,
          session_type: 'support',
          ai_model: 'aret-assistant-v1'
        });

      if (sessionError) throw sessionError;

      setSessionId(newSessionId);

      // Add welcome message
      const welcomeMessage = {
        id: crypto.randomUUID(),
        content: `Hello ${customer.full_name}! I'm ARET's AI assistant. I can help you with questions about waste collection schedules, service plans, recycling, and environmental impact. How can I assist you today?`,
        message_type: 'ai' as const,
        created_at: new Date().toISOString(),
        intent: 'welcome',
        confidence: 1.0
      };

      setMessages([welcomeMessage]);

      // Store welcome message
      await supabase
        .from('ai_chat_messages')
        .insert({
          session_id: newSessionId,
          message_type: 'ai',
          content: welcomeMessage.content,
          intent: 'welcome',
          confidence: 1.0
        });

    } catch (error) {
      console.error('Error initializing chat:', error);
    }
  }, [customer]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || !sessionId || !customer) return;

    const userMessage = {
      id: crypto.randomUUID(),
      content: inputMessage.trim(),
      message_type: 'user' as const,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Store user message
      await supabase
        .from('ai_chat_messages')
        .insert({
          session_id: sessionId,
          message_type: 'user',
          content: userMessage.content
        });

      // Get AI response
      const { data: aiResponse, error } = await supabase.functions.invoke('ai-chat-support', {
        body: {
          sessionId,
          message: userMessage.content,
          customerId: customer.id
        }
      });

      if (error) throw error;

      if (aiResponse.success) {
        const aiMessage = {
          id: crypto.randomUUID(),
          content: aiResponse.response,
          message_type: 'ai' as const,
          created_at: new Date().toISOString(),
          intent: aiResponse.intent,
          confidence: aiResponse.confidence
        };

        setMessages(prev => [...prev, aiMessage]);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage = {
        id: crypto.randomUUID(),
        content: "I'm sorry, I'm having trouble responding right now. Please try again or contact our support team at 09152870616.",
        message_type: 'ai' as const,
        created_at: new Date().toISOString(),
        intent: 'error'
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <Card className={`fixed bottom-6 right-6 w-96 z-50 shadow-elegant transition-all duration-300 ${
      isMinimized ? 'h-16' : 'h-[500px]'
    }`}>
      {/* Header */}
      <CardHeader className="flex flex-row items-center justify-between p-4 bg-primary text-primary-foreground rounded-t-lg">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          <CardTitle className="text-lg">ARET AI Assistant</CardTitle>
          <Badge variant="secondary" className="text-xs">Online</Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
            onClick={onMinimize}
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {!isMinimized && (
        <>
          {/* Messages */}
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 h-80">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.message_type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.message_type === 'ai' && (
                  <div className="bg-primary/10 p-2 rounded-full flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] p-3 rounded-lg text-sm ${
                    message.message_type === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p>{message.content}</p>
                  {message.intent && message.confidence && (
                    <div className="text-xs opacity-70 mt-1">
                      Intent: {message.intent} ({(message.confidence * 100).toFixed(0)}%)
                    </div>
                  )}
                </div>
                
                {message.message_type === 'user' && (
                  <div className="bg-primary/10 p-2 rounded-full flex-shrink-0">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                placeholder="Ask about schedules, plans, recycling..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="flex-1"
              />
              <Button 
                onClick={sendMessage} 
                disabled={!inputMessage.trim() || isLoading}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </Card>
  );
};

export default AIChat;