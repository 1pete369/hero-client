export const metadata = {
  title: "Cancellation & Refunds - GrindFlow",
  description: "Policy for cancellations, refunds, and dispute handling at GrindFlow.",
}

export default function RefundPolicyPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-6">Cancellation & Refund Policy</h1>
      <p className="text-gray-600 mb-6">
        We aim to keep things simple and fair. If you’re not satisfied, read the policy below and contact us.
      </p>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Subscriptions</h2>
          <p className="text-gray-700">
            Subscriptions renew automatically each billing cycle unless cancelled. You can cancel anytime from your account settings.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Refunds</h2>
          <p className="text-gray-700">
            If you believe you were charged in error, contact us within 7 days of the charge. Approved refunds are issued to the original payment method.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Contact</h2>
          <p className="text-gray-700">support@grindflow.com</p>
        </div>
      </section>
    </main>
  )
}


