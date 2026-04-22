// TODO: [mock] replace with API types and calls

export type GenerationFeature =
  | "image_generate"
  | "image_upscale"
  | "image_turnaround"
  | "video_generate"
  | "storyboard_generate";

export interface CreditPrice {
  feature: GenerationFeature;
  model: string;
  unitCost: number;
  label: string;
}

export const creditPrices: CreditPrice[] = [
  // 图片生成
  { feature: "image_generate", model: "SDXL", unitCost: 2, label: "SDXL 图片生成" },
  { feature: "image_generate", model: "Flux Pro", unitCost: 5, label: "Flux Pro 图片生成" },
  { feature: "image_generate", model: "Midjourney", unitCost: 8, label: "Midjourney 图片生成" },
  // 图片衍生
  { feature: "image_upscale", model: "通用", unitCost: 3, label: "超清放大" },
  { feature: "image_turnaround", model: "通用", unitCost: 6, label: "三视图生成" },
  // 视频生成
  { feature: "video_generate", model: "Seedance 2.0", unitCost: 15, label: "Seedance 2.0 视频生成 (5s)" },
  // 分镜生成
  { feature: "storyboard_generate", model: "通用", unitCost: 3, label: "AI 分镜生成 (单镜头)" },
];

export function getPrice(feature: GenerationFeature, model: string): CreditPrice | undefined {
  return creditPrices.find((p) => p.feature === feature && p.model === model);
}

export function calcImageCost(model: string, countStr: string): number {
  const price = getPrice("image_generate", model);
  if (!price) return 0;
  const count = parseInt(countStr, 10) || 1;
  return price.unitCost * count;
}

export function calcVideoCost(duration: string): number {
  const price = getPrice("video_generate", "Seedance 2.0");
  if (!price) return 0;
  const multiplier = duration === "10s" ? 2 : 1;
  return price.unitCost * multiplier;
}

export function calcStoryboardCost(shotCount: number): number {
  const price = getPrice("storyboard_generate", "通用");
  if (!price) return 0;
  return price.unitCost * shotCount;
}

export type TransactionType = "purchase" | "reward" | "consumption" | "refund";

export interface CreditTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  balanceAfter: number;
  description: string;
  feature?: GenerationFeature;
  createdAt: string;
}

export interface UserCredits {
  userId: string;
  balance: number;
  totalPurchased: number;
  totalReward: number;
  totalConsumed: number;
}

// TODO: [mock] replace with API call
export const currentUserCredits: UserCredits = {
  userId: "user-zhang",
  balance: 1280,
  totalPurchased: 3000,
  totalReward: 500,
  totalConsumed: 2220,
};

// TODO: [mock] replace with API call
export const creditTransactions: CreditTransaction[] = [
  { id: "tx-1", type: "purchase", amount: 2000, balanceAfter: 2000, description: "充值 2000 积分", createdAt: "2025-11-01 10:00" },
  { id: "tx-2", type: "reward", amount: 500, balanceAfter: 2500, description: "新用户注册奖励", createdAt: "2025-11-01 10:01" },
  { id: "tx-3", type: "purchase", amount: 1000, balanceAfter: 3500, description: "充值 1000 积分", createdAt: "2025-11-15 14:22" },
  { id: "tx-4", type: "consumption", amount: -16, balanceAfter: 3484, description: "SDXL 图片生成 ×4", feature: "image_generate", createdAt: "2025-11-20 16:30" },
  { id: "tx-5", type: "consumption", amount: -15, balanceAfter: 3469, description: "Seedance 2.0 视频生成 5s", feature: "video_generate", createdAt: "2025-11-22 11:05" },
  { id: "tx-6", type: "consumption", amount: -15, balanceAfter: 3454, description: "Seedance 2.0 视频生成 5s", feature: "video_generate", createdAt: "2025-11-23 09:18" },
  { id: "tx-7", type: "consumption", amount: -20, balanceAfter: 3434, description: "Flux Pro 图片生成 ×4", feature: "image_generate", createdAt: "2025-12-01 14:40" },
  { id: "tx-8", type: "consumption", amount: -45, balanceAfter: 3389, description: "AI 分镜生成 ×15 镜头", feature: "storyboard_generate", createdAt: "2025-12-03 10:15" },
  { id: "tx-9", type: "consumption", amount: -6, balanceAfter: 3383, description: "三视图生成", feature: "image_turnaround", createdAt: "2025-12-04 15:20" },
  { id: "tx-10", type: "consumption", amount: -30, balanceAfter: 3353, description: "Seedance 2.0 视频生成 5s ×2", feature: "video_generate", createdAt: "2025-12-05 09:50" },
  { id: "tx-11", type: "consumption", amount: -30, balanceAfter: 3323, description: "Midjourney 图片生成 ×4", feature: "image_generate", createdAt: "2025-12-05 10:02" },
  { id: "tx-12", type: "consumption", amount: -10, balanceAfter: 3313, description: "Flux Pro 图片生成 ×2", feature: "image_generate", createdAt: "2025-12-06 14:28" },
  { id: "tx-13", type: "consumption", amount: -8, balanceAfter: 3305, description: "SDXL 图片生成 ×4", feature: "image_generate", createdAt: "2025-12-06 14:32" },
  { id: "tx-14", type: "consumption", amount: -6, balanceAfter: 3299, description: "三视图生成", feature: "image_turnaround", createdAt: "2025-12-07 11:45" },
  { id: "tx-15", type: "consumption", amount: -15, balanceAfter: 3284, description: "Seedance 2.0 视频生成 5s", feature: "video_generate", createdAt: "2025-12-08 16:20" },
  { id: "tx-16", type: "consumption", amount: -3, balanceAfter: 3281, description: "超清放大", feature: "image_upscale", createdAt: "2025-12-09 10:30" },
  { id: "tx-17", type: "consumption", amount: -2001, balanceAfter: 1280, description: "批量视频生成 ×133 镜头", feature: "video_generate", createdAt: "2025-12-10 08:00" },
];

export function getTransactionsByType(type?: TransactionType): CreditTransaction[] {
  if (!type) return creditTransactions;
  return creditTransactions.filter((t) => t.type === type);
}

export function formatCredits(amount: number): string {
  return amount.toLocaleString("zh-CN");
}
