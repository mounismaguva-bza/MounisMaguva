"use client";

import { usePathname } from "next/navigation";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";

const BARE_ROUTES = ["/launch"];

function isBareRoute(pathname) {
  return BARE_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export default function SiteChrome({ children }) {
  const pathname = usePathname();

  if (isBareRoute(pathname)) {
    return children;
  }

  return (
    <>
      <div className="site-chrome-animate">
        <AnnouncementBar />
        <Header />
      </div>
      <main className="site-chrome-animate flex-1">{children}</main>
      <div className="site-chrome-animate">
        <Footer />
      </div>
    </>
  );
}
