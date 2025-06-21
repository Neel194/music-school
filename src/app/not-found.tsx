import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black/[0.96] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-teal-500 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-white mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-400 mb-8">
            The page you're looking for doesn't exist. It might have been moved
            or deleted.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/"
            className="block w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Go Home
          </Link>

          <Link
            href="/courses"
            className="block w-full border border-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Browse Courses
          </Link>
        </div>

        <div className="mt-8 text-xs text-gray-500">
          <p>Looking for something specific?</p>
          <Link href="/contact" className="text-teal-500 hover:text-teal-400">
            Contact us for help
          </Link>
        </div>
      </div>
    </div>
  );
}
