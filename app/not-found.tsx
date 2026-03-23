export default function NotFound() {
  return (
    <div className="text-center py-20">
      <p className="text-5xl mb-4">404</p>
      <h1 className="text-xl font-semibold text-stone-900 mb-2">Page not found</h1>
      <p className="text-stone-500 text-sm mb-6">The event you&apos;re looking for doesn&apos;t exist.</p>
      <a
        href="/"
        className="inline-block bg-stone-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-stone-800 transition-colors"
      >
        Go home
      </a>
    </div>
  );
}
