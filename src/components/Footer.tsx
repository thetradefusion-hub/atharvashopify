import { Link } from "@tanstack/react-router";
import { Truck, Wallet, ShieldCheck, Calendar, Mail, Phone, MapPin, Clock } from "lucide-react";
import { ComplianceFooterBlock } from "@/components/ComplianceFooterBlock";
import { FOOTER_SHOP_CATEGORIES } from "@/lib/shop-categories";

// All 8 social platforms from the legacy site, with brand-correct SVG paths.
// Lucide doesn't ship Pinterest / Tumblr / WhatsApp / X icons, so we keep them
// as inline SVGs alongside the Lucide-style strokes for visual consistency.
const socials: { label: string; href: string; path: string }[] = [
  {
    label: "Website",
    href: "https://www.atharvahealthsolutions.com",
    path: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z",
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/919669361290",
    path: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z",
  },
];

const trustBadges = [
  { icon: Truck, title: "Free Shipping", desc: "On prepaid orders above ₹249" },
  { icon: Wallet, title: "COD available", desc: "₹30 per order where offered" },
  { icon: ShieldCheck, title: "Quality & traceability", desc: "AYUSH · GMP · lab-tested batches" },
  { icon: Calendar, title: "Trusted since 2006", desc: "Serving India & worldwide" },
];

const information = [
  { label: "FAQs", to: "/faqs" as const },
  { label: "Shipping & delivery", to: "/shipping-delivery" as const },
  { label: "Refund policy", to: "/returns-refund" as const },
  { label: "Privacy policy", to: "/privacy-policy" as const },
  { label: "Terms & conditions", to: "/terms-conditions" as const },
  { label: "Disclaimer", to: "/disclaimer" as const },
  { label: "Medical disclaimer", to: "/medical-disclaimer" as const },
  { label: "Track order / contact", to: "/contact" as const },
  { label: "Points of sale", to: "/points-of-sale" as const },
];

export function Footer() {
  return (
    <footer className="bg-gradient-hero bg-grain text-primary-foreground relative overflow-hidden">
      {/* ----- Decorative ambient layers ----- */}
      {/* Soft yellow glow at the top-center for warmth */}
      <div
        aria-hidden
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[80%] h-80 rounded-full bg-brand-orange/20 blur-[120px] pointer-events-none"
      />
      {/* Teal orb — matches HEALTH SOLUTIONS / leaf accent */}
      <div
        aria-hidden
        className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-brand-teal/20 blur-[120px] pointer-events-none"
      />
      {/* Flame-gold hairline */}
      <div
        aria-hidden
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-orange/70 to-transparent z-10"
      />

      {/* ===== Trust badges strip ===== */}
      <div className="relative border-b border-white/12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {trustBadges.map((b) => (
              <div
                key={b.title}
                className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl bg-white/8 border border-white/12 backdrop-blur-sm hover:bg-white/12 hover:border-brand-yellow/30 transition-all"
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-brand-yellow/30 to-brand-yellow/10 ring-1 ring-brand-yellow/30 flex items-center justify-center flex-shrink-0">
                  <b.icon className="w-5 h-5 text-brand-yellow" strokeWidth={2.2} />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] sm:text-sm font-bold text-white leading-tight">
                    {b.title}
                  </p>
                  <p className="text-[11px] sm:text-xs text-white/65 mt-0.5 truncate">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== Main grid ===== */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 pb-8 sm:pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-12 gap-5 sm:gap-10 lg:gap-12 mb-10">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-4">
            {/* Brand logo on a soft cream chip so the green/yellow artwork stays
                readable on the green footer background. */}
            <div className="inline-flex items-center justify-center bg-white rounded-2xl p-3 mb-5 shadow-lg ring-1 ring-brand-yellow/20">
              <img
                src="/atharva-logo.png"
                alt="Atharva Health Solutions — Ancient wisdom. Modern wellness."
                className="h-14 sm:h-16 w-auto"
                width={180}
                height={120}
              />
            </div>
            <p className="text-sm leading-relaxed mb-2 text-white font-bold">
              Atharva Health Solutions
            </p>
            <p className="text-sm leading-relaxed mb-3 text-white/75 max-w-sm">
              Bringing the ancient wisdom of Ayurveda to modern wellness. 100% natural,
              scientifically formulated health solutions from Seoni, Madhya Pradesh.
            </p>
            <a
              href="https://www.atharvahealthsolutions.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mb-6 text-sm font-bold text-brand-yellow hover:text-brand-yellow-light transition-colors group"
              aria-label="Visit atharvahealthsolutions.com"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-brand-yellow group-hover:bg-brand-yellow-light transition-colors" />
              www.atharvahealthsolutions.com
            </a>

            <div>
              <p className="text-eyebrow text-brand-yellow/90 mb-3">Stay Connected</p>
              <div className="flex gap-2.5 flex-wrap">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="w-10 h-10 rounded-xl bg-white/10 hover:bg-brand-yellow text-white hover:text-foreground flex items-center justify-center transition-all hover:scale-105 ring-1 ring-white/15 hover:ring-brand-yellow"
                  >
                    <svg
                      className="w-[15px] h-[15px]"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d={s.path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="lg:col-span-3">
            <h4 className="text-eyebrow text-brand-yellow/90 mb-4 sm:mb-5">Categories</h4>
            <nav className="flex flex-col gap-3">
              {FOOTER_SHOP_CATEGORIES.map((cat, idx) => (
                <Link
                  key={cat.handle}
                  to="/collections/$handle"
                  params={{ handle: cat.handle }}
                  className={`text-sm text-white/80 hover:text-brand-yellow transition-colors inline-block w-fit py-0.5 ${idx > 3 ? "hidden sm:inline-block" : ""}`}
                >
                  {cat.label}
                </Link>
              ))}
              <Link
                to="/categories"
                className="sm:hidden inline-flex items-center justify-center mt-1 rounded-xl border border-brand-yellow/40 bg-brand-yellow/15 px-3 py-2 text-xs font-bold text-brand-yellow"
              >
                View all categories
              </Link>
            </nav>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h4 className="text-eyebrow text-brand-yellow/90 mb-4 sm:mb-5">Quick links</h4>
            <nav className="flex flex-col gap-3">
              <Link
                to="/"
                className="text-sm text-white/80 hover:text-brand-yellow transition-colors inline-block w-fit py-0.5"
              >
                Home
              </Link>
              <a
                href="/#products"
                className="text-sm text-white/80 hover:text-brand-yellow transition-colors inline-block w-fit py-0.5"
              >
                Shop Products
              </a>
              <Link
                to="/about"
                className="text-sm text-white/80 hover:text-brand-yellow transition-colors inline-block w-fit py-0.5"
              >
                About Us
              </Link>
              <Link
                to="/account"
                className="text-sm text-white/80 hover:text-brand-yellow transition-colors inline-block w-fit py-0.5"
              >
                My account
              </Link>
              <Link
                to="/blog"
                className="text-sm text-white/80 hover:text-brand-yellow transition-colors inline-block w-fit py-0.5"
              >
                Wellness blog
              </Link>
              <Link
                to="/contact"
                className="text-sm text-white/80 hover:text-brand-yellow transition-colors inline-block w-fit py-0.5"
              >
                Contact
              </Link>
            </nav>
          </div>

          {/* Information */}
          <div className="lg:col-span-3">
            <h4 className="text-eyebrow text-brand-yellow/90 mb-4 sm:mb-5">Information</h4>
            <nav className="flex flex-col gap-3">
              {information.map((item, idx) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`text-sm text-white/80 hover:text-brand-yellow transition-colors inline-block w-fit py-0.5 ${idx > 5 ? "hidden sm:inline-block" : ""}`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact (full-width row on its own) */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-12 mt-2 lg:mt-4">
            <div className="rounded-3xl bg-white/8 border border-white/15 backdrop-blur-sm p-5 sm:p-6 lg:p-7">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <a href="tel:+919669361290" className="flex items-start gap-3 group">
                  <div className="w-10 h-10 rounded-xl bg-white/10 ring-1 ring-white/15 group-hover:bg-brand-yellow/30 group-hover:ring-brand-yellow/50 flex items-center justify-center flex-shrink-0 transition-all">
                    <Phone className="w-4 h-4 text-brand-yellow" strokeWidth={2.2} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-eyebrow text-brand-yellow/85 mb-0.5">Call us</p>
                    <p className="text-sm font-bold text-white group-hover:text-brand-yellow transition-colors">
                      +91 96693 61290
                    </p>
                  </div>
                </a>
                <a href="mailto:support@atharvahealthsolutions.com" className="flex items-start gap-3 group">
                  <div className="w-10 h-10 rounded-xl bg-white/10 ring-1 ring-white/15 group-hover:bg-brand-yellow/30 group-hover:ring-brand-yellow/50 flex items-center justify-center flex-shrink-0 transition-all">
                    <Mail className="w-4 h-4 text-brand-yellow" strokeWidth={2.2} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-eyebrow text-brand-yellow/85 mb-0.5">Email</p>
                    <p className="text-sm font-bold text-white group-hover:text-brand-yellow transition-colors break-all">
                      support@atharvahealthsolutions.com
                    </p>
                  </div>
                </a>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 ring-1 ring-white/15 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-brand-yellow" strokeWidth={2.2} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-eyebrow text-brand-yellow/85 mb-0.5">Hours</p>
                    <p className="text-sm font-bold text-white">9:00 AM – 9:00 PM</p>
                    <p className="text-xs text-white/65">All days · IST</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 ring-1 ring-white/15 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-brand-yellow" strokeWidth={2.2} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-eyebrow text-brand-yellow/85 mb-0.5">Office</p>
                    <p className="text-sm font-bold text-white leading-snug">
                      Seoni, Madhya Pradesh
                    </p>
                    <p className="text-xs text-white/65 leading-snug mt-0.5">
                      Dunda Seoni · 480661
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-3 justify-center sm:justify-start">
                <a
                  href="https://wa.me/919669361290?text=Hi%2C%20I%27d%20like%20help%20with%20my%20Atharva%20order"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] text-white px-5 py-2.5 text-sm font-bold hover:brightness-110 transition-all shadow-md"
                >
                  Message on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>

        <ComplianceFooterBlock />
        <div className="border-t border-white/15 pt-6 pb-[calc(6rem+env(safe-area-inset-bottom))] lg:pb-0 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p className="text-xs text-white/65">
            © 2026 Atharva Health Solutions. All rights reserved.
          </p>
          <p className="text-xs text-white/65">
            Website developed by{" "}
            <a
              href="tel:+917581982414"
              className="font-bold text-brand-yellow hover:text-brand-yellow-light underline-offset-4 hover:underline transition-colors"
              aria-label="Call developer Rakesh Nagpure at +91 75819 82414"
            >
              Rakesh Nagpure
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
