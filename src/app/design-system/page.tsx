export default function DesignSystemHome() {
  return (
    <div className="px-6 py-16 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-20">
        <p className="text-[13px] font-medium text-[#00CAE0] tracking-[0.05em] mb-6">
          Design System
        </p>
        <h1 className="font-heading max-w-4xl mx-auto text-4xl sm:text-5xl md:text-7xl lg:text-[85px] font-medium leading-[1.1] tracking-[-0.02em]">
          基础样式
          <br />
          <span className="text-[#b8b8b8]">展示与参考</span>
        </h1>
        <p className="max-w-xl mx-auto mt-8 text-lg text-[#b8b8b8] leading-[1.8]">
          颜色、字体、间距、圆角、阴影 —— 设计系统的所有基础样式定义。
        </p>
      </div>

        {/* Product Screenshot Placeholder */}
        <section className="px-6 pb-20 md:pb-32">
          <div className="max-w-5xl mx-auto rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#181818] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
            <div className="w-full aspect-video rounded-lg bg-[#181818]/80 flex items-center justify-center border border-white/[0.10]">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-white/[0.08] flex items-center justify-center">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#00CAE0"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                </div>
                <p className="text-sm text-[#b8b8b8] leading-[1.6]">
                  产品截图预览区域
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Typography Preview Section */}
        <section className="px-6 py-20 md:py-32">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-medium tracking-[-0.02em] text-center mb-4">
              字体<span className="text-[#00CAE0]">排版预览</span>
            </h2>
            <p className="text-center text-[#b8b8b8] text-lg leading-[1.8] mb-16 max-w-2xl mx-auto">
              以下展示不同层级的中文字体效果，使用 Noto Sans SC 配合 Inter 实现中英混排。
            </p>

            <div className="space-y-14">
              {/* Display Hero */}
              <div className="space-y-3">
                <p className="text-[13px] text-[#00CAE0] font-medium">Display Hero — 85px</p>
                <p className="font-heading text-[85px] font-medium leading-[1.1] tracking-[-0.02em]">
                  超大标题文字
                </p>
              </div>

              {/* Section Display */}
              <div className="space-y-3">
                <p className="text-[13px] text-[#00CAE0] font-medium">Section Display — 62px</p>
                <p className="font-heading text-[62px] font-medium leading-[1.15] tracking-[-0.02em]">
                  章节展示标题
                </p>
              </div>

              {/* Feature Heading */}
              <div className="space-y-3">
                <p className="text-[13px] text-[#00CAE0] font-medium">Feature Heading — 32px</p>
                <p className="font-heading text-[32px] font-medium leading-[1.3] tracking-[-0.01em]">
                  功能标题展示效果
                </p>
              </div>

              {/* Card Title */}
              <div className="space-y-3">
                <p className="text-[13px] text-[#00CAE0] font-medium">Card Title — 24px</p>
                <p className="font-heading text-[24px] font-medium leading-[1.4]">
                  卡片标题文字效果预览
                </p>
              </div>

              {/* Body Large */}
              <div className="space-y-3">
                <p className="text-[13px] text-[#00CAE0] font-medium">Body Large — 18px</p>
                <p className="text-[18px] text-[#b8b8b8] leading-[1.8]">
                  大号正文文字，用于重要的段落说明和描述性内容。这里展示的是中文排版在深色背景上的阅读体验。较大的行高让方块字之间保持足够的呼吸空间。
                </p>
              </div>

              {/* Body */}
              <div className="space-y-3">
                <p className="text-[13px] text-[#00CAE0] font-medium">Body — 15px</p>
                <p className="text-[15px] text-[#b8b8b8] leading-[1.8]">
                  常规正文文字，适用于大部分内容场景。好的排版应该让读者忘记文字本身的存在，而专注于内容所传达的信息。深色背景下的中文排版需要特别注意行高和字间距的平衡，推荐行高为字号的 1.6 至 2.0 倍。
                </p>
              </div>

              {/* Caption */}
              <div className="space-y-3">
                <p className="text-[13px] text-[#00CAE0] font-medium">Caption — 14px</p>
                <p className="text-[14px] text-[#b8b8b8] leading-[1.7]">
                  辅助说明文字，常用于图片说明、脚注、提示信息等场景。字号较小但依然保持良好的可读性。中文笔画密集，适当增加行距避免视觉拥挤。
                </p>
              </div>

              {/* Label */}
              <div className="space-y-3">
                <p className="text-[13px] text-[#00CAE0] font-medium">Label — 13px</p>
                <p className="text-[13px] text-[#b8b8b8] leading-[1.7] font-medium">
                  标签文字 · 用于按钮、导航、表单标签等 UI 元素 · 字重 500 增强辨识度
                </p>
              </div>

              {/* Mixed Chinese & English */}
              <div className="space-y-3">
                <p className="text-[13px] text-[#00CAE0] font-medium">中英混排 — 15px</p>
                <p className="text-[15px] text-[#b8b8b8] leading-[1.8]">
                  Next.js 14 搭配 shadcn/ui 组件库，使用 TailwindCSS v4 构建。支持 TypeScript 类型检查，开发效率提升 200%。API 响应时间 &lt; 50ms，Lighthouse 评分 98 分。Noto Sans SC 与 Inter 风格接近，混排时视觉和谐统一。
                </p>
              </div>

              {/* Comparison: Before vs After */}
              <div className="space-y-3 pt-8 border-t border-white/[0.10]">
                <p className="text-[13px] text-[#00CAE0] font-medium">对比：英文极端负字距 vs 中文适度字距</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <p className="text-[11px] text-[#b8b8b8] uppercase tracking-wider">英文 — tracking: -0.05em</p>
                    <p className="font-sans text-[48px] font-medium leading-[0.95] tracking-[-0.05em]">
                      Build Fast
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[11px] text-[#b8b8b8] uppercase tracking-wider">中文 — tracking: -0.02em</p>
                    <p className="font-heading text-[48px] font-medium leading-[1.1] tracking-[-0.02em]">
                      极速构建
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-6 py-20 md:py-32">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-medium tracking-[-0.02em] text-center mb-4">
              为<span className="text-[#00CAE0]">开发者</span>而设计
            </h2>
            <p className="text-center text-[#b8b8b8] text-lg leading-[1.8] mb-16 max-w-2xl mx-auto">
              每一个组件、每一个像素、每一次交互 —— 都以开发体验为核心精心打造。
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: "深色优先设计",
                  description:
                    "纯黑画布上精心打造的层级系统，搭配蓝色光环边框营造空间深度感。",
                },
                {
                  title: "组件化体系",
                  description:
                    "基于 shadcn/ui 组件库与 TailwindCSS，完全可定制，开箱即用于生产环境。",
                },
                {
                  title: "响应式布局",
                  description:
                    "从移动端到桌面端的流畅自适应布局，每个断点都经过精心设计。",
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="group rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#181818] p-8 transition-shadow hover:shadow-[rgba(255,255,255,0.12)_0px_0px_0px_1px]"
                >
                  <div className="w-10 h-10 mb-5 rounded-lg bg-white/[0.08] flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-[#00CAE0]" />
                  </div>
                  <h3 className="font-heading text-xl font-medium tracking-[-0.01em] mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-[15px] text-[#b8b8b8] leading-[1.8]">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
    </div>
  );
}
