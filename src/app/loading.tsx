export default function Loading() {
  return (
    <div className="min-h-screen bg-black/[0.96] flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <div
            className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-cyan-500 rounded-full animate-spin"
            style={{ animationDelay: "0.5s" }}
          ></div>
        </div>
        <p className="text-white text-lg font-medium">
          Loading Music School...
        </p>
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
      </div>
    </div>
  );
}
