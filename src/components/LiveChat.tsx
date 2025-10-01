import React, { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const LiveChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const WHATSAPP_NUMBER = '2349152870616';

  const handleWhatsAppChat = () => {
    const message = encodeURIComponent(
      "Hello! I'm visiting your website and I'd like to get support from ARET Environmental Services."
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  const ChatButton = () => (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={() => setIsOpen(true)}
        className="h-14 w-14 rounded-full bg-[#25D366] hover:bg-[#20BA5A] shadow-lg transition-all duration-300 hover:scale-110"
        size="icon"
        aria-label="Open WhatsApp Support"
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </Button>
    </div>
  );

  const ChatPopup = () => (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="w-80 bg-background border-2 border-primary/20 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 bg-[#25D366] text-white">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            <span className="font-bold">WhatsApp Support</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white/20"
            onClick={() => setIsOpen(false)}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-[#25D366]/10 p-2 rounded-full">
                <MessageCircle className="h-5 w-5 text-[#25D366]" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-foreground mb-1">
                  Chat with us on WhatsApp
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Get instant support from our team. We're here to help with all your waste management needs!
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-[#25D366] rounded-full animate-pulse"></div>
              <span>Available now</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Response time: Usually within minutes
            </p>
          </div>

          <Button
            onClick={handleWhatsAppChat}
            className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold py-6 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <Send className="h-5 w-5 mr-2" />
            Start WhatsApp Chat
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            By clicking, you'll be redirected to WhatsApp
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {!isOpen && <ChatButton />}
      {isOpen && <ChatPopup />}
    </>
  );
};