"use client";

import { usePathname } from "next/navigation";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/cart/CartDrawer";
import FloatingWhatsApp from "@/components/layout/FloatingWhatsApp";
import LaunchHomeEntrance from "@/components/launch/LaunchHomeEntrance";

export default function Providers({ children }) {
  const pathname = usePathname();
  const hideFloatingActions =
    pathname === "/launch" ||
    pathname.startsWith("/launch/") ||
    pathname.startsWith("/admin/mobile-upload/");

  return (
    <CartProvider>
      <LaunchHomeEntrance />
      {children}
      <CartDrawer />
      {!hideFloatingActions && <FloatingWhatsApp />}
    </CartProvider>
  );
}
