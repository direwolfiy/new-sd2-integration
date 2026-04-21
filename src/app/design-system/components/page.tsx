"use client";

import { useState } from "react";

export default function ComponentsShowcase() {
  const [tabActive, setTabActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const [toggled, setToggled] = useState(false);

  return (
    <div className="px-6 py-16 max-w-6xl mx-auto space-y-20">
      <div>
        <p className="text-[13px] text-[#00CAE0] font-medium mb-2">Interactive Components</p>
        <h1 className="font-heading text-4xl font-medium tracking-[-0.02em] mb-3">交互组件</h1>
        <p className="text-[15px] text-[#999999] leading-[1.8] max-w-2xl">
          平台通用交互组件样式参考。所有组件遵循药丸按钮、蓝色光环边框、深色表面的设计语言。
        </p>
      </div>

      {/* Interaction States Matrix */}
      <section className="space-y-6">
        <h2 className="font-heading text-2xl font-medium tracking-[-0.01em]">交互状态矩阵</h2>
        <p className="text-[15px] text-[#999999] leading-[1.8]">
          每个交互元素需要覆盖完整的状态链路。下表定义了六种核心状态的视觉规范。
        </p>

        <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-white/10 text-left bg-[#0a0a0a]">
                <th className="px-5 py-3 font-medium text-[#999999] w-24">状态</th>
                <th className="px-5 py-3 font-medium text-[#999999]">处理方式</th>
                <th className="px-5 py-3 font-medium text-[#999999] w-56">示例</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr>
                <td className="px-5 py-3 text-white font-medium">Default</td>
                <td className="px-5 py-3 text-[#999999]">基础样式，无额外修饰</td>
                <td className="px-5 py-3">
                  <button className="h-9 px-5 rounded-full bg-white/10 text-white text-[13px]">按钮</button>
                </td>
              </tr>
              <tr className="bg-[#0a0a0a]/40">
                <td className="px-5 py-3 text-white font-medium">Hover</td>
                <td className="px-5 py-3 text-[#999999]">背景提亮（+10%）、文字变白、卡片蓝色光环增强</td>
                <td className="px-5 py-3">
                  <button className="h-9 px-5 rounded-full bg-white/20 text-white text-[13px]">按钮</button>
                </td>
              </tr>
              <tr>
                <td className="px-5 py-3 text-white font-medium">Focus</td>
                <td className="px-5 py-3 text-[#999999]">
                  <code className="text-[#00CAE0]">ring-[#00CAE0]</code> 焦点环，确保键盘可访问
                </td>
                <td className="px-5 py-3">
                  <button className="h-9 px-5 rounded-full bg-white/10 text-white text-[13px] ring-2 ring-[#00CAE0] ring-offset-2 ring-offset-[#141414]">按钮</button>
                </td>
              </tr>
              <tr className="bg-[#0a0a0a]/40">
                <td className="px-5 py-3 text-white font-medium">Active</td>
                <td className="px-5 py-3 text-[#999999]">
                  <code className="text-[#00CAE0]">scale(0.97)</code> 轻按反馈，100ms
                </td>
                <td className="px-5 py-3">
                  <button className="h-9 px-5 rounded-full bg-white/15 text-white text-[13px] scale-[0.97]">按钮</button>
                </td>
              </tr>
              <tr>
                <td className="px-5 py-3 text-white font-medium">Disabled</td>
                <td className="px-5 py-3 text-[#999999]">
                  <code className="text-[#00CAE0]">opacity: 0.4</code> + <code className="text-[#00CAE0]">cursor-not-allowed</code>，去掉 hover
                </td>
                <td className="px-5 py-3">
                  <button className="h-9 px-5 rounded-full bg-white/10 text-white text-[13px] opacity-40 cursor-not-allowed" disabled>按钮</button>
                </td>
              </tr>
              <tr className="bg-[#0a0a0a]/40">
                <td className="px-5 py-3 text-white font-medium">Loading</td>
                <td className="px-5 py-3 text-[#999999]">文字替换为 spinner + 状态文案，<code className="text-[#00CAE0]">pointer-events-none</code></td>
                <td className="px-5 py-3">
                  <button className="h-9 px-5 rounded-full bg-white/20 text-white/50 text-[13px] cursor-wait inline-flex items-center gap-2" disabled>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    生成中...
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* State Matrix for Different Elements */}
        <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-6 space-y-6">
          <p className="text-[13px] text-[#999999]">不同元素的完整状态演示 — 交互试试</p>

          {/* Button States */}
          <div>
            <p className="text-[12px] text-[#999999] mb-3 uppercase tracking-wider">按钮状态</p>
            <div className="flex flex-wrap items-center gap-3">
              <button className="h-10 px-6 rounded-full bg-white text-black text-[13px] font-medium hover:bg-white/90 active:scale-[0.97] transition-all duration-100">
                正常
              </button>
              <button className="h-10 px-6 rounded-full bg-white/10 text-white text-[13px] hover:bg-white/20 active:scale-[0.97] transition-all duration-100">
                次要
              </button>
              <button className="h-10 px-6 rounded-full bg-white/10 text-white text-[13px] opacity-40 cursor-not-allowed" disabled>
                禁用
              </button>
              <button
                onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 2000); }}
                disabled={loading}
                className={`h-10 px-6 rounded-full text-[13px] font-medium transition-all duration-200 active:scale-[0.97] ${
                  loading
                    ? "bg-[#00CAE0]/50 text-white/70 cursor-wait inline-flex items-center gap-2"
                    : "bg-[#00CAE0] text-white hover:bg-[#00CAE0]/90"
                }`}
              >
                {loading && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {loading ? "生成中..." : "点击加载"}
              </button>
            </div>
          </div>

          {/* Input States */}
          <div>
            <p className="text-[12px] text-[#999999] mb-3 uppercase tracking-wider">输入框状态</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <p className="text-[11px] text-[#999999]">Default</p>
                <input
                  type="text"
                  placeholder="请输入..."
                  className="w-full h-9 px-3 rounded-lg bg-[#262626] border border-white/10 text-white text-[13px] placeholder:text-white/30 transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <p className="text-[11px] text-[#999999]">Focus</p>
                <input
                  type="text"
                  value="聚焦状态"
                  readOnly
                  className="w-full h-9 px-3 rounded-lg bg-[#262626] border border-[#00CAE0] text-white text-[13px] ring-1 ring-[#00CAE0]"
                />
              </div>
              <div className="space-y-1.5">
                <p className="text-[11px] text-[#999999]">Error</p>
                <input
                  type="text"
                  value="错误状态"
                  readOnly
                  className="w-full h-9 px-3 rounded-lg bg-[#262626] border border-[#ef4444] text-white text-[13px] ring-1 ring-[#ef4444]"
                />
                <p className="text-[11px] text-[#ef4444]">名称不能为空</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-[11px] text-[#999999]">Disabled</p>
                <input
                  type="text"
                  value="不可编辑"
                  disabled
                  className="w-full h-9 px-3 rounded-lg bg-[#262626] border border-white/5 text-white/40 text-[13px] cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Card States */}
          <div>
            <p className="text-[12px] text-[#999999] mb-3 uppercase tracking-wider">项目卡片</p>
            <p className="text-[13px] text-[#666] mb-4">以封面图为底，底部叠加项目名称和日期。图片区域保持纯净，不加状态标签或进度条。</p>
            <div className="flex flex-wrap gap-4">
              {/* Default */}
              <div className="group w-52 rounded-xl overflow-hidden border border-white/5 bg-[#141414] cursor-pointer transition-shadow duration-200 hover:shadow-[rgba(255,255,255,0.12)_0px_0px_0px_1px] hover:border-white/10">
                <div className="relative aspect-[4/3] bg-gradient-to-br from-[#1a2a3a] via-[#0f1f2f] to-[#0a1520]">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-200" />
                </div>
                <div className="relative p-3 -mt-10 bg-gradient-to-t from-[#141414] via-[#141414cc] to-transparent">
                  <p className="text-[14px] font-medium text-white truncate">星辰变</p>
                  <p className="text-[12px] text-[#666] mt-0.5">2026-04-15</p>
                </div>
              </div>

              {/* Hover */}
              <div className="w-52 rounded-xl overflow-hidden border border-white/10 bg-[#141414] cursor-pointer shadow-[rgba(255,255,255,0.12)_0px_0px_0px_1px]">
                <div className="relative aspect-[4/3] bg-gradient-to-br from-[#2a1a2a] via-[#1f0f1f] to-[#150a15]">
                  <div className="absolute inset-0 bg-black/10" />
                </div>
                <div className="relative p-3 -mt-10 bg-gradient-to-t from-[#141414] via-[#141414cc] to-transparent">
                  <p className="text-[14px] font-medium text-white truncate">凡人修仙传</p>
                  <p className="text-[12px] text-[#666] mt-0.5">2026-04-10</p>
                </div>
              </div>

              {/* Selected */}
              <div className="w-52 rounded-xl overflow-hidden border border-[rgba(0,202,224,0.2)] bg-[#141414] cursor-pointer shadow-[rgba(0,202,224,0.15)_0px_0px_0px_1px]">
                <div className="relative aspect-[4/3] bg-gradient-to-br from-[#1a2a1a] via-[#0f1f0f] to-[#0a150a]">
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#00CAE0] flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                </div>
                <div className="relative p-3 -mt-10 bg-gradient-to-t from-[#141414] via-[#141414cc] to-transparent">
                  <p className="text-[14px] font-medium text-white truncate">仙逆</p>
                  <p className="text-[12px] text-[#666] mt-0.5">2026-03-28</p>
                </div>
              </div>
            </div>
          </div>

          {/* Interaction Card States */}
          <div>
            <p className="text-[12px] text-[#999999] mb-3 uppercase tracking-wider">通用卡片交互态</p>
            <div className="flex flex-wrap gap-3">
              {/* Normal */}
              <div className="w-44 rounded-lg border border-[rgba(255,255,255,0.06)] bg-[#141414] p-3 transition-shadow hover:shadow-[rgba(255,255,255,0.12)_0px_0px_0px_1px] cursor-pointer">
                <p className="text-[13px] font-medium">Normal</p>
                <p className="text-[11px] text-[#999999] mt-1">悬停查看光环效果</p>
              </div>
              {/* Selected */}
              <div className="w-44 rounded-lg border border-[rgba(0,202,224,0.2)] bg-[#141414] p-3 shadow-[rgba(0,202,224,0.15)_0px_0px_0px_1px]">
                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-medium">Selected</p>
                  <div className="w-4 h-4 rounded-full bg-[#00CAE0] flex items-center justify-center">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                </div>
                <p className="text-[11px] text-[#999999] mt-1">选中态 — 边框高亮</p>
              </div>
              {/* Dragging */}
              <div className="w-44 rounded-lg border border-[#00CAE0]/50 bg-[#141414] p-3 opacity-80 shadow-[0_8px_24px_rgba(0,0,0,0.4)] scale-[1.02]">
                <p className="text-[13px] font-medium">Dragging</p>
                <p className="text-[11px] text-[#999999] mt-1">拖拽中 — 微放大 + 阴影</p>
              </div>
              {/* Drop target */}
              <div className="w-44 rounded-lg border-2 border-dashed border-[#00CAE0]/40 bg-[#00CAE0]/5 p-3">
                <p className="text-[13px] text-[#00CAE0]/60">Drop Target</p>
                <p className="text-[11px] text-[#999999] mt-1">放置目标 — 虚线指示</p>
              </div>
            </div>
          </div>

          {/* Toggle */}
          <div>
            <p className="text-[12px] text-[#999999] mb-3 uppercase tracking-wider">开关/切换</p>
            <div className="flex items-center gap-6">
              <button
                onClick={() => setToggled(!toggled)}
                className={`w-11 h-6 rounded-full transition-colors duration-200 relative ${toggled ? "bg-[#00CAE0]" : "bg-white/20"}`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${toggled ? "translate-x-6" : "translate-x-1"}`}
                />
              </button>
              <span className="text-[13px] text-[#999999]">{toggled ? "已开启" : "已关闭"}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Buttons */}
      <section className="space-y-6">
        <h2 className="font-heading text-2xl font-medium tracking-[-0.01em]">按钮</h2>
        <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-6 space-y-6">
          <div>
            <p className="text-[13px] text-[#999999] mb-3">Primary — 白底黑字，页面唯一主操作</p>
            <div className="flex flex-wrap items-center gap-3">
              <button className="h-10 px-6 rounded-full bg-white text-black text-[13px] font-medium hover:bg-white/90 active:scale-[0.97] transition-all duration-100">
                创建项目
              </button>
              <button className="h-10 px-6 rounded-full bg-white text-black text-[13px] font-medium hover:bg-white/90 active:scale-[0.97] transition-all duration-100">
                确认
              </button>
            </div>
          </div>
          <div>
            <p className="text-[13px] text-[#999999] mb-3">Secondary — 强调色边框，次要相关操作</p>
            <div className="flex flex-wrap items-center gap-3">
              <button className="h-10 px-6 rounded-full text-[13px] font-medium border border-[rgba(0,202,224,0.15)] bg-[rgba(0,202,224,0.08)] text-[rgba(0,202,224,0.8)] hover:bg-[rgba(0,202,224,0.12)] active:scale-[0.97] transition-all duration-100">
                生成视频
              </button>
              <button className="h-10 px-6 rounded-full text-[13px] font-medium border border-[rgba(0,202,224,0.15)] bg-[rgba(0,202,224,0.08)] text-[rgba(0,202,224,0.8)] hover:bg-[rgba(0,202,224,0.12)] active:scale-[0.97] transition-all duration-100">
                导出
              </button>
            </div>
          </div>
          <div>
            <p className="text-[13px] text-[#999999] mb-3">Tertiary — 灰底，取消/返回等低权重</p>
            <div className="flex flex-wrap items-center gap-3">
              <button className="h-10 px-6 rounded-full bg-white/[0.06] text-white text-[13px] hover:bg-white/[0.1] active:scale-[0.97] transition-all duration-100">
                取消
              </button>
              <button className="h-10 px-6 rounded-full bg-white/[0.06] text-white text-[13px] hover:bg-white/[0.1] active:scale-[0.97] transition-all duration-100">
                返回
              </button>
            </div>
          </div>
          <div>
            <p className="text-[13px] text-[#999999] mb-3">Ghost — 无底色</p>
            <div className="flex flex-wrap items-center gap-3">
              <button className="h-10 px-6 rounded-full text-[rgba(0,202,224,0.8)] text-[13px] hover:bg-white/5 active:scale-[0.97] transition-all duration-100">
                了解更多 →
              </button>
              <button className="h-10 px-6 rounded-full text-[#999999] text-[13px] hover:text-white hover:bg-white/5 active:scale-[0.97] transition-all duration-100">
                重置
              </button>
            </div>
          </div>
          <div>
            <p className="text-[13px] text-[#999999] mb-3">危险操作</p>
            <div className="flex flex-wrap items-center gap-3">
              <button className="h-10 px-6 rounded-full bg-[rgba(239,68,68,0.1)] text-[#ef4444] text-[13px] font-medium border border-[rgba(239,68,68,0.2)] hover:bg-[rgba(239,68,68,0.15)] transition-colors">
                删除项目
              </button>
            </div>
          </div>
          <div>
            <p className="text-[13px] text-[#999999] mb-3">尺寸</p>
            <div className="flex flex-wrap items-center gap-3">
              <button className="h-8 px-4 rounded-full bg-white/10 text-white text-[12px] hover:bg-white/20 transition-colors">
                小号
              </button>
              <button className="h-10 px-6 rounded-full bg-white/10 text-white text-[13px] hover:bg-white/20 transition-colors">
                默认
              </button>
              <button className="h-12 px-8 rounded-full bg-white/10 text-white text-[15px] hover:bg-white/20 transition-colors">
                大号
              </button>
            </div>
          </div>
          <div>
            <p className="text-[13px] text-[#999999] mb-3">带图标</p>
            <div className="flex flex-wrap items-center gap-3">
              <button className="h-10 px-5 rounded-full bg-white text-black text-[13px] font-medium hover:bg-white/90 active:scale-[0.97] transition-all duration-100 inline-flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                新建分集
              </button>
              <button className="h-10 px-5 rounded-full text-[13px] font-medium border border-[rgba(0,202,224,0.15)] bg-[rgba(0,202,224,0.08)] text-[rgba(0,202,224,0.8)] hover:bg-[rgba(0,202,224,0.12)] active:scale-[0.97] transition-all duration-100 inline-flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                开始生成
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Inputs */}
      <section className="space-y-6">
        <h2 className="font-heading text-2xl font-medium tracking-[-0.01em]">输入框</h2>
        <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-6 space-y-5 max-w-lg">
          <div className="space-y-1.5">
            <label className="text-[13px] text-[#999999]">项目名称</label>
            <input
              type="text"
              placeholder="输入项目名称..."
              className="w-full h-10 px-4 rounded-lg bg-[#262626] border border-white/10 text-white text-[14px] placeholder:text-white/30 focus:outline-none focus:border-[#00CAE0] focus:ring-1 focus:ring-[#00CAE0] transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] text-[#999999]">Prompt 编辑</label>
            <textarea
              placeholder="描述你想要生成的画面..."
              rows={3}
              className="w-full px-4 py-3 rounded-lg bg-[#262626] border border-white/10 text-white text-[14px] placeholder:text-white/30 focus:outline-none focus:border-[#00CAE0] focus:ring-1 focus:ring-[#00CAE0] transition-colors resize-none leading-[1.7]"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] text-[#999999]">搜索</label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="搜索项目..."
                className="w-full h-10 pl-9 pr-4 rounded-lg bg-[#262626] border border-white/10 text-white text-[14px] placeholder:text-white/30 focus:outline-none focus:border-[#00CAE0] focus:ring-1 focus:ring-[#00CAE0] transition-colors"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Cards */}
      <section className="space-y-6">
        <h2 className="font-heading text-2xl font-medium tracking-[-0.01em]">卡片</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Project Card */}
          <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] overflow-hidden group hover:shadow-[rgba(255,255,255,0.12)_0px_0px_0px_1px] transition-shadow">
            <div className="aspect-video bg-[#1c1c1c] flex items-center justify-center">
              <p className="text-[13px] text-[#999999]">封面图</p>
            </div>
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-[15px] font-medium">星辰变</h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[rgba(0,202,224,0.08)] text-[#00CAE0] border border-[rgba(255,255,255,0.12)]">
                  进行中
                </span>
              </div>
              <div className="h-1 rounded-full bg-white/5">
                <div className="h-full rounded-full bg-[#00CAE0] w-[65%]" />
              </div>
              <div className="flex items-center justify-between text-[12px] text-[#999999]">
                <span>2/4 集</span>
                <span>2 分钟前编辑</span>
              </div>
            </div>
          </div>

          {/* Element Card */}
          <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] overflow-hidden group hover:shadow-[rgba(255,255,255,0.12)_0px_0px_0px_1px] transition-shadow">
            <div className="aspect-square bg-[#1c1c1c] flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-[#262626]" />
            </div>
            <div className="p-4 space-y-1">
              <h3 className="text-[15px] font-medium">秦羽</h3>
              <p className="text-[12px] text-[#999999]">角色 · 3 个变体</p>
            </div>
          </div>

          {/* Storyboard Card */}
          <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-4 space-y-3 group hover:shadow-[rgba(255,255,255,0.12)_0px_0px_0px_1px] transition-shadow">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-medium text-[#00CAE0]">#03</span>
              <div className="flex-1" />
              <span className="px-2 py-0.5 rounded-full bg-[rgba(34,197,94,0.1)] text-[#22c55e] text-[11px] border border-[rgba(34,197,94,0.2)]">已完成</span>
            </div>
            <p className="text-[14px] text-[#999999] leading-[1.7]">
              秦羽站在山顶，俯瞰远方云海，衣袍随猎猎作响...
            </p>
            <div className="flex gap-1">
              <span className="px-2 py-0.5 rounded-full bg-[#00CAE0]/10 text-[#00CAE0] text-[11px]">秦羽</span>
              <span className="px-2 py-0.5 rounded-full bg-[#00CAE0]/10 text-[#00CAE0] text-[11px]">山顶</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="space-y-6">
        <h2 className="font-heading text-2xl font-medium tracking-[-0.01em]">标签切换</h2>
        <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#141414] p-4">
          <div className="flex gap-1 p-1 rounded-full bg-white/5 w-fit">
            {["角色", "场景", "道具", "音效"].map((tab, i) => (
              <button
                key={tab}
                onClick={() => setTabActive(i)}
                className={`px-4 py-1.5 rounded-full text-[13px] transition-all duration-200 ${
                  tabActive === i
                    ? "bg-white/10 text-white"
                    : "text-[#999999] hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
