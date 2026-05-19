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
  { feature: "image_generate", model: "SDXL", unitCost: 2, label: "SDXL 图片生成" },
  { feature: "image_generate", model: "Flux Pro", unitCost: 5, label: "Flux Pro 图片生成" },
  { feature: "image_generate", model: "Midjourney", unitCost: 8, label: "Midjourney 图片生成" },
  { feature: "image_upscale", model: "通用", unitCost: 3, label: "超清放大" },
  { feature: "image_turnaround", model: "通用", unitCost: 6, label: "三视图生成" },
  { feature: "video_generate", model: "Seedance 2.0", unitCost: 15, label: "Seedance 2.0 视频生成 (5s)" },
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

export function formatCredits(amount: number | string): string {
  const num = typeof amount === "string" ? Number(amount) : amount;
  if (isNaN(num)) return "0";
  return num.toLocaleString("zh-CN");
}
