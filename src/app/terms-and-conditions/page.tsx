export const metadata = {
  title: "Terms and Conditions - GrindFlow",
  description:
    "Terms of Service outlining usage rules, memberships, billing, and disclaimers for GrindFlow.",
}

export default function TermsAndConditionsPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-6">Terms and Conditions</h1>
      <p className="text-gray-600 mb-6">
        By using GrindFlow services, you agree to these Terms. If you disagree,
        please discontinue use.
      </p>
      <h2 className="text-xl font-semibold mb-2">Subscriptions</h2>
      <p className="text-gray-600 mb-6">
        Subscriptions renew automatically until cancelled in your account
        settings.
      </p>
      <h2 className="text-xl font-semibold mb-2">Contact</h2>
      <p className="text-gray-600">support@grindflow.com</p>
    </main>
  )
}



