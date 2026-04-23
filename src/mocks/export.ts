// TODO: [mock] replace with API call

export interface BGMTrack {
  id: string;
  name: string;
  duration: number;
  mood: string;
}

export interface SoundEffect {
  id: string;
  name: string;
  duration: number;
  category: string;
}

export interface TransitionType {
  id: string;
  name: string;
}

export interface SubtitleLine {
  id: string;
  shotId: string;
  text: string;
}

export const bgmTracks: BGMTrack[] = [
  { id: "bgm-1", name: "悠远 — 古风氛围", duration: 210, mood: "atmosphere" },
  { id: "bgm-2", name: "破晓 — 史诗战斗", duration: 180, mood: "action" },
  { id: "bgm-3", name: "月下 — 柔情叙事", duration: 195, mood: "emotional" },
  { id: "bgm-4", name: "暗涌 — 悬疑紧张", duration: 165, mood: "suspense" },
  { id: "bgm-5", name: "苍穹 — 宏大场景", duration: 240, mood: "epic" },
];

export const soundEffects: SoundEffect[] = [
  { id: "sfx-1", name: "能量爆发", duration: 2, category: "特效" },
  { id: "sfx-2", name: "风声呼啸", duration: 3, category: "环境" },
  { id: "sfx-3", name: "脚步回响", duration: 1, category: "动作" },
  { id: "sfx-4", name: "石壁碎裂", duration: 2, category: "特效" },
  { id: "sfx-5", name: "心跳加速", duration: 3, category: "情绪" },
  { id: "sfx-6", name: "刀剑出鞘", duration: 1, category: "动作" },
  { id: "sfx-7", name: "星光闪烁", duration: 2, category: "特效" },
  { id: "sfx-8", name: "流水潺潺", duration: 4, category: "环境" },
];

export const transitions: TransitionType[] = [
  { id: "trans-1", name: "淡入淡出" },
  { id: "trans-2", name: "交叉溶解" },
  { id: "trans-3", name: "硬切" },
  { id: "trans-4", name: "白场过渡" },
  { id: "trans-5", name: "黑场过渡" },
];

export const subtitles: SubtitleLine[] = [
  { id: "sub-1", shotId: "shot-1", text: "（夕阳余晖笼罩秦村山谷，镜头缓缓推进至密室入口）" },
  { id: "sub-2", shotId: "shot-2", text: "秦羽盘膝而坐，胸前流星泪发出微弱光芒。" },
  { id: "sub-3", shotId: "shot-3", text: "（额头汗珠滚落，猛然睁眼，眼神中充满不甘）" },
  { id: "sub-4", shotId: "shot-4", text: "流星泪剧烈震动——爆发出璀璨星光！" },
  { id: "sub-5", shotId: "shot-5", text: "宇宙星空旋转，秦羽的身影在星海中漂浮。" },
  { id: "sub-6", shotId: "shot-6", text: "秦羽一掌推向石壁，掌印清晰可见。" },
  { id: "sub-7", shotId: "shot-7", text: "千里之外，仙山云海。白衣老者突然睁眼望向远方。" },
  // ep-1-1
  { id: "sub-8", shotId: "shot-8", text: "（远景，少年秦羽独立山巅，远眺连绵山脉）" },
  { id: "sub-9", shotId: "shot-9", text: "秦政策马飞驰，扬起漫天尘土。" },
  { id: "sub-10", shotId: "shot-10", text: "秦府大厅，秦德面色凝重站在一旁。" },
  { id: "sub-11", shotId: "shot-11", text: "白发老者从袖中取出古朴玉简，嘴角微微上扬。" },
  { id: "sub-12", shotId: "shot-12", text: "秦羽双拳紧握，胸前流星泪微微发光。" },
];
