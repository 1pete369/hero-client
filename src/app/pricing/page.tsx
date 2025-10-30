"use client";

import Link from "next/link";
import { Check } from "lucide-react";

const tiers = [
  {
    name: "Free",
    price: "₹0",
    period: "/month",
    blurb: "For anyone starting their self-improvement journey",
    features: [
      "20 tasks/day",
      "3 goals • 7 habits",
      "14‑day journal & notes",
      "Streaks & completion",
      "Basic reminders",
      "2 devices sync",
      "Upgrade prompt at limits",
    ],
    cta: { label: "Get started free", href: "/signup" },
    highlight: false,
  },
  {
    name: "Starter",
    price: "₹1,599",
    period: "/month",
    blurb: "For individuals building consistency & discipline",
    features: [
      "Everything in Free",
      "Unlimited to‑dos • 50 habits • 25 goals",
      "Habit ↔ goal linking",
      "Goal & habit analytics",
      "Unlimited journal & notes",
      "Cloud sync on unlimited devices",
      "Exports (CSV/Markdown)",
    ],
    cta: { label: "Choose Starter", href: "/signup" },
    highlight: true,
  },
  {
    name: "Pro",
    price: "₹2,499",
    period: "/month",
    blurb: "For creators & professionals seeking community accountability",
    features: [
      "Everything in Starter",
      "Unlimited goals & habits",
      "Community groups & cohorts",
      "Accountability buddy",
      "Daily wins chat & weekly reviews",
      "21/30‑day challenges",
      "Streak battles & leaderboards",
      "Early access to features",
    ],
    cta: { label: "Go Pro", href: "/signup" },
    highlight: false,
  },
  {
    name: "Elite",
    price: "₹4,199",
    period: "/month",
    blurb: "For high‑performers who want a full life system",
    features: [
      "Everything in Pro",
      "Health & fitness suite",
      "Calories, macros & BMI",
      "Workouts + meal planner",
      "1:1 priority support",
      "AI Routine Builder (early)",
    ],
    cta: { label: "Unlock Elite", href: "/signup" },
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen pt-10 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">GrindFlow Pricing Plans</h1>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
            Start free. Level up as your grind grows — simple and transparent.
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
