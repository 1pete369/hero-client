export const metadata = {
  title: "Privacy Policy - GrindFlow",
  description:
    "Privacy Policy describing how GrindFlow collects, uses, and protects data.",
}

export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <section className="space-y-4 text-gray-700">
        <p>
          We collect the minimum data necessary to provide and improve GrindFlow. We never sell your personal information.
        </p>
        <div>
          <h2 className="text-xl font-semibold mb-2">Data We Collect</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Account info (name, email).</li>
            <li>App content you create (todos, notes, goals, etc.).</li>
            <li>Usage and device metadata to improve performance.</li>
          </ul>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">How We Use Data</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Provide, operate, and improve features.</li>
            <li>Protect your account and prevent abuse.</li>
            <li>Communicate important updates.</li>
          </ul>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Your Rights</h2>
          <p>You can request export or deletion of your data by contacting us.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Contact</h2>
          <p>support@grindflow.com</p>
        </div>
      </section>
    </main>
  )
}



