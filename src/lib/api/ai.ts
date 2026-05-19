import { get } from "./client";
import type { AiImageModelConfigDTO, AiImageModelListResult } from "./types";

export function fetchImageModels() {
  return get<AiImageModelListResult>("/ai/image-models", { status: "AVAILABLE", page_size: "200" });
}
