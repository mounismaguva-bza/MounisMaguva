import { site } from "@/lib/site";

export const metadata = {
  title: "Contact",
  description: `Contact ${site.name} (Mounis Maguva) in Vijayawada. WhatsApp, phone, email and store directions.`,
  alternates: { canonical: "/contact" },
};

export default function ContactLayout({ children }) {
  return children;
}
