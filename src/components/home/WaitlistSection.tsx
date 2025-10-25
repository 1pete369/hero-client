"use client"

export default function WaitlistSection() {
  return (
    <section className="relative py-20 px-6">
      <div aria-hidden={true} className="pointer-events-none absolute inset-0">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 h-48 w-48 rounded-full bg-indigo-300/20 blur-3xl" />
      </div>
      <div className="relative max-w-3xl mx-auto bg-white/80 backdrop-blur border border-gray-200 rounded-2xl shadow-lg p-6 sm:p-10">
        <div className="mx-auto mb-6 w-fit rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">Private beta</div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight text-center">Join the waitlist</h2>
        <p className="text-gray-600 mt-3 text-center">Be first to know when we launch. No spam, ever.</p>

        <form className="launchlist-form mt-8" action="https://submit-form.com/iuhbix0AT" method="POST">
          <div className="flex flex-col gap-3 items-center">
            <div className="w-full min-w-[280px] max-w-[320px]">
              <label className="sr-only" htmlFor="ll-email">Email</label>
              <input
                id="ll-email"
                name="email"
                type="email"
                placeholder="Enter your email"
                required
                className="h-12 w-full rounded-lg border border-gray-200 bg-white px-4 text-gray-900 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                suppressHydrationWarning
              />
            </div>
            <div className="w-full min-w-[280px] max-w-[320px]">
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                suppressHydrationWarning
              >
                Join waitlist
              </button>
            </div>
            <p className="text-xs text-gray-500 text-center min-w-[280px] max-w-[320px]">By joining, you agree to receive a one-time launch email.</p>
          </div>
        </form>
      </div>
    </section>
  )
}


