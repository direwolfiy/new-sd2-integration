import { get } from "./client";
import type {
  AiImageModelListResult,
  AiVideoModelConfigDTO,
} from "./types";

export function fetchImageModels() {
  return get<AiImageModelListResult>("/ai/image-models", { status: "AVAILABLE", page_size: "200" });
}

export function fetchAvailableVideoModelsByBusinessType(businessType: number) {
  return get<AiVideoModelConfigDTO[]>(
    "/ai/video-models/available/by-business-type",
    { businessType: String(businessType) },
  );
}
