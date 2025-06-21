"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black/[0.96] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-red-500 mb-4">500</h1>
          <h2 className="text-2xl font-semibold text-white mb-4">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-400 mb-8">
            We're experiencing some technical difficulties. Please try again or
            contact support if the problem persists.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={reset}
            className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Try Again
          </button>

          <Link
            href="/"
            className="block w-full border border-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Go Home
          </Link>
        </div>

        <div className="mt-8 text-xs text-gray-500">
          Error ID: {error.digest || "Unknown"}
        </div>
      </div>
    </div>
  );
}
