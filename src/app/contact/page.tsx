export const metadata = {
  title: "Contact Us – GrindFlowClub",
  description: "How to reach GrindFlowClub for support, billing, media, and security.",
}

export default function ContactPage() {
  return (
    <main className="w-full min-h-screen bg-indigo-50 pt-10 md:pt-10">
      <div className="max-w-4xl mx-auto px-6 py-16 sm:py-20">
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-indigo-700">Contact Us – GrindFlowClub</h1>
      <p className="mt-2 text-gray-600">We aim to respond within 1–2 business days. For billing enquiries please include your account email and transaction ID.</p>

      <section className="mt-8 grid gap-6 text-gray-800">
        <div>
          <h2 className="text-xl font-semibold text-indigo-700">Support</h2>
          <p className="mt-1">Email: <a href="mailto:grindflowclub@gmail.com" className="underline">grindflowclub@gmail.com</a></p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-indigo-700">Billing</h2>
          <p className="mt-1">Use the subject “Billing” and include your account email and transaction ID.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-indigo-700">Media</h2>
          <p className="mt-1">Press and media enquiries: <a href="mailto:grindflowclub@gmail.com" className="underline">grindflowclub@gmail.com</a></p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-indigo-700">Security</h2>
          <p className="mt-1">Report security issues responsibly to <a href="mailto:grindflowclub@gmail.com" className="underline">grindflowclub@gmail.com</a>.</p>
        </div>
      </section>
      </div>
    </main>
  )
}


