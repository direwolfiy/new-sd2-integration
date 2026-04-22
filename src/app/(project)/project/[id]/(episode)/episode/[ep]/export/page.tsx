import { Download, Upload, Play, Maximize2 } from "lucide-react";

export default function ExportPage() {
  return (
    <div className="flex flex-col h-full">
      {/* 工具栏 */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/[0.06]">
        <span className="text-[13px] text-[#666]">成片与导出</span>
        <div className="flex items-center gap-2">
          <button className="h-8 px-4 rounded-full bg-white/[0.06] text-white text-[13px] flex items-center gap-1.5 hover:bg-white/[0.1] transition-colors duration-200">
            <Upload size={14} strokeWidth={1.5} />
            视频超分
          </button>
          <button className="h-8 px-4 rounded-full bg-white text-black text-[13px] font-medium flex items-center gap-1.5 hover:bg-white/90 active:scale-[0.97] transition-all duration-200">
            <Download size={14} strokeWidth={2} />
            导出成片
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* 预览区 */}
          <div className="aspect-video rounded-xl bg-[#141414] border border-white/[0.06] flex items-center justify-center relative">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-white/[0.04] flex items-center justify-center">
                <Play size={24} strokeWidth={1.5} className="text-[#666]" />
              </div>
              <div>
                <p className="text-[15px] text-[#999]">第 3 集 — 星辰之力</p>
                <p className="text-[13px] text-[#666] mt-1">7 个镜头 · 预计时长 03:25</p>
              </div>
            </div>
            <button className="absolute bottom-4 right-4 w-8 h-8 rounded-md bg-white/[0.06] flex items-center justify-center text-[#666] hover:text-white hover:bg-white/[0.1] transition-colors duration-200">
              <Maximize2 size={14} strokeWidth={1.5} />
            </button>
          </div>

          {/* 状态摘要 */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "已完成镜头", value: "2/7", color: "text-white" },
              { label: "生成中", value: "1", color: "text-[#00CAE0]" },
              { label: "待生成", value: "4", color: "text-[#666]" },
              { label: "总时长", value: "03:25", color: "text-white" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-4 rounded-lg bg-[#141414] border border-white/[0.06] text-center"
              >
                <p className={`text-xl font-medium ${stat.color}`}>{stat.value}</p>
                <p className="text-[12px] text-[#666] mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* 视频片段列表 */}
          <div className="space-y-2">
            <h3 className="text-[13px] font-medium text-[#999]">视频片段</h3>
            <div className="space-y-1">
              {[
                { shot: 1, status: "待生成" },
                { shot: 2, status: "已完成", duration: "5s" },
                { shot: 3, status: "已完成", duration: "3s" },
                { shot: 4, status: "生成中" },
                { shot: 5, status: "待生成" },
                { shot: 6, status: "待生成" },
                { shot: 7, status: "待生成" },
              ].map((item) => (
                <div
                  key={item.shot}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-[#141414] border border-white/[0.06]"
                >
                  <span className="text-[13px] text-[#666] w-16">镜头 {item.shot}</span>
                  <div className="w-14 h-8 rounded bg-[#262626] shrink-0" />
                  <span className="flex-1 text-[13px] text-[#999]">
                    {item.status}
                  </span>
                  {item.duration && (
                    <span className="text-[12px] text-[#666]">{item.duration}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
