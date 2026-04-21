"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-medium mb-4">出错了</h2>
        <p className="text-[#a6a6a6] mb-6">{error.message}</p>
        <button
          onClick={reset}
          className="px-6 py-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
        >
          重试
        </button>
      </div>
    </div>
  );
}
