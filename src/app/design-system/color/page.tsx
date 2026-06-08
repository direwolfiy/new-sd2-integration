"use client";

import { useState, useMemo } from "react";

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

function makeAccent(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  return {
    color: hex,
    bg: `rgba(${r},${g},${b},0.08)`,
    border: `rgba(${r},${g},${b},0.15)`,
    text: `rgba(${r},${g},${b},0.8)`,
  };
}

const presets = [
  { hex: "#00CAE0", name: "深海蓝" },
  { hex: "#24FFE9", name: "电光青" },
  { hex: "#2486B9", name: "靛蓝" },
  { hex: "#f472b6", name: "玫瑰" },
  { hex: "#a78bfa", name: "薰衣草" },
  { hex: "#e8786a", name: "柔珊瑚" },
  { hex: "#7eb88a", name: "雾绿" },
  { hex: "#d77757", name: "赤陶" },
];

const neutrals = [
  { color: "#0a0a0a", label: "L0 背景" },
  { color: "#141414", label: "L1 卡片" },
  { color: "#1c1c1c", label: "L2 浮层" },
  { color: "#262626", label: "L3 输入" },
  { color: "#333333", label: "L4 高亮" },
  { color: "#666666", label: "三级文字" },
  { color: "#999999", label: "二级文字" },
  { color: "#ffffff", label: "一级文字" },
];

export default function ColorShowcase() {
  const [accentHex, setAccentHex] = useState("#00CAE0");
  const [customHex, setCustomHex] = useState("#00CAE0");
  const accent = useMemo(() => makeAccent(accentHex), [accentHex]);
  const [tabActive, setTabActive] = useState(0);
  const [toggled, setToggled] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <div className="px-6 py-16 max-w-6xl mx-auto space-y-20">
      {/* Header */}
      <div>
        <p className="text-[13px] font-medium mb-2" style={{ color: accent.text }}>Color System</p>
        <h1 className="font-heading text-4xl font-medium tracking-[-0.02em] mb-3">
          色彩体系
        </h1>
        <p className="text-[15px] text-[#b8b8b8] leading-[1.8] max-w-2xl">
          黑白灰为骨，电光青为魂。中性色占 90%，强调色只在关键交互点闪现。
          UI 退后，内容上前。
        </p>
      </div>

      {/* Accent Picker */}
      <div className="rounded-xl border border-white/[0.10] bg-[#181818] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">切换强调色</p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customHex}
              onChange={(e) => setCustomHex(e.target.value)}
              className="h-8 w-24 px-3 rounded-lg bg-[#2b2b2b] border border-white/10 text-white text-[13px] font-mono placeholder:text-white/20 focus:outline-none focus:border-white/30"
              placeholder="#000000"
            />
            <button
              onClick={() => { if (/^#[0-9a-fA-F]{6}$/.test(customHex)) setAccentHex(customHex); }}
              className="h-8 px-3 rounded-lg bg-white/8 text-[13px] text-white hover:bg-white/12 transition-colors"
            >
              应用
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          {presets.map((p) => (
            <button
              key={p.hex}
              onClick={() => { setAccentHex(p.hex); setCustomHex(p.hex); }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[13px] border transition-all duration-200 ${
                accentHex === p.hex
                  ? "border-white/20 bg-white/[0.08] text-white"
                  : "border-white/[0.10] text-[#a3a3a3] hover:border-white/10 hover:text-[#b8b8b8]"
              }`}
            >
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: p.hex }} />
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Color Palette */}
      <section className="space-y-4">
        <h2 className="font-heading text-xl font-medium tracking-[-0.01em]">色板</h2>
        <div className="rounded-xl border border-white/[0.10] bg-[#181818] p-6 space-y-6">
          <div>
            <p className="text-[11px] text-[#a3a3a3] mb-3 uppercase tracking-wider">Neutrals — 90%</p>
            <div className="flex flex-wrap gap-2">
              {neutrals.map((n) => (
                <div key={n.color} className="flex flex-col items-center gap-1.5">
                  <div className="w-14 h-14 rounded-lg border border-white/10" style={{ backgroundColor: n.color }} />
                  <span className="text-[10px] text-[#a3a3a3]">{n.label}</span>
                  <span className="text-[9px] text-[#888] font-mono">{n.color}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[11px] text-[#a3a3a3] mb-3 uppercase tracking-wider">Accent — 10%</p>
            <div className="flex gap-2">
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-14 h-14 rounded-lg" style={{ backgroundColor: accent.color }} />
                <span className="text-[10px] text-[#a3a3a3]">主色</span>
                <span className="text-[9px] text-[#888] font-mono">{accent.color}</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-14 h-14 rounded-lg border border-white/10" style={{ backgroundColor: accent.bg }} />
                <span className="text-[10px] text-[#a3a3a3]">浅底 8%</span>
                <span className="text-[9px] text-[#888] font-mono">0.08a</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-14 h-14 rounded-lg border border-white/10" style={{ backgroundColor: accent.border }} />
                <span className="text-[10px] text-[#a3a3a3]">边框 15%</span>
                <span className="text-[9px] text-[#888] font-mono">0.15a</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-14 h-14 rounded-lg border border-white/10" style={{ backgroundColor: accent.text }} />
                <span className="text-[10px] text-[#a3a3a3]">文字 80%</span>
                <span className="text-[9px] text-[#888] font-mono">0.8a</span>
              </div>
            </div>
          </div>
          <div>
            <p className="text-[11px] text-[#a3a3a3] mb-3 uppercase tracking-wider">Danger — 独立于强调色</p>
            <div className="flex gap-2">
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-14 h-14 rounded-lg bg-[#ef4444]" />
                <span className="text-[10px] text-[#a3a3a3]">危险</span>
                <span className="text-[9px] text-[#888] font-mono">#ef4444</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-14 h-14 rounded-lg border border-white/10 bg-[rgba(239,68,68,0.1)]" />
                <span className="text-[10px] text-[#a3a3a3]">危险底</span>
                <span className="text-[9px] text-[#888] font-mono">0.1a</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Usage Rules */}
      <section className="space-y-4">
        <h2 className="font-heading text-xl font-medium tracking-[-0.01em]">使用规则</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-white/[0.10] bg-[#181818] p-5 space-y-3">
            <p className="text-sm font-medium text-white">强调色应该出现在</p>
            <ul className="space-y-2 text-[13px] text-[#b8b8b8]">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: accent.color }} />
                卡片/元素选中态（临时高亮，非持久导航）
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: accent.color }} />
                进行中的进度条
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: accent.color }} />
                焦点环（focus ring）
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: accent.color }} />
                次级按钮边框/文字
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: accent.color }} />
                链接文字
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: accent.color }} />
                任务进行中脉冲动画
              </li>
            </ul>
          </div>
          <div className="rounded-xl border border-white/[0.10] bg-[#181818] p-5 space-y-3">
            <p className="text-sm font-medium text-white">强调色不该出现在</p>
            <ul className="space-y-2 text-[13px] text-[#a3a3a3]">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-white/20" />
                主按钮背景（白底黑字才最强）
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-white/20" />
                大块背景色（破坏中性基调）
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-white/20" />
                正常状态下的正文文字
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-white/20" />
                侧栏/导航激活态（用白字 + 微底，不是颜色标记）
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-white/20" />
                错误/失败状态（用独立红色）
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-white/20" />
                已完成状态（用白色）
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-white/20" />
                装饰性渐变或光晕
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Button Hierarchy */}
      <section className="space-y-4">
        <h2 className="font-heading text-xl font-medium tracking-[-0.01em]">按钮层级</h2>
        <div className="rounded-xl border border-white/[0.10] bg-[#181818] p-6 space-y-6">
          <div>
            <p className="text-[11px] text-[#a3a3a3] mb-3 uppercase tracking-wider">Primary — 页面唯一主操作</p>
            <div className="flex flex-wrap items-center gap-3">
              <button className="h-10 px-6 rounded-full bg-white text-[#0a0a0a] text-[13px] font-medium active:scale-[0.97] transition-transform duration-100">
                创建项目
              </button>
              <button className="h-10 px-6 rounded-full bg-white text-[#0a0a0a] text-[13px] font-medium active:scale-[0.97] transition-transform duration-100">
                确认
              </button>
            </div>
          </div>
          <div>
            <p className="text-[11px] text-[#a3a3a3] mb-3 uppercase tracking-wider">Secondary — 次要但相关的操作</p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                className="h-10 px-6 rounded-full text-[13px] font-medium border active:scale-[0.97] transition-transform duration-100"
                style={{ color: accent.text, backgroundColor: accent.bg, borderColor: accent.border }}
              >
                生成视频
              </button>
              <button
                className="h-10 px-6 rounded-full text-[13px] font-medium border active:scale-[0.97] transition-transform duration-100"
                style={{ color: accent.text, backgroundColor: accent.bg, borderColor: accent.border }}
              >
                导出
              </button>
            </div>
          </div>
          <div>
            <p className="text-[11px] text-[#a3a3a3] mb-3 uppercase tracking-wider">Tertiary — 取消、返回等低权重</p>
            <div className="flex flex-wrap items-center gap-3">
              <button className="h-10 px-6 rounded-full bg-white/8 text-white text-[13px] hover:bg-white/12 active:scale-[0.97] transition-all duration-100">
                取消
              </button>
              <button className="h-10 px-6 rounded-full bg-white/8 text-white text-[13px] hover:bg-white/12 active:scale-[0.97] transition-all duration-100">
                返回
              </button>
            </div>
          </div>
          <div>
            <p className="text-[11px] text-[#a3a3a3] mb-3 uppercase tracking-wider">Ghost — 链接、了解更多</p>
            <div className="flex flex-wrap items-center gap-3">
              <button className="h-10 px-6 rounded-full text-[13px] active:scale-[0.97] transition-all duration-100" style={{ color: accent.text }}>
                了解更多 →
              </button>
              <button className="h-10 px-6 rounded-full text-[#a3a3a3] text-[13px] hover:text-[#b8b8b8] active:scale-[0.97] transition-all duration-100">
                重置
              </button>
            </div>
          </div>
          <div>
            <p className="text-[11px] text-[#a3a3a3] mb-3 uppercase tracking-wider">Danger — 不可逆操作（独立红色）</p>
            <div className="flex flex-wrap items-center gap-3">
              <button className="h-10 px-6 rounded-full bg-[rgba(239,68,68,0.1)] text-[#ef4444] text-[13px] font-medium border border-[rgba(239,68,68,0.2)] active:scale-[0.97] transition-transform duration-100">
                删除项目
              </button>
            </div>
          </div>
          <div>
            <p className="text-[11px] text-[#a3a3a3] mb-3 uppercase tracking-wider">Loading — 主/次按钮的加载态</p>
            <div className="flex flex-wrap items-center gap-3">
              <button disabled className="h-10 px-6 rounded-full bg-white/40 text-[#0a0a0a]/50 text-[13px] font-medium cursor-wait inline-flex items-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-black/20 border-t-black/50 rounded-full animate-spin" />
                创建中...
              </button>
              <button disabled className="h-10 px-6 rounded-full text-[13px] font-medium border cursor-wait inline-flex items-center gap-2" style={{ color: accent.text, backgroundColor: accent.bg, borderColor: accent.border, opacity: 0.6 }}>
                <div className="w-3.5 h-3.5 border-2 rounded-full animate-spin" style={{ borderColor: "rgba(36,255,233,0.2)", borderTopColor: accent.text }} />
                生成中...
              </button>
            </div>
          </div>
          <div>
            <p className="text-[11px] text-[#a3a3a3] mb-3 uppercase tracking-wider">Disabled</p>
            <div className="flex flex-wrap items-center gap-3">
              <button disabled className="h-10 px-6 rounded-full bg-white/15 text-white/30 text-[13px] font-medium cursor-not-allowed">
                创建项目
              </button>
              <button disabled className="h-10 px-6 rounded-full text-white/30 text-[13px] border border-white/[0.10] cursor-not-allowed">
                生成视频
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Status */}
      <section className="space-y-4">
        <h2 className="font-heading text-xl font-medium tracking-[-0.01em]">状态标签</h2>
        <p className="text-[14px] text-[#a3a3a3] leading-[1.7]">去掉了 B 端 SaaS 的彩色体系。只有「进行中」用强调色，其余全部灰白。</p>
        <div className="rounded-xl border border-white/[0.10] bg-[#181818] p-6">
          <div className="space-y-4">
            <div>
              <p className="text-[11px] text-[#a3a3a3] mb-2 uppercase tracking-wider">项目状态</p>
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-medium border" style={{ color: accent.text, backgroundColor: accent.bg, borderColor: accent.border }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: accent.color }} />
                  进行中
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] border border-white/10 text-white bg-white/[0.08]">
                  已完结
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] border border-white/10 text-[#a3a3a3] bg-white/[0.08]">
                  已归档
                </span>
              </div>
            </div>
            <div>
              <p className="text-[11px] text-[#a3a3a3] mb-2 uppercase tracking-wider">AI 任务状态</p>
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] border border-white/10 text-[#a3a3a3] bg-white/[0.08]">
                  排队中
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-medium border" style={{ color: accent.text, backgroundColor: accent.bg, borderColor: accent.border }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: accent.color }} />
                  生成中
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] border border-white/10 text-white bg-white/[0.08]">
                  已完成
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] border border-[rgba(239,68,68,0.2)] text-[#ef4444] bg-[rgba(239,68,68,0.06)]">
                  失败
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] border border-white/[0.10] text-white/30 bg-white/[0.05]">
                  已取消
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Progress */}
      <section className="space-y-4">
        <h2 className="font-heading text-xl font-medium tracking-[-0.01em]">进度条</h2>
        <p className="text-[14px] text-[#a3a3a3] leading-[1.7]">已完成 = 白色，进行中 = 强调色，未开始 = 灰色。只有两种颜色，干净。</p>
        <div className="rounded-xl border border-white/[0.10] bg-[#181818] p-6 space-y-5 max-w-lg">
          <div className="space-y-2">
            {[
              { label: "第1集", percent: 100 },
              { label: "第2集", percent: 65 },
              { label: "第3集", percent: 20 },
              { label: "第4集", percent: 0 },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="text-[13px] text-[#b8b8b8] w-10">{item.label}</span>
                <div className="flex-1 h-1 rounded-full bg-white/[0.08]">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.percent}%`,
                      backgroundColor: item.percent === 100 ? "#fff" : item.percent > 0 ? accent.color : "transparent",
                    }}
                  />
                </div>
                <span className="text-[12px] text-[#a3a3a3] w-10 text-right">{item.percent}%</span>
              </div>
            ))}
          </div>

          <div className="border-t border-white/[0.10] pt-5">
            <p className="text-[11px] text-[#a3a3a3] mb-3 uppercase tracking-wider">任务进度卡片（简化版）</p>
            <div className="rounded-lg border border-white/[0.10] bg-[#0a0a0a] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: accent.color }} />
                  <span className="text-sm font-medium">生成分镜 — 第2集</span>
                </div>
                <span className="text-[13px] text-[#a3a3a3]">3/5</span>
              </div>
              <div className="h-0.5 rounded-full bg-white/[0.08]">
                <div className="h-full rounded-full" style={{ width: "60%", backgroundColor: accent.color }} />
              </div>
              <p className="text-[12px] text-[#a3a3a3]">预计剩余 2 分 30 秒</p>
            </div>
          </div>
        </div>
      </section>

{/* Focus & Tabs */}
      <section className="space-y-4">
        <h2 className="font-heading text-xl font-medium tracking-[-0.01em]">焦点环 & 导航</h2>
        <div className="rounded-xl border border-white/[0.10] bg-[#181818] p-6 space-y-6">
          <div className="flex items-center gap-4">
            <button className="h-10 px-5 rounded-full bg-white/8 text-white text-[13px]" style={{ boxShadow: `0 0 0 2px ${accent.color}` }}>
              Focus 按钮
            </button>
            <div className="h-10 px-4 rounded-lg bg-[#2b2b2b] border text-[13px] text-white flex items-center" style={{ borderColor: accent.color, boxShadow: `0 0 0 1px ${accent.color}` }}>
              输入框 focus
            </div>
          </div>
          <div>
            <p className="text-[11px] text-[#a3a3a3] mb-2 uppercase tracking-wider">Tab — 激活态用白字 + 微底</p>
            <div className="flex gap-1 p-1 rounded-full bg-white/[0.08] w-fit">
              {["角色", "场景", "道具", "音效"].map((tab, i) => (
                <button
                  key={tab}
                  onClick={() => setTabActive(i)}
                  className={`px-4 py-1.5 rounded-full text-[13px] transition-all duration-200 ${
                    tabActive === i
                      ? "bg-white/[0.08] text-white"
                      : "text-[#a3a3a3] hover:text-[#b8b8b8]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[11px] text-[#a3a3a3] mb-2 uppercase tracking-wider">左侧导航 — 激活态用白字 + 微底</p>
            <div className="w-48 bg-[#0a0a0a] rounded-lg border border-white/[0.10] p-2 space-y-0.5">
              {["剧本", "工坊", "元素库", "第1集", "第2集"].map((item, i) => (
                <div
                  key={item}
                  className={`px-3 py-2 rounded-md text-[13px] transition-all duration-200 ${
                    i === 2
                      ? "bg-white/[0.10] text-white"
                      : "text-[#b8b8b8] hover:text-white"
                  }`}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Inline Feedback */}
      <section className="space-y-4">
        <h2 className="font-heading text-xl font-medium tracking-[-0.01em]">行内反馈</h2>
        <div className="space-y-3 max-w-lg">
          <div className="flex items-start gap-3 rounded-lg border border-white/[0.10] bg-white/[0.07] p-4">
            <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 bg-white" />
            <p className="text-[14px] text-white leading-[1.7]">分镜生成完成，共 24 张卡片已就绪。</p>
          </div>
          <div className="flex items-start gap-3 rounded-lg border p-4" style={{ borderColor: accent.border, backgroundColor: accent.bg }}>
            <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: accent.color }} />
            <p className="text-[14px] leading-[1.7]" style={{ color: accent.text }}>任务已加入队列，预计等待 3 分钟。</p>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-[rgba(239,68,68,0.15)] bg-[rgba(239,68,68,0.06)] p-4">
            <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 bg-[#ef4444]" />
            <p className="text-[14px] text-[#ef4444] leading-[1.7]">视频生成失败：参考图分辨率不足。</p>
          </div>
        </div>
      </section>
    </div>
  );
}
