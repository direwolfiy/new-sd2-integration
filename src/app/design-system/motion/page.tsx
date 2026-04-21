"use client";

import { useState } from "react";

export default function MotionShowcase() {
  const [toggled, setToggled] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLoadingClick = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="px-6 py-16 max-w-6xl mx-auto space-y-20">
      <div>
        <p className="text-[13px] text-[#00CAE0] font-medium mb-2">Motion System</p>
        <h1 className="font-heading text-4xl font-medium tracking-[-0.02em] mb-3">动效系统</h1>
        <p className="text-[15px] text-[#999999] leading-[1.8] max-w-2xl">
          统一的过渡时长、缓动曲线和动画规范。保持界面流畅感的克制，而非炫技。
        </p>
      </div>

      {/* Duration Scale */}
      <section className="space-y-6">
        <h2 className="font-heading text-2xl font-medium tracking-[-0.01em]">过渡时长</h2>
        <p className="text-[15px] text-[#999999] leading-[1.8]">
          三档时长覆盖所有场景。大多数交互用 normal (200ms)，颜色渐变和淡入用 fast (150ms)，布局变化用 slow (300ms)。
        </p>
        <div className="space-y-4">
          {[
            { name: "instant", value: "100ms", desc: "微反馈（按钮 active 缩放、toggle 切换）", tw: "duration-100" },
            { name: "fast", value: "150ms", desc: "颜色变化、淡入淡出、tooltip 出现", tw: "duration-150" },
            { name: "normal", value: "200ms", desc: "默认过渡 — hover、focus、背景色、边框", tw: "duration-200" },
            { name: "slow", value: "300ms", desc: "布局变化、展开收起、面板滑入", tw: "duration-300" },
            { name: "sluggish", value: "500ms", desc: "大范围位移、页面级过渡、骨架屏 shimmer", tw: "duration-500" },
          ].map((item) => (
            <div key={item.name} className="flex items-center gap-6 rounded-lg bg-[#141414] border border-white/5 p-4">
              <div className="w-28 shrink-0">
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-[13px] text-[#00CAE0] font-mono">{item.value}</p>
              </div>
              <div className="flex-1 text-[13px] text-[#999999]">{item.desc}</div>
              <code className="text-[12px] text-white/50 font-mono shrink-0">{item.tw}</code>
            </div>
          ))}
        </div>

        {/* Live Demo */}
        <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-6">
          <p className="text-[13px] text-[#999999] mb-4">实时对比 — 点击切换背景色，观察不同时长</p>
          <div className="flex items-end gap-4">
            {[
              { label: "100ms", tw: "duration-100" },
              { label: "200ms", tw: "duration-200" },
              { label: "300ms", tw: "duration-300" },
              { label: "500ms", tw: "duration-500" },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-2">
                <div
                  className={`w-16 h-16 rounded-lg border transition-colors ${item.tw} ${toggled ? "bg-[#00CAE0] border-[#00CAE0]" : "bg-[#262626] border-white/10"}`}
                />
                <span className="text-[11px] text-[#999999]">{item.label}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => setToggled(!toggled)}
            className="mt-4 h-9 px-5 rounded-full bg-white/10 text-white text-[13px] hover:bg-white/20 transition-colors"
          >
            切换颜色
          </button>
        </div>
      </section>

      {/* Easing Curves */}
      <section className="space-y-6">
        <h2 className="font-heading text-2xl font-medium tracking-[-0.01em]">缓动曲线</h2>
        <p className="text-[15px] text-[#999999] leading-[1.8]">
          ease-out 用于元素出现（快进慢停），ease-in 用于消失（慢起快走），ease-in-out 用于状态切换。
        </p>
        <div className="space-y-4">
          {[
            { name: "ease-out", value: "cubic-bezier(0, 0, 0.2, 1)", desc: "元素出现 — 进入动画、tooltip、面板展开", tw: "ease-out" },
            { name: "ease-in", value: "cubic-bezier(0.4, 0, 1, 1)", desc: "元素消失 — 退出动画、面板收起", tw: "ease-in" },
            { name: "ease-in-out", value: "cubic-bezier(0.4, 0, 0.2, 1)", desc: "状态切换 — 颜色变化、尺寸变化", tw: "ease-in-out" },
            { name: "spring", value: "cubic-bezier(0.34, 1.56, 0.64, 1)", desc: "弹性反馈 — 按钮 active、拖拽释放、点赞动效", tw: "[cubic-bezier(0.34,1.56,0.64,1)]" },
          ].map((item) => (
            <div key={item.name} className="flex items-center gap-6 rounded-lg bg-[#141414] border border-white/5 p-4">
              <div className="w-20 shrink-0">
                <p className="text-sm font-medium">{item.name}</p>
              </div>
              <div className="flex-1 text-[13px] text-[#999999]">{item.desc}</div>
              <code className="text-[11px] text-white/50 font-mono shrink-0 max-w-60 text-right">{item.value}</code>
            </div>
          ))}
        </div>

        {/* Easing Demo */}
        <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-6">
          <p className="text-[13px] text-[#999999] mb-4">点击观察不同缓动曲线的位移效果</p>
          <div className="space-y-3">
            {[
              { name: "ease-out", easing: "ease-out" },
              { name: "ease-in", easing: "ease-in" },
              { name: "ease-in-out", easing: "ease-in-out" },
              { name: "spring", easing: "cubic-bezier(0.34,1.56,0.64,1)" },
            ].map((item) => (
              <div key={item.name} className="flex items-center gap-4">
                <span className="text-[12px] text-[#999999] w-20">{item.name}</span>
                <div className="flex-1 relative h-6">
                  <div
                    className="absolute top-0 left-0 w-6 h-6 rounded bg-[#00CAE0] transition-all duration-500"
                    style={{
                      transitionTimingFunction: item.easing,
                      transform: toggled ? "translateX(calc(100% - 24px))" : "translateX(0)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setToggled(!toggled)}
            className="mt-4 h-9 px-5 rounded-full bg-white/10 text-white text-[13px] hover:bg-white/20 transition-colors"
          >
            滑动
          </button>
        </div>
      </section>

      {/* Shared Transitions */}
      <section className="space-y-6">
        <h2 className="font-heading text-2xl font-medium tracking-[-0.01em]">共享过渡</h2>
        <p className="text-[15px] text-[#999999] leading-[1.8]">
          不同组件类型应使用的标准过渡属性组合。保持全局一致性。
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              name: "交互元素",
              desc: "按钮、链接、图标按钮",
              prop: "transition-colors duration-200 ease-in-out",
              demo: (
                <div className="flex gap-2 mt-2">
                  <button className="h-8 px-4 rounded-full bg-white/10 text-white text-[13px] transition-colors duration-200 ease-in-out hover:bg-white/20">
                    悬停试试
                  </button>
                  <button className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center transition-colors duration-200 ease-in-out hover:bg-white/20">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </button>
                </div>
              ),
            },
            {
              name: "卡片/面板",
              desc: "项目卡片、分镜卡片、属性面板",
              prop: "transition-shadow duration-200 ease-in-out",
              demo: (
                <div className="mt-2 w-40 rounded-lg border border-[rgba(255,255,255,0.06)] bg-[#0a0a0a] p-3 transition-shadow duration-200 ease-in-out hover:shadow-[rgba(255,255,255,0.12)_0px_0px_0px_1px] cursor-pointer">
                  <p className="text-[13px]">悬停卡片</p>
                  <p className="text-[11px] text-[#999999] mt-1">观察光环变化</p>
                </div>
              ),
            },
            {
              name: "展开/收起",
              desc: "面板折叠、详情展开、下拉菜单",
              prop: "transition-all duration-300 ease-out",
              demo: (
                <div className="mt-2">
                  <button
                    onClick={() => setExpanded(!expanded)}
                    className="h-8 px-4 rounded-full bg-white/10 text-white text-[13px] hover:bg-white/20 transition-colors"
                  >
                    {expanded ? "收起" : "展开"}
                  </button>
                  <div
                    className="overflow-hidden transition-all duration-300 ease-out"
                    style={{ maxHeight: expanded ? "120px" : "0px", opacity: expanded ? 1 : 0 }}
                  >
                    <div className="pt-3 text-[13px] text-[#999999] leading-[1.7]">
                      这是展开的内容区域。使用 max-height + opacity 组合实现平滑的展开收起动画。
                    </div>
                  </div>
                </div>
              ),
            },
            {
              name: "浮层出现",
              desc: "Tooltip、Popover、Modal、Dropdown",
              prop: "transition-[opacity,transform] duration-150 ease-out",
              demo: (
                <div className="mt-2 relative">
                  <div className="inline-flex flex-col items-start gap-2">
                    <div className="px-3 py-2 rounded-lg bg-[#1c1c1c] border border-white/10 text-[13px] animate-in fade-in slide-in-from-bottom-1 duration-150">
                      Tooltip 示例文字
                    </div>
                    <div className="px-3 py-2 rounded-lg bg-[#1c1c1c] border border-white/10 text-[13px] shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                      Popover 浮层内容
                    </div>
                  </div>
                </div>
              ),
            },
          ].map((item) => (
            <div key={item.name} className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-5 space-y-3">
              <div>
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-[12px] text-[#999999] mt-0.5">{item.desc}</p>
              </div>
              <code className="block text-[11px] text-[#00CAE0] font-mono bg-[#0a0a0a] rounded px-3 py-2">
                {item.prop}
              </code>
              {item.demo}
            </div>
          ))}
        </div>
      </section>

      {/* Component Animations */}
      <section className="space-y-6">
        <h2 className="font-heading text-2xl font-medium tracking-[-0.01em]">组件动画</h2>
        <p className="text-[15px] text-[#999999] leading-[1.8]">
          特定组件使用的动画效果，用于传达状态变化和引导注意力。
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Spinner */}
          <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-5 space-y-4">
            <p className="text-sm font-medium">Spinner</p>
            <p className="text-[12px] text-[#999999]">加载指示器，用于按钮 loading 和内容区加载</p>
            <div className="flex items-center gap-4">
              <div className="w-5 h-5 border-2 border-white/20 border-t-[#00CAE0] rounded-full animate-spin" />
              <div className="w-4 h-4 border-2 border-white/20 border-t-[#00CAE0] rounded-full animate-spin" />
              <div className="w-3 h-3 border-2 border-white/20 border-t-[#00CAE0] rounded-full animate-spin" />
            </div>
            <code className="block text-[11px] text-white/50 font-mono bg-[#0a0a0a] rounded px-3 py-2">
              border-2 border-white/20 border-t-[#00CAE0] rounded-full animate-spin
            </code>
          </div>

          {/* Pulse Dot */}
          <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-5 space-y-4">
            <p className="text-sm font-medium">Pulse Dot</p>
            <p className="text-[12px] text-[#999999]">状态指示脉冲，用于任务进行中、在线状态</p>
            <div className="flex items-center gap-4">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#22c55e]" />
              </span>
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00CAE0] opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00CAE0]" />
              </span>
            </div>
            <code className="block text-[11px] text-white/50 font-mono bg-[#0a0a0a] rounded px-3 py-2">
              animate-ping opacity-75 (outer) + static dot (inner)
            </code>
          </div>

          {/* Loading Button */}
          <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-5 space-y-4">
            <p className="text-sm font-medium">Loading Button</p>
            <p className="text-[12px] text-[#999999]">点击后进入加载状态的按钮</p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleLoadingClick}
                disabled={loading}
                className={`h-10 px-6 rounded-full text-[13px] font-medium transition-all duration-200 ${
                  loading
                    ? "bg-white/20 text-white/50 cursor-wait pl-4 pr-5 inline-flex items-center gap-2"
                    : "bg-white text-black hover:bg-white/90"
                }`}
              >
                {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {loading ? "生成中..." : "生成视频"}
              </button>
            </div>
            <code className="block text-[11px] text-white/50 font-mono bg-[#0a0a0a] rounded px-3 py-2">
              disabled + spinner + pointer-events-none
            </code>
          </div>

          {/* Shimmer */}
          <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-5 space-y-4">
            <p className="text-sm font-medium">Skeleton Shimmer</p>
            <p className="text-[12px] text-[#999999]">内容加载占位，模拟内容形状</p>
            <div className="space-y-2">
              <div className="h-4 w-3/4 rounded bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-[shimmer_1.5s_ease-in-out_infinite] bg-[length:200%_100%]" />
              <div className="h-4 w-1/2 rounded bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-[shimmer_1.5s_ease-in-out_infinite] bg-[length:200%_100%]" />
              <div className="h-4 w-5/6 rounded bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-[shimmer_1.5s_ease-in-out_infinite] bg-[length:200%_100%]" />
            </div>
            <code className="block text-[11px] text-white/50 font-mono bg-[#0a0a0a] rounded px-3 py-2">
              bg-gradient shimmer 1.5s ease-in-out infinite
            </code>
          </div>

          {/* Scale Press */}
          <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-5 space-y-4">
            <p className="text-sm font-medium">Scale Press</p>
            <p className="text-[12px] text-[#999999]">按钮按下时的微缩放反馈</p>
            <div className="flex items-center gap-3">
              <button className="h-10 px-6 rounded-full bg-white text-black text-[13px] font-medium active:scale-[0.97] transition-transform duration-100">
                点击试试
              </button>
              <button className="h-10 px-6 rounded-full bg-[#00CAE0] text-white text-[13px] font-medium active:scale-[0.97] transition-transform duration-100">
                点击试试
              </button>
            </div>
            <code className="block text-[11px] text-white/50 font-mono bg-[#0a0a0a] rounded px-3 py-2">
              active:scale-[0.97] transition-transform duration-100
            </code>
          </div>

          {/* Fade In */}
          <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-5 space-y-4">
            <p className="text-sm font-medium">Fade + Slide</p>
            <p className="text-[12px] text-[#999999]">浮层/通知的标准出现动画</p>
            <div className="space-y-3">
              <div className="px-4 py-3 rounded-lg bg-[#1c1c1c] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] text-[13px]">
                <span className="text-[#22c55e]">✓</span> 分镜生成完成
              </div>
              <div className="px-4 py-3 rounded-lg bg-[rgba(0,202,224,0.08)] border border-[rgba(255,255,255,0.12)] text-[13px] text-[#00CAE0]">
                任务已加入队列
              </div>
            </div>
            <code className="block text-[11px] text-white/50 font-mono bg-[#0a0a0a] rounded px-3 py-2">
              opacity 0→1 + translateY(4px→0) duration-150 ease-out
            </code>
          </div>
        </div>
      </section>

      {/* Reduced Motion */}
      <section className="space-y-6">
        <h2 className="font-heading text-2xl font-medium tracking-[-0.01em]">减少动画偏好</h2>
        <p className="text-[15px] text-[#999999] leading-[1.8]">
          尊重用户系统设置 <code className="text-[#00CAE0] text-[13px]">prefers-reduced-motion</code>，在全局 CSS 中添加降级规则。
        </p>
        <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-5">
          <pre className="text-[13px] font-mono text-[#999999] leading-[1.8] overflow-x-auto">
{`@layer base {
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
}`}
          </pre>
        </div>
      </section>

      {/* Quick Reference */}
      <section className="space-y-6">
        <h2 className="font-heading text-2xl font-medium tracking-[-0.01em]">速查表</h2>
        <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-white/5 text-left">
                <th className="px-5 py-3 font-medium text-[#999999]">场景</th>
                <th className="px-5 py-3 font-medium text-[#999999]">时长</th>
                <th className="px-5 py-3 font-medium text-[#999999]">缓动</th>
                <th className="px-5 py-3 font-medium text-[#999999]">属性</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[
                ["按钮 hover", "200ms", "ease-in-out", "background-color"],
                ["按钮 active", "100ms", "ease-in-out", "transform (scale)"],
                ["Focus ring", "200ms", "ease-in-out", "box-shadow, border-color"],
                ["Tooltip 出现", "150ms", "ease-out", "opacity, transform"],
                ["Modal 打开", "200ms", "ease-out", "opacity, transform (scale)"],
                ["Modal 关闭", "150ms", "ease-in", "opacity, transform"],
                ["面板展开", "300ms", "ease-out", "max-height, opacity"],
                ["面板收起", "200ms", "ease-in", "max-height, opacity"],
                ["列表排序", "300ms", "ease-in-out", "transform"],
                ["状态标签切换", "200ms", "ease-in-out", "background-color, color"],
                ["进度条推进", "500ms", "ease-in-out", "width"],
                ["Spinner", "800ms", "linear", "rotate (infinite)"],
              ].map(([scene, dur, ease, prop]) => (
                <tr key={scene}>
                  <td className="px-5 py-2.5 text-white">{scene}</td>
                  <td className="px-5 py-2.5 text-[#00CAE0] font-mono">{dur}</td>
                  <td className="px-5 py-2.5 text-[#999999]">{ease}</td>
                  <td className="px-5 py-2.5 text-white/60 font-mono">{prop}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
