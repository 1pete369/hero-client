export const metadata = {
  title: "Privacy Policy – GrindFlowClub",
  description: "How GrindFlowClub collects, uses, and protects your data, and your rights.",
}

export default function PrivacyPolicyPage() {
  return (
    <main className="w-full min-h-screen bg-purple-50">
      <div className="max-w-4xl mx-auto px-6 py-16 sm:py-20">
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-indigo-700">Privacy Policy – GrindFlowClub</h1>
      <p className="mt-2 text-sm text-gray-500">Last updated: October 29, 2025</p>
      <p className="mt-4 text-gray-700">This Privacy Policy explains how <span className="font-medium">GrindFlowClub</span> ("we", "us") operates the software known as GrindFlowClub (the "Service"), what data we collect, how we use it and how you can control it.</p>

      <section className="mt-8 space-y-8 text-gray-800">
        <article>
          <h2 className="text-2xl font-semibold text-indigo-700">1. What we collect</h2>
          <ul className="mt-2 list-disc pl-6 space-y-1">
            <li><span className="font-medium">Account information</span>: name, email, hashed password, subscription status, settings.</li>
            <li><span className="font-medium">Billing information</span>: payment token, transaction ID (via third-party processors).</li>
            <li><span className="font-medium">Content you add</span>: tasks, habits, projects, attachments, metadata (timestamps, status).</li>
            <li><span className="font-medium">Usage & device data</span>: log data, IP address, browser/device information, crash reports.</li>
            <li><span className="font-medium">Cookies & tracking</span>: for login sessions, preferences, analytics, fraud prevention.</li>
          </ul>
        </article>

        <article>
          <h2 className="text-2xl font-semibold text-indigo-700">2. How we use your data</h2>
          <ul className="mt-2 list-disc pl-6 space-y-1">
            <li>To provide, maintain, personalize and improve the Service.</li>
            <li>For billing, invoicing, account management.</li>
            <li>To measure usage, generate insights, recommend features.</li>
            <li>To detect and prevent fraud, security incidents and abuse.</li>
            <li>To comply with legal obligations and enforce our Terms.</li>
          </ul>
        </article>

        <article>
          <h2 className="text-2xl font-semibold text-indigo-700">3. Legal basis (for EEA/UK users)</h2>
          <ul className="mt-2 list-disc pl-6 space-y-1">
            <li><span className="font-medium">Contract</span>: to deliver the Service you subscribed to.</li>
            <li><span className="font-medium">Legitimate interests</span>: product improvement, security, analytics.</li>
            <li><span className="font-medium">Consent</span>: where required (e.g., non-essential cookies/marketing).</li>
            <li><span className="font-medium">Legal obligation</span>: taxes, regulatory compliance.</li>
          </ul>
        </article>

        <article>
          <h2 className="text-2xl font-semibold text-indigo-700">4. Sharing of data</h2>
          <ul className="mt-2 list-disc pl-6 space-y-1">
            <li>Service providers/processors (hosting, email, payment, analytics) under contract & confidentiality.</li>
            <li>Law enforcement/regulatory disclosures if required.</li>
            <li>Business transfer: in the event of merger, asset sale or reorganisation your data may be transferred under this Policy.</li>
          </ul>
          <p className="mt-2">We do not sell your personal data.</p>
        </article>

        <article>
          <h2 className="text-2xl font-semibold text-indigo-700">5. International transfers</h2>
          <p className="mt-2">Your data may be processed in jurisdictions other than your country. We implement appropriate safeguards (e.g., standard contractual clauses) where required.</p>
        </article>

        <article>
          <h2 className="text-2xl font-semibold text-indigo-700">6. Data retention</h2>
          <p className="mt-2">Your data is retained while your account is active and as needed for the purposes described. After account deletion or termination we retain minimum records (e.g., for tax/audit) as permitted by law.</p>
        </article>

        <article>
          <h2 className="text-2xl font-semibold text-indigo-700">7. Your rights</h2>
          <p className="mt-2">Depending on your location you may have rights to: access, correct, delete, restrict processing, object to processing, port data.</p>
          <p className="mt-2">To exercise a right, email <a href="mailto:grindflowclub@gmail.com" className="underline">grindflowclub@gmail.com</a> from the registered account email.</p>
          <p className="mt-2">Marketing opt-out: use unsubscribe links or update your preferences.</p>
          <p className="mt-2">Cookies: you can manage via browser settings and (if implemented) via our cookie banner.</p>
        </article>

        <article>
          <h2 className="text-2xl font-semibold text-indigo-700">8. Security</h2>
          <p className="mt-2">We employ industry-standard technical and organisational measures (encryption at rest/in transit, access controls, monitoring).</p>
          <p className="mt-2">No system is perfect—please use strong passwords and enable any available account protection (2FA, etc).</p>
        </article>

        <article>
          <h2 className="text-2xl font-semibold text-indigo-700">9. Children</h2>
          <p className="mt-2">The Service is not intended for children under 13 (or the minimum age in your jurisdiction). If you are under that age, do not register or use the Service.</p>
          <p className="mt-2">If we become aware we have collected personal data from a child under that age without parental consent, we will delete that information.</p>
        </article>

        <article>
          <h2 className="text-2xl font-semibold text-indigo-700">10. Changes to this Policy</h2>
          <p className="mt-2">We may update this Policy. If changes are material, we’ll give notice (email or in-app). The “Last updated” date at top is the effective date of current version.</p>
        </article>

        <article>
          <h2 className="text-2xl font-semibold text-indigo-700">11. Contact</h2>
          <p className="mt-2">Data controller: GrindFlowClub (currently unregistered)</p>
          <p className="mt-1">Address: Krishna, Andhra Pradesh, India</p>
          <p className="mt-1">Email: <a href="mailto:grindflowclub@gmail.com" className="underline">grindflowclub@gmail.com</a></p>
        </article>
      </section>
      </div>
    </main>
  )
}



