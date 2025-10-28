export const metadata = {
  title: "Shipping Policy - GrindFlow",
  description: "Shipping and delivery policy for GrindFlow (digital services).",
}

export default function ShippingPolicyPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-6">Shipping Policy</h1>
      <p className="text-gray-700 mb-6">
        GrindFlow is a digital service. No physical shipping is required. Subscription access is provisioned instantly after successful payment.
      </p>
      <section className="space-y-4 text-gray-700">
        <div>
          <h2 className="text-xl font-semibold mb-2">Delivery Timelines</h2>
          <p>Access to paid features becomes available immediately once payment is confirmed.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Invoices</h2>
          <p>Invoices and payment confirmations are delivered by email.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Contact</h2>
          <p>For billing or delivery questions, contact support@grindflow.com</p>
        </div>
      </section>
    </main>
  )
}


