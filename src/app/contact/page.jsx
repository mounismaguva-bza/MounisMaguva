"use client";

import { useState } from "react";
import { site } from "@/lib/site";
import { getWhatsAppChatUrl, getWhatsAppSendUrl } from "@/lib/whatsapp";
import { IconInstagram, IconWhatsApp } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  function handleSubmit(e) {
    e.preventDefault();
    const text = [
      `Hi ${site.name}!`,
      "",
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      "",
      form.message,
    ].join("\n");
    window.location.href = getWhatsAppSendUrl(text);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto mb-12 max-w-xl text-center">
        <h1 className="section-title">Contact Us</h1>
        <p className="section-subtitle mx-auto mt-3">
          We&apos;re here on WhatsApp and Instagram. Reach out for orders, sizing help, or
          international shipping.
        </p>
      </div>

      <div className="mx-auto grid max-w-4xl gap-10 lg:grid-cols-2">
        <div className="space-y-4">
          <Card className="border-[var(--color-border)] transition-colors hover:border-[#25D366]">
            <a
              href={getWhatsAppChatUrl()}
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-2"
            >
              <span className="flex size-12 items-center justify-center rounded-full bg-[#25D366] text-white">
                <IconWhatsApp className="size-6" />
              </span>
              <div>
                <p className="font-semibold">WhatsApp</p>
                <p className="text-sm text-muted-foreground">{site.phone}</p>
              </div>
            </a>
          </Card>

          <Card className="border-[var(--color-border)] transition-colors hover:border-[var(--color-primary)]">
            <a
              href={site.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-2"
            >
              <span className="flex size-12 items-center justify-center rounded-full bg-[var(--color-primary)] text-white">
                <IconInstagram className="size-6" />
              </span>
              <div>
                <p className="font-semibold">Instagram</p>
                <p className="text-sm text-muted-foreground">{site.instagramHandle}</p>
              </div>
            </a>
          </Card>

          <Card className="border-0 bg-[var(--color-surface)]">
            <CardContent className="space-y-2 text-sm pt-6">
              <p>
                <span className="text-muted-foreground">Email:</span>{" "}
                <a href={`mailto:${site.email}`} className="font-medium hover:underline">
                  {site.email}
                </a>
              </p>
              <p>
                <span className="text-muted-foreground">Location:</span> {site.address}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-[var(--color-border)]">
          <CardHeader>
            <CardTitle>Send a message</CardTitle>
            <CardDescription>
              Opens WhatsApp with your details filled in.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Your name</Label>
                <Input
                  id="name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                />
              </div>
              <Button type="submit" variant="whatsapp" size="pill" className="w-full">
                <IconWhatsApp className="size-5" />
                Send via WhatsApp
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <section className="mx-auto mt-14 max-w-4xl">
        <h2 className="section-title mb-2 text-center">Find us</h2>
        <p className="section-subtitle mx-auto mb-6 max-w-lg text-center">
          {site.address}
        </p>
        <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] shadow-md">
          <iframe
            src={site.mapEmbedUrl}
            title="Mouni's Maguva store location on Google Maps"
            className="aspect-[4/3] w-full min-h-[280px] sm:aspect-video sm:min-h-[360px]"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>
    </div>
  );
}
