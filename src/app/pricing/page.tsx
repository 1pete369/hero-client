"use client";

import Link from "next/link";
import { Check } from "lucide-react";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    blurb: "Attract users and let them experience the core flow",
    features: [
      "Unlimited to-dos",
      "Up to 3 goals",
      "Up to 3 habits linked to goals",
      "Timeline view for daily tracking",
      "Basic analytics (7-day insights only)",
    ],
    cta: { label: "Get started free", href: "/signup" },
    highlight: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    blurb: "Accountability and analytics are the real hooks here",
    features: [
      "Everything in Free",
      "Unlimited goals, habits, and timelines",
      "Advanced analytics & streak tracking",
      "Dynamic Duo (Buddy) feature — share goals & habits with one friend",
      "Custom reminders & smart notifications",
    ],
    cta: { label: "Go Pro", href: "/signup" },
    highlight: true,
  },
  {
    name: "Premium",
    price: "$29",
    period: "/month",
    blurb: "For small accountability groups or power users",
    features: [
      "Everything in Pro",
      "Multiple buddies (up to 3)",
      "Shared analytics for duo/group",
      "Priority feature access + early updates",
      "Export data (CSV / PDF summaries)",
    ],
    cta: { label: "Unlock Premium", href: "/signup" },
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen pt-10 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">GrindFlow MVP Pricing</h1>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
            Start free. Upgrade for accountability and advanced analytics — simple and transparent.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((t) => (
            <div key={t.name} className={`relative rounded-2xl border ${t.highlight ? "border-indigo-600" : "border-gray-200"} bg-white shadow-sm hover:shadow-md transition-shadow`}>
              {t.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-600 text-white shadow">Most popular</div>
              )}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900">{t.name}</h3>
                {t.blurb && <p className="mt-1 text-sm text-gray-500">{t.blurb}</p>}
                <div className="mt-3 flex items-end gap-1">
                  <span className="text-4xl font-extrabold text-gray-900">{t.price}</span>
                  <span className="text-gray-500 mb-1">{t.period}</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-gray-700">
                      <Check className="h-5 w-5 text-indigo-600 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href={t.cta.href} className="inline-flex w-full justify-center rounded-xl mt-8 px-4 py-3 font-semibold transition-colors border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 text-sm
                  bg-indigo-600 text-white hover:bg-indigo-700 border-indigo-600">
                  {t.cta.label}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
