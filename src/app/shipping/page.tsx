export const metadata = {
  title: "Shipping & Delivery – GrindFlowClub",
  description: "How access and receipts work for our digital service.",
}

export default function ShippingPolicyPage() {
  return (
    <main className="w-full min-h-screen pt-10 bg-orange-50">
      <div className="max-w-4xl mx-auto px-6 py-16 sm:py-20">
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-indigo-700">Shipping & Delivery – GrindFlowClub</h1>
      <p className="mt-2 text-sm text-gray-500">Last updated: October 29, 2025</p>
      <p className="mt-4 text-gray-700">GrindFlowClub is a digital service, and no physical shipping is required.</p>

      <section className="mt-8 space-y-6 text-gray-800">
        <p>Access is granted immediately upon payment or trial activation.</p>
        <p>Receipts are emailed to you after payment.</p>
        <p>If a payment fails, your access may be restricted until resolved.</p>
        <p>If at any time we offer physical products, we’ll publish shipping terms on that product’s page.</p>
      </section>
      </div>
    </main>
  )
}


