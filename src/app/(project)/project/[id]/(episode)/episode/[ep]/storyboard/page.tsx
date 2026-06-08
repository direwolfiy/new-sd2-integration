"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Clock,
  CopyPlus,
  FileText,
  GripVertical,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { toast as sonnerToast } from "sonner";
import { elementsApi, episodesApi, shotsApi, useApi } from "@/lib/api";
import { getChapterContent } from "@/lib/adapters";
import type {
  SeedanceScriptItem,
  SeedanceWorkflowDetail,
  SeedanceWorkflowStatus,
} from "@/lib/api/shots";
import type { SceneRoleItem } from "@/lib/api/types";
import { useParams } from "next/navigation";

type StoryboardDraft = {
  id: string;
  order: number;
  dialogue: string;
  rawDescription: string;
  estimatedDuration: number | null;
  videoPrompt: string;
};

type MentionAsset = {
  id: string;
  name: string;
  type: "role" | "scene" | "prop";
};

type ConfirmAction =
  | {
      type: "delete";
      id: string;
      title: string;
      description: string;
      confirmLabel: string;
    }
  | {
      type: "batch-delete";
      title: string;
      description: string;
      confirmLabel: string;
    };

const terminalWorkflowStatuses: SeedanceWorkflowStatus[] = [
  "SUCCEEDED",
  "FAILED",
  "CANCELLED",
];

function normalizeDialogue(value: SeedanceScriptItem["dialogue"]): string {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string" || typeof item === "number")
          return String(item).trim();
        if (!item || typeof item !== "object") return "";
        const record = item as Record<string, unknown>;
        const name = String(
          record.character_name ?? record.characterName ?? "",
        ).trim();
        const text = String(
          record.text ?? record.dialogue_text ?? record.dialogueText ?? "",
        ).trim();
        return name && text ? `${name}: ${text}` : text || name;
      })
      .filter(Boolean)
      .join("\n");
  }
  return value == null ? "" : String(value).trim();
}

function normalizeDuration(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toDraft(item: SeedanceScriptItem, index: number): StoryboardDraft {
  return {
    id: String(item.id ?? index + 1),
    order: Number(item.sequence ?? index + 1),
    dialogue: normalizeDialogue(item.dialogue),
    rawDescription: String(item.rawDescription ?? "").trim(),
    estimatedDuration: normalizeDuration(item.estimatedDuration),
    videoPrompt: String(item.videoPrompt ?? "").trim(),
  };
}

function normalizeMentionAssets(
  items?: SceneRoleItem[] | null,
): MentionAsset[] {
  if (!Array.isArray(items)) return [];
  const seen = new Set<string>();
  return items
    .map((item) => {
      const record = item as SceneRoleItem & Record<string, unknown>;
      const name = String(
        record.template_name ||
          record.templateName ||
          record.roleName ||
          record.name ||
          "",
      ).trim();
      const rawType = String(
        record.template_type ||
          record.templateType ||
          record.role_type ||
          record.roleType ||
          record.type ||
          "",
      ).toUpperCase();
      const type =
        rawType.includes("SCENE") || rawType === "2"
          ? "scene"
          : rawType.includes("PROP") || rawType === "3"
            ? "prop"
            : "role";
      return {
        id: String(
          record.id ?? record.resource_temp_id ?? record.templateId ?? name,
        ),
        name,
        type,
      } satisfies MentionAsset;
    })
    .filter((asset) => {
      if (!asset.name) return false;
      const key = `${asset.type}:${asset.name}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function formatWorkflowTime(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("zh-CN", { hour12: false });
}

function statusLabel(status?: SeedanceWorkflowStatus | null) {
  if (status === "RUNNING") return "进行中";
  if (status === "PENDING") return "等待中";
  if (status === "SUCCEEDED") return "已完成";
  if (status === "FAILED") return "失败";
  if (status === "CANCELLED") return "已取消";
  return "未开始";
}

function EmptyNoScript() {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.08]">
          <FileText size={24} strokeWidth={1.5} className="text-[#a3a3a3]" />
        </div>
        <h2 className="text-lg font-medium">先准备这一集的剧本</h2>
        <p className="mt-2 text-[13px] leading-[1.7] text-[#a3a3a3]">
          分镜生成依赖分集剧本。补齐剧本后，可以在这里拆分镜头、编辑描述和视频提示词。
        </p>
      </div>
    </div>
  );
}

function ConfirmDialog({
  action,
  loading,
  onCancel,
  onConfirm,
}: {
  action: ConfirmAction | null;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!action) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-[420px] rounded-xl border border-white/[0.14] bg-[#1c1c1c] shadow-[0_16px_48px_rgba(0,0,0,0.5)]">
        <div className="border-b border-white/[0.12] px-5 py-4">
          <h3 className="text-[15px] font-medium text-white">{action.title}</h3>
          <p className="mt-1.5 text-[13px] leading-[1.7] text-[#a3a3a3]">
            {action.description}
          </p>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="h-9 rounded-full bg-white/[0.10] px-4 text-[13px] text-[#b8b8b8] transition-colors hover:bg-white/[0.14] hover:text-white disabled:opacity-50"
          >
            取消
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex h-9 items-center gap-1.5 rounded-full bg-[#ef4444]/20 px-4 text-[13px] font-medium text-[#f87171] transition-colors hover:bg-[#ef4444]/25 disabled:opacity-50"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {action.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyStoryboardState({
  loading,
  onGenerate,
  onCreate,
}: {
  loading: boolean;
  onGenerate: () => void;
  onCreate: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center px-6 py-10">
      <div className="w-full max-w-[420px] text-center">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.08]">
          <Sparkles size={24} strokeWidth={1.5} className="text-[#00CAE0]" />
        </div>
        <h2 className="text-[18px] font-medium text-white">
          开始设计这一集的分镜
        </h2>
        <p className="mt-2 text-[13px] leading-[1.7] text-[#a3a3a3]">
          使用 AI 从剧本拆分镜头，或手动创建第一个分镜。
        </p>
        <div className="mt-7 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onGenerate}
            disabled={loading}
            className="flex h-10 items-center gap-2 rounded-full bg-white px-5 text-[13px] font-medium text-black transition-all hover:bg-white/90 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Sparkles size={15} />
            )}
            AI智能分镜
          </button>
          <button
            type="button"
            onClick={onCreate}
            disabled={loading}
            className="flex h-10 items-center gap-2 rounded-full bg-white/[0.10] px-5 text-[13px] text-white transition-colors hover:bg-white/[0.14] disabled:opacity-50"
          >
            <Plus size={15} />
            创建分镜
          </button>
        </div>
      </div>
    </div>
  );
}

function WorkflowStatusBar({
  detail,
  loading,
  onCancel,
  onRegenerate,
  onResume,
}: {
  detail: SeedanceWorkflowDetail | null;
  loading: boolean;
  onCancel: () => void;
  onRegenerate: () => void;
  onResume: () => void;
}) {
  const running = detail?.status === "RUNNING" || detail?.status === "PENDING";
  const failed = detail?.status === "FAILED";
  if (!detail) return null;

  return (
    <div className="flex items-center justify-between rounded-xl border border-white/[0.12] bg-[#181818] px-4 py-3">
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-white">AI智能分镜</p>
        <p className="mt-0.5 truncate text-[12px] text-[#a3a3a3]">
          {statusLabel(detail.status)} · {formatWorkflowTime(detail.updatedAt)}
          {detail.errorMessage ? ` · ${detail.errorMessage}` : ""}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {running ? (
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex h-8 items-center gap-1.5 rounded-full bg-[#ef4444]/15 px-3 text-[12px] text-[#f87171] transition-colors hover:bg-[#ef4444]/20 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <X size={13} />
            )}
            停止
          </button>
        ) : failed ? (
          <>
            {detail?.runId && detail?.currentNode && (
              <button
                onClick={onResume}
                disabled={loading}
                className="flex h-8 items-center gap-1.5 rounded-full bg-white/[0.10] px-3 text-[12px] text-white transition-colors hover:bg-white/[0.14] disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <RefreshCw size={13} />
                )}
                继续生成
              </button>
            )}
            <button
              onClick={onRegenerate}
              disabled={loading}
              className="flex h-8 items-center gap-1.5 rounded-full bg-white px-3 text-[12px] font-medium text-black transition-all hover:bg-white/90 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Sparkles size={13} />
              )}
              重新生成
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default function StoryboardPage() {
  const params = useParams<{ id: string; ep: string }>();
  const projectId = params.id;
  const episodeId = params.ep;

  const { data: chapter } = useApi(
    () => episodesApi.fetchChapter(episodeId),
    [episodeId],
  );
  const { data: rawMentionAssets } = useApi(
    () => elementsApi.fetchElements(projectId),
    [projectId],
  );
  const hasScript = !!getChapterContent(chapter).trim();

  const [items, setItems] = useState<StoryboardDraft[]>([]);
  const [initialOrder, setInitialOrder] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [generationMeta, setGenerationMeta] =
    useState<shotsApi.GenerationMeta | null>(null);
  const [workflowDetail, setWorkflowDetail] =
    useState<SeedanceWorkflowDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
    null,
  );

  const selectedItem =
    items.find((item) => item.id === selectedId) ?? items[0] ?? null;
  const mentionAssets = useMemo(
    () => normalizeMentionAssets(rawMentionAssets),
    [rawMentionAssets],
  );
  const orderDirty =
    items.length === initialOrder.length &&
    items.some((item, index) => item.id !== initialOrder[index]);
  const selectedCount = selectedIds.length;
  const loadStoryboard = useCallback(async () => {
    if (!episodeId) return;
    setLoading(true);
    try {
      const response = await shotsApi.fetchSeedanceScripts(episodeId, true);
      const nextItems = (response.scripts ?? []).map(toDraft);
      setItems(nextItems);
      setInitialOrder(nextItems.map((item) => item.id));
      setGenerationMeta(response.generationMeta ?? null);
      setSelectedIds((current) =>
        current.filter((id) => nextItems.some((item) => item.id === id)),
      );
      setSelectedId((current) => {
        if (current && nextItems.some((item) => item.id === current))
          return current;
        return nextItems[0]?.id ?? null;
      });
    } catch (error) {
      console.error(error);
      sonnerToast.error("加载分镜失败");
    } finally {
      setLoading(false);
    }
  }, [episodeId]);

  const refreshWorkflowStatus = useCallback(
    async (runId?: string) => {
      if (!episodeId) return null;
      try {
        const detail = await shotsApi.getEpisodeWorkflowStatus(
          episodeId,
          runId,
        );
        setWorkflowDetail(detail);
        return detail;
      } catch (error) {
        console.error(error);
        return null;
      }
    },
    [episodeId],
  );

  useEffect(() => {
    if (!hasScript) return;
    void loadStoryboard();
    void refreshWorkflowStatus();
  }, [hasScript, loadStoryboard, refreshWorkflowStatus]);

  useEffect(() => {
    if (
      !workflowDetail ||
      terminalWorkflowStatuses.includes(workflowDetail.status)
    )
      return;
    const timer = window.setInterval(async () => {
      const detail = await refreshWorkflowStatus(workflowDetail.runId);
      if (detail?.status === "SUCCEEDED") void loadStoryboard();
    }, 3000);
    return () => window.clearInterval(timer);
  }, [loadStoryboard, refreshWorkflowStatus, workflowDetail]);

  const updateItem = (id: string, patch: Partial<StoryboardDraft>) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  };

  const insertMentionAsset = (asset: MentionAsset) => {
    if (!selectedItem) return;
    const token = `@${asset.name}`;
    const currentPrompt = selectedItem.videoPrompt.trim();
    updateItem(selectedItem.id, {
      videoPrompt: currentPrompt.includes(token)
        ? currentPrompt
        : `${currentPrompt}${currentPrompt ? "\n" : ""}${asset.type === "role" ? "角色参考" : asset.type === "scene" ? "场景参考" : "道具参考"}：${token}`,
    });
  };

  const moveItem = (id: string, direction: -1 | 1) => {
    setItems((current) => {
      const index = current.findIndex((item) => item.id === id);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= current.length)
        return current;
      const next = [...current];
      const [moved] = next.splice(index, 1);
      next.splice(nextIndex, 0, moved);
      return next.map((item, idx) => ({ ...item, order: idx + 1 }));
    });
  };

  const saveItem = async (item: StoryboardDraft) => {
    setSavingId(item.id);
    try {
      await shotsApi.updateSeedanceScript(item.id, {
        scriptId: item.id,
        dialogue: item.dialogue,
        rawDescription: item.rawDescription,
        estimatedDuration: item.estimatedDuration,
        videoPrompt: item.videoPrompt,
      });
      await loadStoryboard();
      sonnerToast.success("镜头已保存");
    } catch (error) {
      console.error(error);
      sonnerToast.error("保存镜头失败");
    } finally {
      setSavingId(null);
    }
  };

  const createItem = async (insertAfterScriptId?: string | null) => {
    setBusyAction("create");
    try {
      await shotsApi.createSeedanceScript({
        chapterId: episodeId,
        insertAfterScriptId:
          insertAfterScriptId ?? items[items.length - 1]?.id ?? null,
        dialogue: "",
        rawDescription: "",
        estimatedDuration: null,
        videoPrompt: "",
      });
      await loadStoryboard();
      sonnerToast.success(insertAfterScriptId ? "已插入镜头" : "已新建镜头");
    } catch (error) {
      console.error(error);
      sonnerToast.error("创建镜头失败");
    } finally {
      setBusyAction(null);
    }
  };

  const requestDeleteItem = (id: string) => {
    const index = items.findIndex((item) => item.id === id);
    setConfirmAction({
      type: "delete",
      id,
      title: `删除镜头 ${index >= 0 ? index + 1 : ""}`.trim(),
      description: "删除后将重新整理当前分集的镜头顺序，该操作不可恢复。",
      confirmLabel: "删除镜头",
    });
  };

  const deleteItem = async (id: string) => {
    setBusyAction(`delete-${id}`);
    try {
      await shotsApi.deleteSeedanceScript(id);
      setSelectedIds((current) => current.filter((itemId) => itemId !== id));
      await loadStoryboard();
      sonnerToast.success("镜头已删除");
    } catch (error) {
      console.error(error);
      sonnerToast.error("删除镜头失败");
    } finally {
      setBusyAction(null);
      setConfirmAction(null);
    }
  };

  const requestBatchDelete = () => {
    if (!selectedIds.length) return;
    setConfirmAction({
      type: "batch-delete",
      title: `删除 ${selectedIds.length} 条镜头`,
      description: "选中的镜头会从当前分集中移除，并重新整理剩余镜头顺序。",
      confirmLabel: "批量删除",
    });
  };

  const batchDelete = async () => {
    if (!selectedIds.length) return;
    setBusyAction("batch-delete");
    try {
      await shotsApi.batchDeleteSeedanceScripts(selectedIds);
      setSelectedIds([]);
      await loadStoryboard();
      sonnerToast.success("已删除选中镜头");
    } catch (error) {
      console.error(error);
      sonnerToast.error("批量删除失败");
    } finally {
      setBusyAction(null);
      setConfirmAction(null);
    }
  };

  const saveOrder = async () => {
    if (!orderDirty) return;
    setBusyAction("save-order");
    try {
      await shotsApi.updateSeedanceScriptOrder(
        items.map((item, index) => ({
          scriptId: item.id,
          orderSort: index + 1,
        })),
      );
      await loadStoryboard();
      sonnerToast.success("镜头顺序已保存");
    } catch (error) {
      console.error(error);
      sonnerToast.error("保存顺序失败");
    } finally {
      setBusyAction(null);
    }
  };

  const startWorkflow = async (retryMode?: "fresh") => {
    setBusyAction("workflow");
    try {
      const detail = await shotsApi.startEpisodeWorkflow(
        episodeId,
        retryMode ? { retryMode } : undefined,
      );
      setWorkflowDetail(detail);
      sonnerToast.success(
        retryMode === "fresh" ? "已重新启动分镜工作流" : "已启动分镜工作流",
      );
    } catch (error) {
      console.error(error);
      sonnerToast.error("启动分镜工作流失败");
    } finally {
      setBusyAction(null);
    }
  };

  const resumeWorkflow = async () => {
    if (!workflowDetail?.runId || !workflowDetail.currentNode) return;
    setBusyAction("workflow");
    try {
      const detail = await shotsApi.startEpisodeWorkflow(episodeId, {
        retryMode: "resume",
        resumeRunId: workflowDetail.runId,
        resumeFromNode: workflowDetail.currentNode,
      });
      setWorkflowDetail(detail);
      sonnerToast.success("已继续分镜工作流");
    } catch (error) {
      console.error(error);
      sonnerToast.error("继续分镜工作流失败");
    } finally {
      setBusyAction(null);
    }
  };

  const cancelWorkflow = async () => {
    setBusyAction("workflow");
    try {
      const detail = await shotsApi.cancelEpisodeWorkflow(
        episodeId,
        workflowDetail?.runId,
      );
      setWorkflowDetail(detail);
      sonnerToast.success("已停止分镜工作流");
    } catch (error) {
      console.error(error);
      sonnerToast.error("停止分镜工作流失败");
    } finally {
      setBusyAction(null);
    }
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((itemId) => itemId !== id)
        : [...current, id],
    );
  };

  const allSelected = items.length > 0 && selectedIds.length === items.length;

  const confirmDangerAction = () => {
    if (!confirmAction) return;
    if (confirmAction.type === "delete") {
      void deleteItem(confirmAction.id);
      return;
    }
    void batchDelete();
  };

  if (!hasScript) return <EmptyNoScript />;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/[0.12] px-6 py-3">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
          <div>
            <h2 className="text-[15px] font-medium">分镜设计</h2>
            <p className="mt-0.5 text-[12px] text-[#a3a3a3]">
              {items.length} 个镜头
              {generationMeta?.model ? ` · ${generationMeta.model}` : ""}
              {orderDirty ? " · 顺序待保存" : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {selectedCount > 0 && (
              <button
                onClick={requestBatchDelete}
                disabled={busyAction === "batch-delete"}
                className="flex h-8 items-center gap-1.5 rounded-full bg-[#ef4444]/15 px-3 text-[12px] text-[#f87171] transition-colors hover:bg-[#ef4444]/20 disabled:opacity-50"
              >
                <Trash2 size={13} />
                删除 {selectedCount}
              </button>
            )}
            <button
              onClick={saveOrder}
              disabled={!orderDirty || busyAction === "save-order"}
              className="flex h-8 items-center gap-1.5 rounded-full bg-white/[0.10] px-3 text-[12px] text-white transition-colors hover:bg-white/[0.14] disabled:opacity-40"
            >
              {busyAction === "save-order" ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Save size={13} />
              )}
              保存顺序
            </button>
            <button
              onClick={() => createItem(null)}
              disabled={busyAction === "create"}
              className="flex h-8 items-center gap-1.5 rounded-full bg-white px-4 text-[12px] font-medium text-black transition-all hover:bg-white/90 disabled:opacity-50"
            >
              {busyAction === "create" ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Plus size={13} />
              )}
              新建镜头
            </button>
          </div>
        </div>
      </div>

      {!loading && items.length === 0 ? (
        <EmptyStoryboardState
          loading={busyAction === "workflow" || busyAction === "create"}
          onGenerate={() => startWorkflow()}
          onCreate={() => createItem(null)}
        />
      ) : (
        <div className="min-h-0 flex-1 overflow-auto p-6">
          <div className="mx-auto grid h-full max-w-7xl grid-cols-[minmax(360px,0.92fr)_minmax(420px,1.08fr)] gap-5">
            <section className="flex min-h-0 flex-col rounded-xl border border-white/[0.12] bg-[#101010]">
              <div className="flex items-center justify-between border-b border-white/[0.12] px-4 py-3">
                <span className="text-[13px] font-medium">镜头队列</span>
                <div className="flex items-center gap-2">
                  {items.length > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedIds(
                          allSelected ? [] : items.map((item) => item.id),
                        )
                      }
                      className="h-7 rounded-full px-2.5 text-[12px] text-[#a3a3a3] transition-colors hover:bg-white/[0.08] hover:text-white"
                    >
                      {allSelected ? "清空选择" : "全选"}
                    </button>
                  )}
                  <button
                    onClick={loadStoryboard}
                    disabled={loading}
                    className="flex h-7 items-center gap-1.5 rounded-full px-2.5 text-[12px] text-[#a3a3a3] transition-colors hover:bg-white/[0.08] hover:text-white disabled:opacity-50"
                  >
                    <RefreshCw
                      size={12}
                      className={loading ? "animate-spin" : ""}
                    />
                    刷新
                  </button>
                </div>
              </div>
              <div className="min-h-0 flex-1 space-y-2 overflow-auto p-3">
                {loading && !items.length ? (
                  <div className="flex h-full items-center justify-center text-[13px] text-[#a3a3a3]">
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    加载分镜中
                  </div>
                ) : (
                  items.map((item, index) => {
                    const active = selectedItem?.id === item.id;
                    const checked = selectedIds.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedId(item.id)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setSelectedId(item.id);
                          }
                        }}
                        className={`group w-full rounded-xl border p-3 text-left transition-all ${
                          active
                            ? "border-[#00CAE0]/45 bg-[#00CAE0]/[0.05]"
                            : "border-white/[0.12] bg-[#181818] hover:border-white/[0.20]"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={checked}
                            onClick={(event) => event.stopPropagation()}
                            onChange={() => toggleSelected(item.id)}
                            className="mt-1 h-4 w-4 accent-[#00CAE0]"
                          />
                          <GripVertical
                            size={15}
                            className="mt-0.5 shrink-0 text-[#888]"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[12px] text-[#a3a3a3]">
                                镜头 {index + 1}
                              </span>
                              {item.estimatedDuration != null && (
                                <span className="flex items-center gap-1 rounded-full bg-white/[0.08] px-1.5 py-0.5 text-[10px] text-[#a3a3a3]">
                                  <Clock size={10} />
                                  {item.estimatedDuration}s
                                </span>
                              )}
                            </div>
                            <p className="mt-1 line-clamp-2 text-[13px] leading-[1.6] text-white">
                              {item.rawDescription || item.dialogue || "空镜头"}
                            </p>
                            <p className="mt-1 line-clamp-1 text-[11px] text-[#888]">
                              {item.videoPrompt || "未填写视频提示词"}
                            </p>
                          </div>
                          <div className="flex flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={(event) => {
                                event.stopPropagation();
                                moveItem(item.id, -1);
                              }}
                              className="flex h-6 w-6 items-center justify-center rounded-md text-[#a3a3a3] hover:bg-white/[0.10] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              <ArrowUp size={12} />
                            </button>
                            <button
                              type="button"
                              disabled={index === items.length - 1}
                              onClick={(event) => {
                                event.stopPropagation();
                                moveItem(item.id, 1);
                              }}
                              className="flex h-6 w-6 items-center justify-center rounded-md text-[#a3a3a3] hover:bg-white/[0.10] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              <ArrowDown size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            <div className="flex min-h-0 flex-col gap-4 overflow-auto">
              <WorkflowStatusBar
                detail={workflowDetail}
                loading={busyAction === "workflow"}
                onCancel={cancelWorkflow}
                onRegenerate={() => startWorkflow("fresh")}
                onResume={resumeWorkflow}
              />

              <section className="min-h-[520px] rounded-xl border border-white/[0.12] bg-[#181818]">
                {selectedItem ? (
                  <>
                    <div className="flex items-center justify-between border-b border-white/[0.12] px-4 py-3">
                      <div>
                        <h3 className="text-[14px] font-medium">
                          镜头{" "}
                          {items.findIndex(
                            (item) => item.id === selectedItem.id,
                          ) + 1}
                        </h3>
                        <p className="mt-0.5 text-[12px] text-[#a3a3a3]">
                          编辑文本、画面描述、时长和视频提示词
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => createItem(selectedItem.id)}
                          className="flex h-8 items-center gap-1.5 rounded-full bg-white/[0.10] px-3 text-[12px] text-white transition-colors hover:bg-white/[0.14]"
                        >
                          <CopyPlus size={13} />
                          下方插入
                        </button>
                        <button
                          onClick={() => requestDeleteItem(selectedItem.id)}
                          disabled={busyAction === `delete-${selectedItem.id}`}
                          className="flex h-8 items-center gap-1.5 rounded-full bg-[#ef4444]/15 px-3 text-[12px] text-[#f87171] transition-colors hover:bg-[#ef4444]/20 disabled:opacity-50"
                        >
                          {busyAction === `delete-${selectedItem.id}` ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <Trash2 size={13} />
                          )}
                          删除
                        </button>
                      </div>
                    </div>
                    <div className="space-y-4 p-4">
                      <label className="block">
                        <span className="mb-1.5 block text-[12px] font-medium text-[#b8b8b8]">
                          对话
                        </span>
                        <textarea
                          value={selectedItem.dialogue}
                          onChange={(event) =>
                            updateItem(selectedItem.id, {
                              dialogue: event.target.value,
                            })
                          }
                          rows={4}
                          className="w-full resize-none rounded-lg border border-white/[0.14] bg-[#2b2b2b] px-3 py-2 text-[13px] leading-[1.7] text-white outline-none transition-colors focus:border-[#00CAE0]"
                          placeholder="角色对白、旁白或关键文本"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1.5 block text-[12px] font-medium text-[#b8b8b8]">
                          画面描述
                        </span>
                        <textarea
                          value={selectedItem.rawDescription}
                          onChange={(event) =>
                            updateItem(selectedItem.id, {
                              rawDescription: event.target.value,
                            })
                          }
                          rows={4}
                          className="w-full resize-none rounded-lg border border-white/[0.14] bg-[#2b2b2b] px-3 py-2 text-[13px] leading-[1.7] text-white outline-none transition-colors focus:border-[#00CAE0]"
                          placeholder="镜头内容、构图、人物动作、场景氛围"
                        />
                      </label>
                      <div className="grid grid-cols-[160px_1fr] gap-4">
                        <label className="block">
                          <span className="mb-1.5 block text-[12px] font-medium text-[#b8b8b8]">
                            预计时长
                          </span>
                          <input
                            type="number"
                            min={0}
                            value={selectedItem.estimatedDuration ?? ""}
                            onChange={(event) =>
                              updateItem(selectedItem.id, {
                                estimatedDuration: normalizeDuration(
                                  event.target.value,
                                ),
                              })
                            }
                            className="h-10 w-full rounded-lg border border-white/[0.14] bg-[#2b2b2b] px-3 text-[13px] text-white outline-none transition-colors focus:border-[#00CAE0]"
                            placeholder="秒"
                          />
                        </label>
                        <label className="block">
                          <span className="mb-1.5 block text-[12px] font-medium text-[#b8b8b8]">
                            视频提示词
                          </span>
                          {mentionAssets.length > 0 && (
                            <div className="mb-2 flex flex-wrap gap-1.5">
                              {mentionAssets.slice(0, 18).map((asset) => (
                                <button
                                  key={`${asset.type}-${asset.id}-${asset.name}`}
                                  type="button"
                                  onClick={() => insertMentionAsset(asset)}
                                  className="rounded-full border border-white/[0.12] bg-white/[0.08] px-2 py-1 text-[11px] text-[#b8b8b8] transition-colors hover:border-[#00CAE0]/40 hover:bg-[#00CAE0]/10 hover:text-[#00CAE0]"
                                >
                                  @{asset.name}
                                </button>
                              ))}
                            </div>
                          )}
                          <textarea
                            value={selectedItem.videoPrompt}
                            onChange={(event) =>
                              updateItem(selectedItem.id, {
                                videoPrompt: event.target.value,
                              })
                            }
                            rows={5}
                            className="w-full resize-none rounded-lg border border-white/[0.14] bg-[#2b2b2b] px-3 py-2 text-[13px] leading-[1.7] text-white outline-none transition-colors focus:border-[#00CAE0]"
                            placeholder="描述镜头运动、画面风格、角色和场景。点击上方素材可插入 @ 引用。"
                          />
                        </label>
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={() => saveItem(selectedItem)}
                          disabled={savingId === selectedItem.id}
                          className="flex h-9 items-center gap-1.5 rounded-full bg-white px-5 text-[13px] font-medium text-black transition-all hover:bg-white/90 disabled:opacity-50"
                        >
                          {savingId === selectedItem.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Check size={14} />
                          )}
                          保存镜头
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center text-[13px] text-[#a3a3a3]">
                    选择或新建一个镜头
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog
        action={confirmAction}
        loading={
          busyAction === "batch-delete" ||
          !!(
            confirmAction?.type === "delete" &&
            busyAction === `delete-${confirmAction.id}`
          )
        }
        onCancel={() => setConfirmAction(null)}
        onConfirm={confirmDangerAction}
      />
    </div>
  );
}
