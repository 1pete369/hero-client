export default function NotFound() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-16">
      <div className="max-w-xl w-full text-center">
        <div className="bg-white rounded-lg border-3 border-black p-8 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
          <h1 className="text-3xl font-extrabold text-gray-900">Page not found</h1>
          <p className="mt-3 text-gray-600">The page you are looking for doesn&apos;t exist or has moved.</p>
          <a href="/" className="inline-block mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded border-3 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)]">Go home</a>
        </div>
      </div>
    </main>
  )
}


