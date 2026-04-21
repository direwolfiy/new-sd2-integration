import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a] text-white">
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-16 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-[#00CAE0]" />
          <span className="text-base font-medium tracking-tight">SD2</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/design-system"
            className="flex items-center justify-center h-10 px-5 rounded-full bg-white/10 text-white text-[15px] hover:bg-white/20 transition-colors"
          >
            设计系统
          </Link>
          <Link
            href="#"
            className="flex items-center justify-center h-10 px-5 rounded-full bg-white text-black text-[15px] font-medium hover:bg-white/90 transition-colors"
          >
            进入平台
          </Link>
        </div>
      </nav>
      <main className="flex-1 flex items-center justify-center pt-16">
        <div className="text-center px-6">
          <p className="text-[13px] font-medium text-[#00CAE0] tracking-[0.05em] mb-6">
            漫剧生产平台
          </p>
          <h1 className="font-heading max-w-3xl mx-auto text-4xl sm:text-5xl md:text-7xl font-medium leading-[1.1] tracking-[-0.02em]">
            从剧本到成片
            <br />
            <span className="text-[#999999]">一站式创作</span>
          </h1>
          <p className="max-w-lg mx-auto mt-8 text-lg text-[#999999] leading-[1.8]">
            面向漫剧生产团队的一站式创作平台，覆盖剧本创作、分镜生成、视频输出的完整链路。
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <Link
              href="#"
              className="flex items-center justify-center h-12 px-8 rounded-full bg-white text-black text-[15px] font-medium hover:bg-white/90 transition-colors"
            >
              开始使用
            </Link>
            <Link
              href="/design-system"
              className="flex items-center justify-center h-12 px-8 rounded-full bg-white/10 text-white text-[15px] hover:bg-white/20 transition-colors"
            >
              查看设计系统
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
