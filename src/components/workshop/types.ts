export type TaskStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
export type TaskType = "IMAGE" | "VIDEO";

export interface GenTask {
  id: string;
  type: TaskType;
  prompt: string;
  model: string;
  status: TaskStatus;
  params: string[];
  resultCount: number;
  createdAt: string;
}

export interface ReferenceImage {
  id: string;
  source: "local" | "asset" | "inspiration" | "history";
  thumbnailUrl: string;
  name: string;
}

export type ImageSource = "local" | "asset" | "inspiration" | "history";

export const MAX_REFERENCES = 4;
