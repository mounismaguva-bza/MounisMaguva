"use client";

import { usePathname } from "next/navigation";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/cart/CartDrawer";
import FloatingWhatsApp from "@/components/layout/FloatingWhatsApp";

export default function Providers({ children }) {
  const pathname = usePathname();
  const hideFloatingActions =
    pathname === "/launch" || pathname.startsWith("/launch/");

  return (
    <CartProvider>
      {children}
      <CartDrawer />
      {!hideFloatingActions && <FloatingWhatsApp />}
    </CartProvider>
  );
}
