"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { ApiError } from "@/lib/api/errors";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password) return;

    setLoading(true);
    setError(null);
    try {
      await login(username.trim(), password);
      router.replace("/");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("登录失败，请检查网络连接");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-[400px]">
      <div className="mb-8 text-center">
        <div className="w-10 h-10 rounded-xl bg-[#00CAE0] mx-auto mb-4" />
        <h1 className="text-xl font-medium tracking-[-0.01em]">登录 SD2</h1>
        <p className="text-[14px] text-[#a3a3a3] mt-2">漫剧生产平台</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[13px] text-[#a3a3a3] mb-1.5">用户名</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="输入用户名"
            autoFocus
            className="w-full h-10 px-4 rounded-lg bg-[#2b2b2b] border border-white/[0.14] text-white text-[15px] placeholder:text-white/30 focus:border-[#00CAE0] focus:ring-1 focus:ring-[#00CAE0] outline-none transition-colors duration-200"
          />
        </div>
        <div>
          <label className="block text-[13px] text-[#a3a3a3] mb-1.5">密码</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="输入密码"
            className="w-full h-10 px-4 rounded-lg bg-[#2b2b2b] border border-white/[0.14] text-white text-[15px] placeholder:text-white/30 focus:border-[#00CAE0] focus:ring-1 focus:ring-[#00CAE0] outline-none transition-colors duration-200"
          />
        </div>

        {error && (
          <p className="text-[13px] text-[#ef4444] leading-[1.6]">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !username.trim() || !password}
          className="w-full h-10 rounded-full bg-white text-black text-[13px] font-medium hover:bg-white/90 active:scale-[0.97] transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none"
        >
          {loading ? "登录中..." : "登录"}
        </button>
      </form>
    </div>
  );
}
