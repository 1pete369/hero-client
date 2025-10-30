export const metadata = {
  title: "Terms & Conditions - GrindFlowClub",
  description: "Terms governing your use of GrindFlowClub, subscriptions, acceptable use, and more.",
}

import Link from "next/link"

export default function TermsAndConditionsPage() {
  return (
    <main className="w-full min-h-screen pt-10 bg-pink-50">
      <div className="max-w-4xl mx-auto px-6 py-16 sm:py-20">
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-indigo-700">Terms & Conditions – GrindFlowClub</h1>
      <p className="mt-2 text-sm text-gray-500">Last updated: October 29, 2025</p>
      <p className="mt-4 text-gray-700">
        These Terms and Conditions (“Terms”) govern your use of the service provided by <span className="font-medium">GrindFlowClub</span> (“we”, “us”, “our”) via the software and website known as GrindFlowClub (the “Service”). By accessing or using the Service you agree to these Terms and our Privacy Policy.
      </p>

      <section className="mt-8 space-y-8 text-gray-800">
        <article>
          <h2 className="text-2xl font-semibold text-indigo-700">Eligibility</h2>
          <p className="mt-2">You must be at least 13 years old (or the age required by your jurisdiction) to use the Service.</p>
          <p className="mt-2">You agree to provide accurate registration information, keep credentials secure, and are responsible for activities under your account.</p>
        </article>

        <article>
          <h2 className="text-2xl font-semibold text-indigo-700">Accounts, Subscriptions & Payments</h2>
          <ul className="mt-2 list-disc pl-6 space-y-2">
            <li>Access to certain features requires a paid subscription. You authorize our payment processor to charge your method for the fees and applicable taxes.</li>
            <li>Subscriptions renew automatically at the end of each billing period unless cancelled at least <span className="font-medium">24 hours</span> before the next cycle.</li>
            <li>Pricing may change; for existing subscriptions we’ll notify you and only apply changes from next renewal.</li>
          </ul>
        </article>

        <article>
          <h2 className="text-2xl font-semibold text-indigo-700">Cancellation, Refunds & Service Availability</h2>
          <p className="mt-2">See our <Link href="/refund" className="underline">Cancellation & Refund Policy</Link>.</p>
          <p className="mt-2">We strive to maintain service availability but cannot guarantee uninterrupted access. We may suspend or terminate the Service or your account if you break these Terms, or for security or legal reasons.</p>
        </article>

        <article>
          <h2 className="text-2xl font-semibold text-indigo-700">Acceptable Use</h2>
          <p className="mt-2">You agree not to:</p>
          <ul className="mt-2 list-disc pl-6 space-y-1">
            <li>Use the Service for unlawful or fraudulent purposes.</li>
            <li>Attempt to access, interfere with or disrupt the Service or servers.</li>
            <li>Upload or transmit harmful software, spam, or infringing content.</li>
          </ul>
        </article>

        <article>
          <h2 className="text-2xl font-semibold text-indigo-700">Your Content</h2>
          <p className="mt-2">You retain ownership of content you upload (“User Content”).</p>
          <p className="mt-2">You grant us a worldwide, non-exclusive, royalty-free licence to host, process and display your User Content solely to operate and improve the Service.</p>
          <p className="mt-2">You are responsible for ensuring you have rights to the User Content.</p>
        </article>

        <article>
          <h2 className="text-2xl font-semibold text-indigo-700">Intellectual Property</h2>
          <p className="mt-2">The Service and all intellectual property, including software, graphics, design, are owned or licensed by <span className="font-medium">GrindFlowClub</span>.</p>
          <p className="mt-2">You may not copy, reproduce, create derivatives, or reverse engineer the Service except as permitted.</p>
        </article>

        <article>
          <h2 className="text-2xl font-semibold text-indigo-700">Third-Party Services & Integrations</h2>
          <p className="mt-2">The Service may integrate with third-party tools (payment processors, APIs, storage, analytics). Your use of those tools is also subject to their terms and privacy policies. We aren’t liable for such third-party services.</p>
        </article>

        <article>
          <h2 className="text-2xl font-semibold text-indigo-700">Privacy & Data</h2>
          <p className="mt-2">Our Privacy Policy describes how we collect, use and share your personal data. By using the Service you consent to those practices.</p>
        </article>

        <article>
          <h2 className="text-2xl font-semibold text-indigo-700">Disclaimer & Limitation of Liability</h2>
          <p className="mt-2">The Service is provided “as-is” and “as available”, without warranties of any kind.</p>
          <p className="mt-2">To the maximum extent permitted by law, our liability for any claim related to the Service shall not exceed the fees you have paid in the 12 months preceding the claim.</p>
        </article>

        <article>
          <h2 className="text-2xl font-semibold text-indigo-700">Termination</h2>
          <p className="mt-2">You can stop using the Service at any time. We may suspend or terminate your account if you violate these Terms, or for legal/regulatory reasons.</p>
        </article>

        <article>
          <h2 className="text-2xl font-semibold text-indigo-700">Changes to Terms</h2>
          <p className="mt-2">We may revise these Terms. If material changes are made, we’ll provide notice (email and/or in-app). Your continued use after the effective date means you accept the changes.</p>
        </article>

        <article>
          <h2 className="text-2xl font-semibold text-indigo-700">Governing Law</h2>
          <p className="mt-2">These Terms are governed by the laws of India, and you agree to the exclusive jurisdiction of the courts in Krishna, Andhra Pradesh, unless local law mandates otherwise.</p>
        </article>

        <article>
          <h2 className="text-2xl font-semibold text-indigo-700">Contact</h2>
          <p className="mt-2">If you have questions about these Terms, email <a href="mailto:grindflowclub@gmail.com" className="underline">grindflowclub@gmail.com</a> or visit our Contact page.</p>
        </article>
      </section>
      </div>
    </main>
  )
}



