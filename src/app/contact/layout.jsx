import { site } from "@/lib/site";

export const metadata = {
  title: "Contact Us — Ethnic Wear Orders & Support",
  description: `Contact ${site.name} in Vijayawada for the best ethnic wear orders. WhatsApp, phone, email and store directions.`,
  alternates: { canonical: "/contact" },
};

export default function ContactLayout({ children }) {
  return children;
}
