export default function LayoutShowcase() {
  return (
    <div className="px-6 py-16 max-w-6xl mx-auto space-y-20">
      <div>
        <p className="text-[13px] text-[#00CAE0] font-medium mb-2">Layout Patterns</p>
        <h1 className="font-heading text-4xl font-medium tracking-[-0.02em] mb-3">布局组件</h1>
        <p className="text-[15px] text-[#b8b8b8] leading-[1.8] max-w-2xl">
          平台三级布局体系：外层框架、项目工作台、分集工作台。每级布局通过表面层级和导航结构区分。
        </p>
      </div>

      {/* Surface Hierarchy */}
      <section className="space-y-6">
        <h2 className="font-heading text-2xl font-medium tracking-[-0.01em]">表面层级体系</h2>
        <p className="text-[15px] text-[#b8b8b8] leading-[1.8]">
          五级表面层级，从深到浅，通过背景色和边框营造空间深度。
        </p>
        <div className="space-y-3">
          {[
            { level: "L0 — 页面背景", bg: "#0a0a0a", desc: "最底层画布", value: "#0a0a0a" },
            { level: "L1 — 卡片/面板", bg: "#141414", desc: "基础提升表面", value: "#141414" },
            { level: "L2 — 浮层面板", bg: "#1c1c1c", desc: "弹窗、下拉、悬浮面板", value: "#1c1c1c" },
            { level: "L3 — 输入/内嵌", bg: "#262626", desc: "输入框底色、代码块", value: "#262626" },
            { level: "L4 — 高亮区", bg: "#333333", desc: "选中行、hover 行（带 ring 边框）", value: "#333333", ring: true },
          ].map((item) => (
            <div
              key={item.level}
              className={`flex items-center gap-6 rounded-lg p-4 ${item.ring ? "border border-[rgba(255,255,255,0.06)]" : "border border-white/[0.10]"}`}
              style={{ backgroundColor: item.bg }}
            >
              <div className="w-48 shrink-0">
                <p className="text-sm font-medium">{item.level}</p>
                <p className="text-[13px] text-[#b8b8b8] mt-0.5">{item.desc}</p>
              </div>
              <code className="text-[13px] text-[#00CAE0] font-mono">{item.value}</code>
              <div className="ml-auto w-24 h-8 rounded-md" style={{ backgroundColor: item.bg, border: "1px solid rgba(255,255,255,0.1)" }} />
            </div>
          ))}
        </div>
      </section>

      {/* Outer Frame */}
      <section className="space-y-6">
        <h2 className="font-heading text-2xl font-medium tracking-[-0.01em]">外层框架（全局页）</h2>
        <p className="text-[15px] text-[#b8b8b8] leading-[1.8]">
          三栏式：顶栏（品牌 + 全局状态）+ 左侧导航（全局菜单）+ 内容区。项目列表、资产管理、帮助等全局页面共享此布局。
          进入项目后顶栏切换为面包屑、侧栏切换为项目模块，布局骨架不变。
        </p>
        <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#181818] overflow-hidden">
          {/* Top bar */}
          <div className="h-10 bg-[#0a0a0a] border-b border-white/[0.10] flex items-center px-4 gap-3">
            <div className="w-5 h-5 rounded bg-[#00CAE0]" />
            <span className="text-xs text-white font-medium">SD2</span>
            <div className="flex-1" />
            <div className="flex items-center gap-3">
              <div className="h-7 px-3 rounded-md bg-[#2b2b2b] flex items-center text-[11px] text-[#a3a3a3]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <span className="ml-1.5">搜索...</span>
              </div>
              <div className="w-6 h-6 rounded-full bg-[#2b2b2b] flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>
              <div className="w-6 h-6 rounded-full bg-[#333]" />
            </div>
          </div>
          <div className="flex min-h-[260px]">
            {/* Sidebar */}
            <div className="w-44 shrink-0 bg-[#0a0a0a] border-r border-white/[0.10] py-3 px-2 flex flex-col">
              <div className="px-3 py-2 rounded-md text-[13px] flex items-center gap-2.5 bg-white/[0.10] text-white">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
                项目管理
              </div>
              <div className="px-3 py-2 rounded-md text-[13px] flex items-center gap-2.5 text-[#b8b8b8] hover:text-white hover:bg-white/[0.07]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>
                资产管理
              </div>
              <div className="px-3 py-2 rounded-md text-[13px] flex items-center gap-2.5 text-[#b8b8b8] hover:text-white hover:bg-white/[0.07]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                帮助中心
              </div>
              <div className="px-3 py-2 rounded-md text-[13px] flex items-center gap-2.5 text-[#b8b8b8] hover:text-white hover:bg-white/[0.07]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                意见反馈
              </div>
              <div className="border-t border-white/[0.10] my-2" />
              <div className="px-3 py-2 rounded-md text-[13px] flex items-center gap-2.5 text-[#b8b8b8] hover:text-white hover:bg-white/[0.07]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
                个人设置
              </div>
            </div>
            {/* Content */}
            <div className="flex-1 p-6">
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="rounded-lg border border-white/[0.10] bg-[#1c1c1c] h-24" />
                ))}
              </div>
              <p className="text-[12px] text-[#a3a3a3] mt-3 text-center">项目列表内容区</p>
            </div>
          </div>
        </div>
      </section>

      {/* Project Workspace */}
      <section className="space-y-6">
        <h2 className="font-heading text-2xl font-medium tracking-[-0.01em]">项目工作台</h2>
        <p className="text-[15px] text-[#b8b8b8] leading-[1.8]">
          顶部面包屑 + Tab 导航 + 全宽内容区。Tab 承载模块切换（总剧本、元素库、分集管理）。工坊和项目设置放在顶栏右侧。
        </p>
        <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#181818] overflow-hidden">
          {/* Single-row top bar: breadcrumb + tabs + actions */}
          <div className="h-10 bg-[#0a0a0a] border-b border-white/[0.10] flex items-center px-4 gap-0">
            <div className="flex items-center gap-2 pr-3 border-r border-white/[0.12]">
              <div className="w-5 h-5 rounded bg-white/90" />
              <span className="text-[13px] text-white font-medium">SD2</span>
            </div>
            <div className="flex items-center px-3 border-r border-white/[0.12]">
              <span className="text-[13px] text-white">星辰变</span>
            </div>
            <div className="flex items-center gap-0.5 px-2">
              {[
                { name: "总剧本", active: true },
                { name: "元素库", active: false },
                { name: "分集管理", active: false },
              ].map((item) => (
                <div
                  key={item.name}
                  className={`px-3 h-7 flex items-center text-[13px] rounded-md transition-colors ${
                    item.active
                      ? "bg-white/[0.08] text-white"
                      : "text-[#a3a3a3] hover:text-[#b8b8b8]"
                  }`}
                >
                  {item.name}
                  {item.name === "分集管理" && (
                    <span className="ml-1.5 text-[11px] text-[#a3a3a3] bg-white/[0.10] px-1.5 py-0.5 rounded">{6}</span>
                  )}
                </div>
              ))}
              <div className="w-px h-4 bg-white/[0.10] mx-1.5" />
              <div className="px-2.5 h-7 flex items-center gap-1.5 text-[13px] text-[#b8b8b8] hover:text-white rounded-md hover:bg-white/[0.08] cursor-pointer transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" /><path d="M20 3v4" /><path d="M22 5h-4" /><path d="M4 17v2" /><path d="M5 18H3" /></svg>
                工坊
              </div>
</div>
            <div className="flex-1" />
            <div className="flex gap-3 text-[13px] text-[#a3a3a3]">
              <span className="hover:text-white cursor-pointer">成员</span>
              <span className="hover:text-white cursor-pointer">设置</span>
            </div>
          </div>
          {/* Full-width content */}
          <div className="min-h-[240px] p-6 flex items-center justify-center">
            <p className="text-sm text-[#b8b8b8]">工作区内容 — 总剧本编辑器 / 元素库</p>
          </div>
        </div>
      </section>

      {/* Episode Workspace */}
      <section className="space-y-6">
        <h2 className="font-heading text-2xl font-medium tracking-[-0.01em]">分集工作台</h2>
        <p className="text-[15px] text-[#b8b8b8] leading-[1.8]">
          顶部导航承载阶段切换（剧本→分镜→视频→导出）+ 集数切换，主工作区全宽。右侧可选属性面板按需展开。
        </p>
        <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#181818] overflow-hidden">
          {/* Single-row top bar: breadcrumb + stages + episode switcher */}
          <div className="h-10 bg-[#0a0a0a] border-b border-white/[0.10] flex items-center px-4 gap-0">
            <div className="flex items-center gap-2 pr-3 border-r border-white/[0.12]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span className="text-[13px] text-[#b8b8b8]">星辰变</span>
            </div>
            <div className="flex items-center px-2">
              {[
                { name: "剧本", active: false, completed: true },
                { name: "分镜", active: true, completed: false },
                { name: "视频", active: false, completed: false },
                { name: "导出", active: false, completed: false },
              ].map((item, i, arr) => (
                <div key={item.name} className="flex items-center">
                  <div
                    className={`px-2.5 h-7 flex items-center text-[13px] rounded-md transition-colors ${
                      item.active
                        ? "bg-white/[0.08] text-white"
                        : item.completed
                          ? "text-white/60"
                          : "text-[#a3a3a3] hover:text-[#b8b8b8]"
                    }`}
                  >
                    {item.name}
                  </div>
                  {i < arr.length - 1 && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={item.completed ? "rgba(255,255,255,0.3)" : "#333"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  )}
                </div>
              ))}
              <div className="w-px h-4 bg-white/[0.10] mx-1.5" />
              <div className="px-2.5 h-7 flex items-center gap-1.5 text-[13px] text-[#b8b8b8] hover:text-white rounded-md hover:bg-white/[0.08] cursor-pointer transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" /><path d="M20 3v4" /><path d="M22 5h-4" /><path d="M4 17v2" /><path d="M5 18H3" /></svg>
                工坊
              </div>
</div>
          </div>
          {/* Main Workspace */}
          <div className="flex min-h-[320px]">
            <div className="flex-1 flex flex-col">
              <div className="flex-1 p-6 flex items-center justify-center">
                <div className="text-center space-y-3">
                  <div className="w-16 h-10 mx-auto rounded bg-[#2b2b2b] border border-white/[0.10]" />
                  <p className="text-sm text-[#b8b8b8]">主工作区 — 分镜卡片列表 / 视频预览</p>
                </div>
              </div>
              {/* Bottom Timeline Bar */}
              <div className="h-12 bg-[#0a0a0a] border-t border-white/[0.10] flex items-center px-4 gap-3">
                <div className="flex gap-1">
                  {[20, 40, 30, 50, 25, 35, 45, 28].map((w, i) => (
                    <div
                      key={i}
                      className={`h-7 rounded-sm ${i < 3 ? "bg-[#00CAE0]/30" : "bg-[#2b2b2b]"}`}
                      style={{ width: `${w}px` }}
                    />
                  ))}
                </div>
                <span className="text-[11px] text-[#b8b8b8] ml-auto">00:32 / 02:15</span>
              </div>
            </div>
            {/* Right Properties Panel */}
            <div className="w-52 shrink-0 bg-[#0a0a0a] border-l border-white/[0.10] p-4">
              <p className="text-[13px] font-medium mb-3">属性面板</p>
              <div className="space-y-3">
                <div>
                  <p className="text-[11px] text-[#b8b8b8] mb-1">镜头描述</p>
                  <div className="h-8 rounded bg-[#2b2b2b] border border-white/[0.10]" />
                </div>
                <div>
                  <p className="text-[11px] text-[#b8b8b8] mb-1">时长</p>
                  <div className="h-8 rounded bg-[#2b2b2b] border border-white/[0.10]" />
                </div>
                <div>
                  <p className="text-[11px] text-[#b8b8b8] mb-1">引用元素</p>
                  <div className="flex gap-1">
                    <span className="px-2 py-0.5 rounded-full bg-[#00CAE0]/10 text-[#00CAE0] text-[11px]">角色A</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#00CAE0]/10 text-[#00CAE0] text-[11px]">场景1</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
