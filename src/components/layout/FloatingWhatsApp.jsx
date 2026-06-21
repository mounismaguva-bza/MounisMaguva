"use client";

import { MessageCircle } from "lucide-react";
import { getWhatsAppChatUrl } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";

export default function FloatingWhatsApp() {
  return (
    <Button
      variant="whatsapp"
      size="pill"
      className="fixed bottom-6 right-6 z-30 gap-2 shadow-lg shadow-[#25D366]/30 hover:scale-105"
      render={
        <a
          href={getWhatsAppChatUrl()}
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
        />
      }
    >
      <MessageCircle className="size-5" />
      <span className="hidden sm:inline">Chat with us</span>
    </Button>
  );
}
