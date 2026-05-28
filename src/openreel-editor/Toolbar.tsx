import React, { useCallback, useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ChevronDown,
  FileVideo,
  Film,
  Music,
  Loader2,
  X,
  Check,
  FileCode,
  Settings,
  Zap,
  History,
  Diamond,
  ArrowLeft,
} from "lucide-react";
import { useProjectStore } from "../openreel-stores/project-store";
import { useUIStore } from "../openreel-stores/ui-store";
import {
  getExportEngine,
  getDeviceProfile,
  estimateExportTime,
  type VideoExportSettings,
  type AudioExportSettings,
  type ExportResult,
  type DeviceProfile,
  type TimeEstimate,
} from "@openreel/core";
import { ExportDialog } from "./ExportDialog";
import { HistoryPanel } from "./inspector/HistoryPanel";
import { SettingsDialog } from "./settings/SettingsDialog";
import { useSettingsStore } from "../openreel-stores/settings-store";
import { useAnalytics, AnalyticsEvents } from "../openreel-hooks/useAnalytics";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@openreel/ui";

type ExportType =
  | "mp4"
  | "prores"
  | "gif"
  | "wav"
  | "4k-master"
  | "4k-prores"
  | "4k"
  | "1080p-high"
  | "4k-60-master"
  | "1080p-60"
  | "project";

interface ExportState {
  isExporting: boolean;
  progress: number;
  phase: string;
  error: string | null;
  complete: boolean;
}

export const Toolbar: React.FC = () => {
  const { project } = useProjectStore();
  const {
    setExportState: setGlobalExportState,
    keyframeEditorOpen,
    toggleKeyframeEditor,
    panels,
    togglePanel,
  } = useUIStore();
  const params = useParams<{ id: string; ep: string }>();
  const { openSettings } = useSettingsStore();
  const projectId = params.id;
  const episodeId = params.ep;
  const basePath = `/project/${projectId}/episode/${episodeId}`;

  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const { track } = useAnalytics();

  const [exportState, setExportState] = useState<ExportState>({
    isExporting: false,
    progress: 0,
    phase: "",
    error: null,
    complete: false,
  });
  const [deviceProfile, setDeviceProfile] = useState<DeviceProfile | null>(null);
  const [exportEstimates, setExportEstimates] = useState<Map<string, TimeEstimate>>(new Map());

  useEffect(() => {
    setGlobalExportState({
      isExporting: exportState.isExporting,
      progress: exportState.progress,
      phase: exportState.phase,
    });
  }, [exportState.isExporting, exportState.progress, exportState.phase, setGlobalExportState]);

  useEffect(() => {
    if (isExportOpen && !deviceProfile) {
      getDeviceProfile().then(setDeviceProfile);
    }
  }, [isExportOpen, deviceProfile]);

  useEffect(() => {
    if (!deviceProfile || !project.timeline?.duration) {
      return;
    }

    const duration = project.timeline.duration;
    const estimates = new Map<string, TimeEstimate>();

    const configs: Array<{ key: string; width: number; height: number; frameRate: number; codec: "h264" | "h265" | "vp9" | "av1" }> = [
      { key: "mp4", width: project.settings.width, height: project.settings.height, frameRate: 30, codec: "h264" },
      { key: "4k", width: 3840, height: 2160, frameRate: 30, codec: "h264" },
      { key: "4k-60-master", width: 3840, height: 2160, frameRate: 60, codec: "h264" },
      { key: "4k-master", width: 3840, height: 2160, frameRate: 30, codec: "h264" },
      { key: "1080p-high", width: 1920, height: 1080, frameRate: 30, codec: "h264" },
      { key: "1080p-60", width: 1920, height: 1080, frameRate: 60, codec: "h264" },
      { key: "prores", width: project.settings.width, height: project.settings.height, frameRate: 30, codec: "h264" },
    ];

    for (const config of configs) {
      const estimate = estimateExportTime(deviceProfile, {
        width: config.width,
        height: config.height,
        frameRate: config.frameRate,
        duration,
        codec: config.codec,
      });
      estimates.set(config.key, estimate);
    }

    setExportEstimates(estimates);
  }, [deviceProfile, project.timeline?.duration, project.settings.width, project.settings.height]);

  const runExport = useCallback(
    async (videoSettings: Partial<VideoExportSettings>, _ext: string, writableStream: FileSystemWritableFileStream) => {
      const engine = getExportEngine();
      await engine.initialize();

      const generator = engine.exportVideo(project, videoSettings, writableStream);
      let finalResult: ExportResult | undefined;

      while (true) {
        const { value, done } = await generator.next();
        if (done) {
          finalResult = value;
          break;
        }
        setExportState((prev) => ({
          ...prev,
          progress: value.progress * 100,
          phase: value.phase === "complete" ? "Complete!" : `${value.phase}...`,
        }));
      }

      if (finalResult?.success) {
        setExportState((prev) => ({ ...prev, complete: true, phase: "Saved!" }));
        track(AnalyticsEvents.PROJECT_EXPORTED, {
          format: videoSettings.format ?? "mp4",
          codec: videoSettings.codec ?? "h264",
          width: videoSettings.width ?? project.settings.width,
          height: videoSettings.height ?? project.settings.height,
          frameRate: videoSettings.frameRate ?? project.settings.frameRate,
          duration: project.timeline?.duration ?? 0,
        });
      } else {
        throw new Error(finalResult?.error?.message || "Export failed");
      }
    },
    [project, track],
  );

  const showSavePicker = useCallback(async (filename: string, ext: string): Promise<FileSystemWritableFileStream> => {
    const mimeMap: Record<string, string> = {
      mp4: "video/mp4",
      webm: "video/webm",
      mov: "video/quicktime",
      wav: "audio/wav",
    };
    const mime = mimeMap[ext] || "application/octet-stream";

    if ("showSaveFilePicker" in window) {
      const handle = await (window as unknown as {
        showSaveFilePicker: (opts: unknown) => Promise<FileSystemFileHandle>;
      }).showSaveFilePicker({
        suggestedName: filename,
        types: [{
          description: "Media file",
          accept: { [mime]: [`.${ext}`] },
        }],
      });
      return handle.createWritable();
    }

    let buffer = new Uint8Array(16 * 1024 * 1024);
    let length = 0;
    let cursor = 0;

    const grow = (needed: number) => {
      if (needed <= buffer.length) return;
      let newSize = buffer.length;
      while (newSize < needed) newSize *= 2;
      const next = new Uint8Array(newSize);
      next.set(buffer.subarray(0, length));
      buffer = next;
    };

    const triggerDownload = () => {
      const blob = new Blob([buffer.slice(0, length)], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    const writeBytes = (bytes: Uint8Array, position: number) => {
      const end = position + bytes.byteLength;
      grow(end);
      buffer.set(bytes, position);
      if (end > length) length = end;
      cursor = end;
    };

    return {
      seek(position: number) {
        cursor = position;
        return Promise.resolve();
      },
      write(data: unknown) {
        if (data instanceof ArrayBuffer) {
          writeBytes(new Uint8Array(data), cursor);
        } else if (ArrayBuffer.isView(data)) {
          writeBytes(new Uint8Array(data.buffer, data.byteOffset, data.byteLength), cursor);
        }
        return Promise.resolve();
      },
      close() {
        triggerDownload();
        return Promise.resolve();
      },
      abort() {
        return Promise.resolve();
      },
      truncate() {
        return Promise.resolve();
      },
    } as unknown as FileSystemWritableFileStream;
  }, []);

  const handleExport = useCallback(
    async (type: ExportType) => {
      setIsExportOpen(false);

      try {
        if (type === "wav") {
          const writable = await showSavePicker(`${project.name || "export"}.wav`, "wav");

          setExportState({
            isExporting: true,
            progress: 0,
            phase: "Initializing...",
            error: null,
            complete: false,
          });

          const engine = getExportEngine();
          await engine.initialize();

          const audioSettings: Partial<AudioExportSettings> = {
            format: "wav",
            sampleRate: 48000,
            channels: 2,
            bitDepth: 24,
          };

          const generator = engine.exportAudio(project, audioSettings);
          let finalResult: ExportResult | undefined;

          while (true) {
            const { value, done } = await generator.next();
            if (done) {
              finalResult = value;
              break;
            }
            setExportState((prev) => ({
              ...prev,
              progress: value.progress * 100,
              phase: value.phase === "complete" ? "Complete!" : `${value.phase}...`,
            }));
          }

          if (finalResult?.success && finalResult.blob) {
            if ("showSaveFilePicker" in window) {
              await finalResult.blob.stream().pipeTo(writable as unknown as WritableStream<Uint8Array>);
            } else {
              const url = URL.createObjectURL(finalResult.blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `${project.name || "export"}.wav`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }
            setExportState((prev) => ({ ...prev, complete: true, phase: "Saved!" }));
            track(AnalyticsEvents.PROJECT_EXPORTED, {
              format: "wav",
              duration: project.timeline?.duration ?? 0,
            });
          } else {
            try { await writable.abort(); } catch {}
            throw new Error(finalResult?.error?.message || "Export failed");
          }
        } else {
          const base = {
            width: project.settings.width,
            height: project.settings.height,
            frameRate: project.settings.frameRate,
          };

          const presets: Record<string, { settings: Partial<VideoExportSettings>; ext: string }> = {
            mp4: { settings: { ...base, format: "mp4", codec: "h264", bitrate: 12000, quality: 85 }, ext: "mp4" },
            gif: { settings: { ...base, format: "webm", codec: "vp9", bitrate: 8000 }, ext: "webm" },
            project: { settings: { ...base, format: "mp4", codec: "h264", bitrate: 12000, quality: 85 }, ext: "mp4" },
            "4k-60-master": { settings: { ...base, width: 3840, height: 2160, frameRate: 60, format: "mov", codec: "h265", bitrate: 100000, quality: 95 }, ext: "mov" },
            "4k-master": { settings: { ...base, width: 3840, height: 2160, frameRate: 30, format: "mov", codec: "h265", bitrate: 80000, quality: 95 }, ext: "mov" },
            "4k-prores": { settings: { ...base, width: 3840, height: 2160, frameRate: 30, format: "mov", codec: "prores", bitrate: 880000, quality: 100 }, ext: "mov" },
            "4k": { settings: { ...base, width: 3840, height: 2160, frameRate: 30, format: "mp4", codec: "h264", bitrate: 50000, quality: 90 }, ext: "mp4" },
            "1080p-60": { settings: { ...base, width: 1920, height: 1080, frameRate: 60, format: "mp4", codec: "h264", bitrate: 25000, quality: 95 }, ext: "mp4" },
            "1080p-high": { settings: { ...base, width: 1920, height: 1080, frameRate: 30, format: "mp4", codec: "h264", bitrate: 20000, quality: 95 }, ext: "mp4" },
            prores: { settings: { ...base, format: "mov", codec: "prores", bitrate: 220000, quality: 100 }, ext: "mov" },
          };

          const preset = presets[type] ?? presets.mp4;
          const writable = await showSavePicker(`${project.name || "export"}.${preset.ext}`, preset.ext);

          setExportState({
            isExporting: true,
            progress: 0,
            phase: "Initializing...",
            error: null,
            complete: false,
          });

          await runExport(preset.settings, preset.ext, writable);
        }

        setTimeout(() => {
          setExportState({ isExporting: false, progress: 0, phase: "", error: null, complete: false });
        }, 2000);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
        setExportState((prev) => ({
          ...prev,
          isExporting: false,
          error: error instanceof Error ? error.message : "Export failed",
        }));
      }
    },
    [project, track, runExport, showSavePicker],
  );

  const handleCancelExport = useCallback(() => {
    const engine = getExportEngine();
    engine.cancel();
    setExportState({
      isExporting: false,
      progress: 0,
      phase: "",
      error: null,
      complete: false,
    });
  }, []);

  const handleCustomExport = useCallback(
    async (settings: VideoExportSettings) => {
      setIsExportDialogOpen(false);

      try {
        const ext = settings.format === "mov" ? "mov" : settings.format === "webm" ? "webm" : "mp4";
        const writable = await showSavePicker(`${project.name || "export"}.${ext}`, ext);

        setExportState({
          isExporting: true,
          progress: 0,
          phase: "Initializing...",
          error: null,
          complete: false,
        });

        const needsUpscaling =
          settings.width > project.settings.width ||
          settings.height > project.settings.height;

        const exportSettings: Partial<VideoExportSettings> = {
          ...settings,
          upscaling:
            settings.upscaling?.enabled && needsUpscaling
              ? settings.upscaling
              : undefined,
        };

        await runExport(exportSettings, ext, writable);

        track(AnalyticsEvents.PROJECT_EXPORTED, {
          format: settings.format,
          codec: settings.codec,
          width: settings.width,
          height: settings.height,
          frameRate: settings.frameRate,
          duration: project.timeline?.duration ?? 0,
          exportType: "custom",
          upscaling: settings.upscaling?.enabled ?? false,
        });

        setTimeout(() => {
          setExportState({ isExporting: false, progress: 0, phase: "", error: null, complete: false });
        }, 2000);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
        setExportState((prev) => ({
          ...prev,
          isExporting: false,
          error: error instanceof Error ? error.message : "Export failed",
        }));
      }
    },
    [project, track, runExport, showSavePicker],
  );

  const projectRes = `${project.settings.width}×${project.settings.height}`;
  const aspectRatio = project.settings.width / project.settings.height;
  const isVertical = aspectRatio < 0.9;

  const exportOptions: Array<{
    label: string;
    icon: typeof FileVideo;
    desc: string;
    type: ExportType;
    recommended?: boolean;
    separator?: boolean;
  }> = [
    {
      label: "MP4 标准",
      icon: Zap,
      desc: `${projectRes} H.264 - 网络与社交平台`,
      type: "mp4",
      recommended: true,
    },
    {
      label: "",
      icon: Film,
      desc: "",
      type: "mp4",
      separator: true,
    },
    ...(isVertical
      ? []
      : [
          {
            label: "4K 标准",
            icon: FileVideo,
            desc: "3840×2160 - YouTube 4K",
            type: "4k" as ExportType,
          },
        ]),
    {
      label: "1080p 高质量",
      icon: FileVideo,
      desc: "1920×1080 30fps - 高码率",
      type: "1080p-high",
    },
    {
      label: "1080p 60fps",
      icon: FileVideo,
      desc: "1920×1080 - 流畅播放",
      type: "1080p-60",
    },
    {
      label: "仅音频 (WAV)",
      icon: Music,
      desc: "无损音频",
      type: "wav",
    },
  ];

  return (
    <div className="h-12 border-b border-border flex items-center px-4 justify-between bg-background shrink-0 z-30 relative">
      {/* Left: back to video */}
      <div className="flex items-center gap-3">
        <Link
          href={`${basePath}/video`}
          className="flex items-center gap-1.5 text-text-muted hover:text-text-primary transition-colors text-xs"
        >
          <ArrowLeft size={14} strokeWidth={2} />
          <span>返回视频制作</span>
        </Link>
      </div>

      {/* spacer */}
      <div className="flex-1" />

      {/* Right: editor tools + export */}
      <div className="flex items-center gap-2">
        {/* Project JSON */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => useUIStore.getState().openModal("scriptView")}
              className="p-1.5 rounded-lg hover:bg-background-elevated text-text-secondary hover:text-text-primary transition-colors"
            >
              <FileCode size={15} />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>项目 JSON - 导出/导入</p>
          </TooltipContent>
        </Tooltip>

        {/* Settings */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => openSettings()}
              className="p-1.5 rounded-lg hover:bg-background-elevated text-text-secondary hover:text-text-primary transition-colors"
            >
              <Settings size={15} />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>设置与 API 密钥</p>
          </TooltipContent>
        </Tooltip>

        {/* Keyframe editor */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={toggleKeyframeEditor}
              className={`p-1.5 rounded-lg transition-colors ${
                keyframeEditorOpen
                  ? "bg-primary/20 text-primary"
                  : "hover:bg-background-elevated text-text-secondary hover:text-text-primary"
              }`}
            >
              <Diamond size={15} />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>关键帧编辑器</p>
          </TooltipContent>
        </Tooltip>

        {/* Audio mixer */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => togglePanel("audioMixer")}
              className={`p-1.5 rounded-lg transition-colors ${
                panels.audioMixer?.visible
                  ? "bg-primary/20 text-primary"
                  : "hover:bg-background-elevated text-text-secondary hover:text-text-primary"
              }`}
            >
              <Music size={15} />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>混音器</p>
          </TooltipContent>
        </Tooltip>

        {/* History */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              className={`p-1.5 rounded-lg transition-colors ${
                isHistoryOpen
                  ? "bg-primary/20 text-primary"
                  : "hover:bg-background-elevated text-text-secondary hover:text-text-primary"
              }`}
            >
              <History size={15} />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>历史记录 - 撤销/重做</p>
          </TooltipContent>
        </Tooltip>

        {/* Export */}
        <div className="relative">
          {exportState.isExporting ? (
            <div className="h-8 px-3 bg-background-secondary border border-border rounded-lg flex items-center gap-2 min-w-[180px]">
              <Loader2 size={12} className="text-primary animate-spin" />
              <div className="flex-1">
                <div className="text-[9px] text-text-secondary">
                  {exportState.phase}
                </div>
                <div className="h-1 bg-background-tertiary rounded-full mt-0.5 overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-200"
                    style={{ width: `${exportState.progress}%` }}
                  />
                </div>
              </div>
              <button
                onClick={handleCancelExport}
                className="p-0.5 hover:bg-background-tertiary rounded text-text-muted hover:text-error transition-colors"
              >
                <X size={11} />
              </button>
            </div>
          ) : exportState.error ? (
            <div className="h-8 px-3 bg-error/10 border border-error/30 rounded-lg flex items-center gap-2">
              <span className="text-xs text-error">{exportState.error}</span>
              <button
                onClick={() =>
                  setExportState((prev) => ({ ...prev, error: null }))
                }
                className="p-0.5 hover:bg-error/20 rounded text-error transition-colors"
              >
                <X size={11} />
              </button>
            </div>
          ) : exportState.complete ? (
            <div className="h-8 px-3 bg-primary/10 border border-primary/30 rounded-lg flex items-center gap-1.5">
              <Check size={12} className="text-primary" />
              <span className="text-xs text-primary">已下载！</span>
            </div>
          ) : (
            <DropdownMenu open={isExportOpen} onOpenChange={setIsExportOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  className={`h-8 px-3 bg-primary hover:bg-primary-hover active:bg-primary-active text-white font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transform hover:-translate-y-0.5 text-xs ${
                    isExportOpen ? "translate-y-0 shadow-none" : ""
                  }`}
                >
                  <span className="tracking-wider">导出</span>
                  <ChevronDown
                    size={12}
                    className={`transition-transform duration-200 ${
                      isExportOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 p-0 rounded-xl bg-background-secondary border-border">
                <div className="p-3 space-y-1 max-h-[400px] overflow-y-auto">
                  {exportOptions.map((option, index) =>
                    option.separator ? (
                      <DropdownMenuSeparator key={`sep-${index}`} />
                    ) : (
                      <DropdownMenuItem
                        key={option.type + index}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
                          option.recommended
                            ? "bg-primary/10 hover:bg-primary/20 border border-primary/30"
                            : ""
                        }`}
                        onClick={() => handleExport(option.type)}
                      >
                        <div
                          className={`p-2 rounded-lg transition-colors ${
                            option.recommended
                              ? "bg-primary/20 text-primary"
                              : "bg-background-tertiary group-hover:bg-background-elevated text-text-secondary group-hover:text-primary"
                          }`}
                        >
                          <option.icon size={18} />
                        </div>
                        <div className="flex-1">
                          <div
                            className={`text-sm font-medium transition-colors ${
                              option.recommended
                                ? "text-primary"
                                : "text-text-primary"
                            }`}
                          >
                            {option.label}
                            {option.recommended && (
                              <span className="ml-2 text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                                推荐
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-text-muted mt-0.5">
                            {option.desc}
                          </div>
                          {exportEstimates.get(option.type) && (
                            <div className="text-[10px] text-text-secondary mt-1">
                              Est. {exportEstimates.get(option.type)?.formatted}
                            </div>
                          )}
                        </div>
                      </DropdownMenuItem>
                    ),
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="flex items-center gap-3 p-3 rounded-lg cursor-pointer"
                    onClick={() => setIsExportDialogOpen(true)}
                  >
                    <div className="p-2 bg-primary/10 rounded-lg text-primary transition-colors">
                      <Settings size={18} />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-primary transition-colors">
                        Custom Export...
                      </div>
                      <div className="text-xs text-text-muted mt-0.5">
                        完整设置与 AI 超分
                      </div>
                    </div>
                    <Settings
                      size={14}
                      className="text-text-muted"
                    />
                  </DropdownMenuItem>
                </div>
                <div className="bg-background-tertiary px-3 py-2.5 text-xs text-center text-text-muted border-t border-border">
                  {project.settings.width}×{project.settings.height} •{" "}
                  {project.settings.frameRate}fps
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <ExportDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        onExport={handleCustomExport}
        duration={project.timeline?.duration ?? 0}
        projectWidth={project.settings?.width ?? 1920}
        projectHeight={project.settings?.height ?? 1080}
      />

      <SettingsDialog />

      {isHistoryOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setIsHistoryOpen(false)}
          />
          <div className="fixed top-12 right-0 bottom-0 w-80 bg-background-secondary border-l border-border z-50 shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between p-3 border-b border-border">
              <span className="text-sm font-medium text-text-primary">操作历史</span>
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="p-1.5 rounded hover:bg-background-tertiary text-text-muted hover:text-text-primary transition-colors"
              >
                <X size={14} />
              </button>
            </div>
            <div className="h-[calc(100%-49px)]">
              <HistoryPanel />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Toolbar;
