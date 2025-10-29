export const metadata = {
  title: "Cancellation & Refunds - GrindFlowClub",
  description: "Clear policy for cancellations, refunds, disputes, and how to request a refund.",
}

export default function RefundPolicyPage() {
  return (
    <main className="w-full min-h-screen bg-yellow-50">
      <div className="max-w-4xl mx-auto px-6 py-16 sm:py-20">
      <div className="mb-8">
        {/* <div className="text-xs font-semibold tracking-wide uppercase text-indigo-700">Policy</div> */}
        <h1 className="mt-4 text-3xl sm:text-4xl font-semibold leading-tight tracking-tight text-indigo-700">Cancellation & Refunds – GrindFlowClub</h1>
        <div className="mt-3 text-sm text-gray-500">Last updated: October 29, 2025</div>
        <p className="mt-4 text-gray-700 text-base sm:text-lg max-w-3xl">
          We want you to get value from your membership in our productivity platform. Here’s how cancellations and refunds work.
        </p>
      </div>

      <div className="mb-10" />

      <section className="space-y-8 text-gray-800">
        <article id="subscriptions" className="space-y-3">
          <h2 className="text-2xl font-semibold text-indigo-700">Subscriptions & billing</h2>
          <p>GrindFlow is a subscription service billed monthly or annually.</p>
          <p>You may cancel anytime via the <span className="font-medium">Dashboard → Billing</span>. Your access continues until the end of the paid period.</p>
        </article>

        <article id="refunds" className="space-y-3">
          <h2 className="text-2xl font-semibold text-indigo-700">Refund policy</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><span className="font-medium">Annual plans</span>: Full refund if you cancel within 30 days of initial purchase or renewal.</li>
            <li><span className="font-medium">Monthly plans</span>: Non-refundable once billed. You may cancel to prevent next period billing; access remains until end of the current month.</li>
            <li><span className="font-medium">Free trials / promotions</span>: Charges that follow a free/trial/promo period are non-refundable once billed.</li>
            <li><span className="font-medium">Exception / legal rights</span>: Where local law gives you additional rights, those apply. We may grant goodwill refunds at our discretion.</li>
          </ul>
        </article>

        <article id="how-to-request" className="space-y-3">
          <h2 className="text-2xl font-semibold text-indigo-700">How to request</h2>
          <p>Cancel in Dashboard. Then email <a href="mailto:grindflowclub@gmail.com" className="underline">grindflowclub@gmail.com</a> with “Refund request”, include account email, plan type, date of purchase, transaction ID.</p>
          <p>We respond within 5 business days. If approved, we refund to original payment method; bank processing may take additional time.</p>
        </article>

        <article id="chargebacks" className="space-y-3">
          <h2 className="text-2xl font-semibold text-indigo-700">Chargebacks & disputes</h2>
          <p>If you file a chargeback before contacting us, processing may be delayed and your account may be suspended until investigation concludes.</p>
        </article>
      </section>

      <aside className="mt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Need help with billing?</h3>
          <p className="text-gray-600">We usually respond within 1–2 business days.</p>
        </div>
        <a href="mailto:grindflowclub@gmail.com" className="text-indigo-700 underline underline-offset-4">Email Support</a>
      </aside>
      </div>
    </main>
  )
}

