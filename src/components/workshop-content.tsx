"use client";

import { useState } from "react";
import { TaskCard } from "./workshop/task-card";
import { GenerationForm } from "./workshop/generation-form";
import type { GenTask, ReferenceImage } from "./workshop/types";

// TODO: [mock] replace with API call
const mockTasks: GenTask[] = [
  { id: "t-5", type: "IMAGE", prompt: "秦羽站在星辰之力觉醒的瞬间，全身散发蓝色星光，背景是无垠宇宙，史诗级画面", model: "NanoBanana-2", status: "PROCESSING", params: ["2K", "16:9"], resultCount: 0, createdAt: "刚刚" },
  { id: "t-4", type: "IMAGE", prompt: "秦羽战斗形态，手持流星泪化形的长剑，身穿星辰铠甲，眼神凌厉，正面全身像", model: "NanoBanana-2", status: "COMPLETED", params: ["2K", "9:16"], resultCount: 1, createdAt: "2 小时前" },
  { id: "t-3", type: "VIDEO", prompt: "镜头从秦村远景缓慢推进到密室入口，夕阳余晖笼罩山谷，电影级运镜", model: "Seedance 2.0", status: "COMPLETED", params: ["5秒", "16:9", "720p", "有声"], resultCount: 1, createdAt: "5 小时前" },
  { id: "t-2", type: "IMAGE", prompt: "九剑仙府外景夜景版，月光洒落云海之上，仙府宫阙若隐若现，东方奇幻风格", model: "Seedream 4.5", status: "COMPLETED", params: ["3K", "16:9"], resultCount: 2, createdAt: "昨天" },
  { id: "t-1", type: "VIDEO", prompt: "流星泪觉醒特效，吊坠爆发出璀璨星光，星光照亮整个密室，粒子特效", model: "Seedance 2.0", status: "FAILED", params: ["5秒", "16:9", "720p"], resultCount: 0, createdAt: "昨天" },
  { id: "t-0", type: "IMAGE", prompt: "秦村清晨场景，炊烟袅袅，远山薄雾，水墨画风格，宁静祥和的古代村庄", model: "NanoBanana-2", status: "COMPLETED", params: ["1K", "16:9"], resultCount: 1, createdAt: "2 天前" },
];

export function WorkshopContent() {
  const [references, setReferences] = useState<ReferenceImage[]>([]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 pt-6 pb-72">
          {mockTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-[15px] text-[#666]">暂无生成记录</p>
              <p className="text-[13px] text-[#444] mt-1">在底部输入框中输入提示词开始创作</p>
            </div>
          ) : (
            mockTasks.map((task) => <TaskCard key={task.id} task={task} />)
          )}
        </div>
      </div>

      <GenerationForm tasks={mockTasks} references={references} setReferences={setReferences} />
    </div>
  );
}
