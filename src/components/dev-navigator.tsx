"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { X, ChevronRight, Zap } from "lucide-react";
import { elements } from "@/mocks/elements";
import { scripts } from "@/mocks/scripts";
import { episodes } from "@/mocks/episodes";
import { projects } from "@/mocks/projects";

interface Scenario {
  state: string;
  path: string;
  hint: string;
  project?: string;
}

const scenarios: { group: string; items: Scenario[] }[] = [
  {
    group: "元素库",
    items: [
      {
        state: "无剧本 · 无元素",
        path: "/project/proj-8/elements",
        hint: "导入剧本引导（粘贴 / 上传 / 跳过）",
        project: "空白项目",
      },
      {
        state: "有剧本 · 无元素",
        path: "/project/proj-7/elements",
        hint: "AI 提取引导（提取 / 手动添加 / 查看剧本）",
        project: "末日快递",
      },
      {
        state: "有元素 · Tab 为空",
        path: "/project/proj-2/elements?tab=prop",
        hint: "道具 Tab 空状态 → 添加道具按钮",
        project: "都市暗影",
      },
      {
        state: "有元素 · 音频为空",
        path: "/project/proj-2/elements?tab=audio",
        hint: "音频 Tab 空状态 → 添加音效按钮",
        project: "都市暗影",
      },
      {
        state: "完整元素库",
        path: "/project/proj-1/elements",
        hint: "角色4 场景3 道具2 音效2 · 网格浏览",
        project: "星辰变",
      },
    ],
  },
  {
    group: "元素库 · 中间态",
    items: [
      {
        state: "导入剧本 · 粘贴",
        path: "/project/proj-8/elements",
        hint: "点击「从剧本提取元素」→ 打开导入 Overlay",
        project: "空白项目",
      },
      {
        state: "剧本分析中",
        path: "/project/proj-7/elements?overlay=script-analysis-progress",
        hint: "AI 分析剧本 · 类型识别 + 分集拆分",
        project: "末日快递",
      },
      {
        state: "提取进度",
        path: "/project/proj-7/elements?overlay=extraction-progress",
        hint: "提取元素进度 · 6 步模拟",
        project: "末日快递",
      },
      {
        state: "搜索无结果",
        path: "/project/proj-1/elements",
        hint: "点击搜索栏 → 输入不存在的关键词",
        project: "星辰变",
      },
      {
        state: "删除确认",
        path: "/project/proj-1/elements",
        hint: "悬停元素 → 菜单 → 删除 → 确认对话框",
        project: "星辰变",
      },
      {
        state: "创建元素",
        path: "/project/proj-1/elements?overlay=create-element",
        hint: "创建元素弹窗 · 输入名称后创建",
        project: "星辰变",
      },
    ],
  },
  {
    group: "分集管理",
    items: [
      {
        state: "有多集（网格 / 列表）",
        path: "/project/proj-1/episodes",
        hint: "6 集 · 不同制作阶段",
        project: "星辰变",
      },
    ],
  },
  {
    group: "单集 · 分镜",
    items: [
      {
        state: "有剧本 · 无分镜",
        path: "/project/proj-1/episode/ep-1-5/storyboard",
        hint: "AI 生成分镜引导",
        project: "九剑仙府",
      },
      {
        state: "分镜制作中",
        path: "/project/proj-1/episode/ep-1-4/storyboard",
        hint: "部分镜头已生成",
        project: "暗流涌动",
      },
    ],
  },
  {
    group: "单集 · 视频",
    items: [
      {
        state: "有分镜 · 无视频",
        path: "/project/proj-1/episode/ep-1-4/video",
        hint: "批量生成视频引导",
        project: "暗流涌动",
      },
    ],
  },
  {
    group: "单集 · 导出",
    items: [
      {
        state: "有视频 · 未导出",
        path: "/project/proj-1/episode/ep-1-3/export",
        hint: "导出配置与提交",
        project: "星辰之力",
      },
      {
        state: "已完成全流程",
        path: "/project/proj-1/episode/ep-1-1/export",
        hint: "导出完成 · 可回看",
        project: "初入秦村",
      },
    ],
  },
  {
    group: "项目设置",
    items: [
      {
        state: "标准设置",
        path: "/project/proj-1/settings",
        hint: "信息 / 风格 / 参数 / 团队",
        project: "星辰变",
      },
    ],
  },
];

export function DevNavigator() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.ctrlKey && e.shiftKey && e.key === "D") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const navigate = useCallback(
    (path: string) => {
      const [basePath, query] = path.split("?");
      if (query) {
        const params = new URLSearchParams(query);
        const tab = params.get("tab");
        if (tab) sessionStorage.setItem("dev-nav-tab", tab);
        const overlay = params.get("overlay");
        if (overlay) sessionStorage.setItem("dev-nav-overlay", overlay);
      }
      router.push(basePath);
      setOpen(false);
    },
    [router]
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-[90] w-10 h-10 rounded-full bg-[#1c1c1c] border border-white/[0.08] shadow-[0_4px_16px_rgba(0,0,0,0.5)] flex items-center justify-center text-[#666] hover:text-white hover:border-white/[0.15] transition-all duration-200"
        title="演示导航 (Ctrl+Shift+D)"
      >
        <Zap size={16} strokeWidth={1.5} />
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-[360px] h-full bg-[#0f0f0f] border-l border-white/[0.06] flex flex-col shadow-[-8px_0_32px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <div>
                <h2 className="text-[15px] font-medium">演示导航</h2>
                <p className="text-[12px] text-[#666] mt-0.5">Ctrl+Shift+D</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-[#666] hover:text-white hover:bg-white/[0.06] transition-colors duration-200"
              >
                <X size={14} strokeWidth={1.5} />
              </button>
            </div>

            <div className="px-5 py-3 border-b border-white/[0.06] bg-white/[0.02]">
              <p className="text-[11px] text-[#666] mb-1">当前位置</p>
              <p className="text-[13px] text-white font-mono truncate">
                {pathname}
              </p>
            </div>

            <div className="flex-1 overflow-auto">
              {scenarios.map((group) => (
                <div key={group.group}>
                  <div className="px-5 pt-4 pb-2">
                    <p className="text-[11px] font-medium text-[#666] uppercase tracking-wider">
                      {group.group}
                    </p>
                  </div>
                  <div className="px-3 pb-2 space-y-0.5">
                    {group.items.map((s) => {
                      const [basePath, query] = s.path.split("?");
                      const params = query ? new URLSearchParams(query) : new URLSearchParams();
                      const expectedTab = params.get("tab");
                      const expectedOverlay = params.get("overlay");

                      const pathMatch = pathname === basePath;
                      let isActive = pathMatch;

                      if (pathMatch && (expectedTab || expectedOverlay)) {
                        let currentState: { tab?: string; overlay?: string | null } = {};
                        try {
                          const raw = sessionStorage.getItem("dev-nav-state");
                          if (raw) currentState = JSON.parse(raw);
                        } catch {}
                        if (expectedTab && currentState.tab !== expectedTab) isActive = false;
                        if (expectedOverlay && currentState.overlay !== expectedOverlay) isActive = false;
                      } else if (pathMatch && !expectedTab && !expectedOverlay) {
                        let currentState: { tab?: string; overlay?: string | null } = {};
                        try {
                          const raw = sessionStorage.getItem("dev-nav-state");
                          if (raw) currentState = JSON.parse(raw);
                        } catch {}
                        if (currentState.overlay) isActive = false;
                      }

                      return (
                        <button
                          key={s.path}
                          onClick={() => navigate(s.path)}
                          className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-colors duration-200 group relative overflow-hidden ${
                            isActive
                              ? "bg-white/[0.06] text-white"
                              : "text-[#999] hover:bg-white/[0.04] hover:text-white"
                          }`}
                        >
                          {isActive && (
                            <div className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-full bg-[#00CAE0]" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`text-[13px] font-medium ${isActive ? "text-[#00CAE0]" : ""}`}>
                                {s.state}
                              </span>
                              {s.project && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? "bg-[#00CAE0]/10 text-[#00CAE0]/70" : "bg-white/[0.06] text-[#666]"}`}>
                                  {s.project}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-[#555] mt-0.5">
                              {s.hint}
                            </p>
                          </div>
                          <ChevronRight
                            size={14}
                            strokeWidth={1.5}
                            className="shrink-0 mt-0.5 text-[#333] group-hover:text-[#666] transition-colors duration-200"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
