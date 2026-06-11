import { useRef } from "react";
import { Check, ChevronDown, Clock, Coins, Send, Upload, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { AiImageModelConfigDTO } from "@/lib/api/types";
import { calcVideoCost } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import type { VideoShot } from "./types";
import type { VideoChannelOption, VideoModelOption } from "./video-options";

const CONTROL_TRIGGER_CLASS =
  "h-8 w-full min-w-0 rounded-md border border-white/[0.14] bg-[#202020] px-3 text-left text-xs font-normal text-[#d8d8d8] shadow-none outline-none transition-colors duration-200 hover:border-white/[0.22] focus-visible:border-[#00CAE0]/60 focus-visible:ring-0 focus-visible:ring-offset-0";

export function PromptPanel({
  mode = "video",
  selectedShot,
  selectedPrompt,
  referenceImages = [],
  uploadingReferences = false,
  imageModels = [],
  selectedImageModelId,
  selectedImageRatio,
  selectedImageCount,
  submitting = false,
  selectedModel,
  selectedChannel,
  modelOptions,
  selectedModelOption,
  selectedChannelOption,
  selectedDuration,
  selectedResolution,
  selectedRatio,
  selectedSound,
  onPromptChange,
  onReferenceUpload,
  onReferenceRemove,
  onGenerate,
  onImageModelChange,
  onImageRatioChange,
  onImageCountChange,
  onModelChange,
  onChannelChange,
  onDurationChange,
  onResolutionChange,
  onRatioChange,
  onSoundChange,
}: {
  mode?: "storyboard" | "video";
  selectedShot: VideoShot;
  selectedPrompt: string;
  referenceImages?: string[];
  uploadingReferences?: boolean;
  imageModels?: AiImageModelConfigDTO[];
  selectedImageModelId?: number;
  selectedImageRatio?: string;
  selectedImageCount?: string;
  submitting?: boolean;
  selectedModel: string;
  selectedChannel: string;
  modelOptions: VideoModelOption[];
  selectedModelOption: VideoModelOption;
  selectedChannelOption: VideoChannelOption;
  selectedDuration: string;
  selectedResolution: string;
  selectedRatio: string;
  selectedSound: string;
  onPromptChange: (value: string) => void;
  onReferenceUpload?: (files: FileList | File[]) => void;
  onReferenceRemove?: (url: string) => void;
  onGenerate?: () => void;
  onImageModelChange?: (value: number) => void;
  onImageRatioChange?: (value: string) => void;
  onImageCountChange?: (value: string) => void;
  onModelChange: (value: string) => void;
  onChannelChange: (value: string) => void;
  onDurationChange: (value: string) => void;
  onResolutionChange: (value: string) => void;
  onRatioChange: (value: string) => void;
  onSoundChange: (value: string) => void;
}) {
  const isStoryboardMode = mode === "storyboard";
  const selectedImageModel =
    imageModels.find((model) => model.id === selectedImageModelId) ??
    imageModels[0] ??
    null;
  const imageRatios = selectedImageModel?.supported_aspect_ratios?.length
    ? selectedImageModel.supported_aspect_ratios
    : ["16:9", "9:16", "1:1"];
  const imageCounts = ["1", "2", "4"];
  return (
    <section className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-white/[0.12] bg-[#181818]">
      <div className="flex h-11 shrink-0 items-center justify-between gap-3 border-b border-white/[0.12] px-4">
        <h3 className="text-sm font-medium text-white">
          镜头 {selectedShot.number}
        </h3>
        <div className="flex shrink-0 items-center gap-2">
          <Badge
            variant={selectedShot.hasVideo ? "success" : "muted"}
            className="shrink-0"
          >
            {isStoryboardMode
              ? selectedShot.posterUrl
                ? "已有分镜图"
                : "待生成"
              : selectedShot.hasVideo
                ? "已有视频"
                : "待生成"}
          </Badge>
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1" contentClassName="[&>div]:!h-full">
        <div className="flex h-full min-h-0 flex-col gap-4 p-4">
          {isStoryboardMode && (
            <ReferenceImageUploader
              images={referenceImages}
              uploading={uploadingReferences}
              onUpload={onReferenceUpload}
              onRemove={onReferenceRemove}
            />
          )}
          <textarea
            value={selectedPrompt}
            onChange={(event) => onPromptChange(event.target.value)}
            placeholder={
              isStoryboardMode
                ? "描述构图、角色位置、场景氛围、光线和画面细节"
                : "描述镜头运动、角色动作、画面氛围和视频节奏"
            }
            className="min-h-0 w-full flex-1 resize-none rounded-md border border-white/[0.14] bg-[#101010] px-3 py-3 text-sm leading-[1.7] text-[#d8d8d8] outline-none transition-colors duration-200 placeholder:text-white/25 focus:border-[#00CAE0]/60"
          />
        </div>
      </ScrollArea>

      <div className="flex shrink-0 items-center justify-between gap-3 border-t border-white/[0.12] px-4 py-3">
        <div className="grid min-w-0 flex-1 grid-cols-2 gap-2">
          {isStoryboardMode ? (
            <ImageModelPicker
              models={imageModels}
              selectedModel={selectedImageModel}
              onModelChange={onImageModelChange}
            />
          ) : (
            <ModelChannelPicker
              selectedModel={selectedModel}
              selectedChannel={selectedChannel}
              modelOptions={modelOptions}
              selectedModelOption={selectedModelOption}
              selectedChannelOption={selectedChannelOption}
              onModelChange={onModelChange}
              onChannelChange={onChannelChange}
            />
          )}
          <div className="min-w-0">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    CONTROL_TRIGGER_CLASS,
                    "flex items-center justify-between gap-2",
                  )}
                >
                  <span className="truncate">
                    {isStoryboardMode
                      ? ImageParameterSummary({
                          ratio: selectedImageRatio ?? imageRatios[0],
                          count: selectedImageCount ?? "1",
                        })
                      : ParameterSummary({
                          duration: selectedDuration,
                          resolution: selectedResolution,
                          ratio: selectedRatio,
                          sound: selectedSound,
                        })}
                  </span>
                  <ChevronDown className="size-4 shrink-0 text-[#8f8f8f]" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" side="top" className="w-72">
                {isStoryboardMode ? (
                  <div className="grid grid-cols-2 gap-2">
                    <SelectPill
                      label="比例"
                      value={selectedImageRatio ?? imageRatios[0]}
                      options={imageRatios}
                      onChange={(value) => onImageRatioChange?.(value)}
                    />
                    <SelectPill
                      label="张数"
                      value={selectedImageCount ?? "1"}
                      options={imageCounts}
                      onChange={(value) => onImageCountChange?.(value)}
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <SelectPill
                      label="时长"
                      value={selectedDuration}
                      options={selectedChannelOption.durations}
                      onChange={onDurationChange}
                      icon={Clock}
                    />
                    <SelectPill
                      label="分辨率"
                      value={selectedResolution}
                      options={selectedChannelOption.resolutions}
                      onChange={onResolutionChange}
                    />
                    <SelectPill
                      label="比例"
                      value={selectedRatio}
                      options={selectedChannelOption.supportedRatios}
                      onChange={onRatioChange}
                    />
                    <SelectPill
                      label="声音"
                      value={selectedSound}
                      options={selectedChannelOption.soundOptions}
                      onChange={onSoundChange}
                    />
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3 pb-1">
          <span className="flex items-center gap-2 text-xs text-[#a3a3a3]">
            <Coins size={14} strokeWidth={1.5} className="text-[#00CAE0]" />
            {isStoryboardMode
              ? `${selectedImageModel?.cost_per_image ?? "-"} 积分`
              : `${calcVideoCost(selectedDuration)} 积分`}
          </span>
          <Button size="lg" onClick={onGenerate} disabled={submitting}>
            <Send />
            {submitting ? "提交中..." : isStoryboardMode ? "生成分镜图" : "生成视频"}
          </Button>
        </div>
      </div>
    </section>
  );
}

function ImageModelPicker({
  models,
  selectedModel,
  onModelChange,
}: {
  models: AiImageModelConfigDTO[];
  selectedModel: AiImageModelConfigDTO | null;
  onModelChange?: (value: number) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            CONTROL_TRIGGER_CLASS,
            "flex items-center justify-between gap-2",
          )}
        >
          <span className="truncate">
            {selectedModel?.model_name ?? "选择图片模型"}
          </span>
          <ChevronDown className="size-4 shrink-0 text-[#8f8f8f]" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" side="top" className="w-72">
        <div className="flex flex-col gap-1">
          {models.length === 0 ? (
            <div className="px-2 py-3 text-xs text-[#8f8f8f]">
              暂无可用图片模型
            </div>
          ) : (
            models.map((model) => (
              <OptionButton
                key={model.id}
                active={model.id === selectedModel?.id}
                label={model.model_name}
                onClick={() => onModelChange?.(model.id)}
              />
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ReferenceImageUploader({
  images,
  uploading,
  onUpload,
  onRemove,
}: {
  images: string[];
  uploading: boolean;
  onUpload?: (files: FileList | File[]) => void;
  onRemove?: (url: string) => void;
}) {
  const hasImages = images.length > 0;
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="shrink-0">
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        multiple
        className="hidden"
        onChange={(event) => {
          const files = event.target.files;
          if (files?.length) onUpload?.(files);
          event.currentTarget.value = "";
        }}
      />
      {hasImages ? (
        <div className="grid grid-cols-3 gap-2">
          {images.map((url) => (
            <div
              key={url}
              className="group relative overflow-hidden rounded-md border border-white/[0.10] bg-[#101010]"
            >
              <div className="aspect-video">
                <img src={url} alt="" className="h-full w-full object-cover" />
              </div>
              <button
                type="button"
                onClick={() => onRemove?.(url)}
                className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-black/60 text-white/80 opacity-0 transition-opacity hover:text-white group-hover:opacity-100"
                aria-label="移除参考图"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex aspect-video items-center justify-center rounded-md border border-dashed border-white/[0.14] bg-[#101010] text-xs text-[#a3a3a3] transition-colors hover:border-white/[0.24] hover:text-white"
          >
            {uploading ? "上传中..." : "添加参考图"}
          </button>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            onUpload?.(event.dataTransfer.files);
          }}
          className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-white/[0.14] bg-[#101010] transition-colors hover:border-white/[0.24]"
        >
          <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-white/[0.08]">
            <Upload size={20} strokeWidth={1.5} className="text-[#a3a3a3]" />
          </div>
          <p className="mb-1 text-sm text-[#b8b8b8]">
            {uploading ? "正在上传图片..." : "点击或拖拽上传参考图"}
          </p>
          <p className="text-xs text-[#777]">支持 PNG、JPG、WebP</p>
        </div>
      )}
    </div>
  );
}

function ModelChannelPicker({
  selectedModel,
  selectedChannel,
  modelOptions,
  selectedModelOption,
  selectedChannelOption,
  onModelChange,
  onChannelChange,
}: {
  selectedModel: string;
  selectedChannel: string;
  modelOptions: VideoModelOption[];
  selectedModelOption: VideoModelOption;
  selectedChannelOption: VideoChannelOption;
  onModelChange: (value: string) => void;
  onChannelChange: (value: string) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            CONTROL_TRIGGER_CLASS,
            "flex items-center justify-between gap-2",
          )}
        >
          <span className="truncate">
            {selectedModelOption.label} · {selectedChannelOption.shortLabel}
          </span>
          <ChevronDown className="size-4 shrink-0 text-[#8f8f8f]" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" side="top" className="w-[28rem]">
        <div className="grid grid-cols-[10rem_minmax(0,1fr)] gap-3">
          <section className="min-w-0">
            <div className="mb-2 text-xs text-[#8f8f8f]">模型</div>
            <div className="flex flex-col gap-1">
              {modelOptions.map((model) => (
                <OptionButton
                  key={model.id}
                  active={model.id === selectedModel}
                  label={model.label}
                  onClick={() => {
                    onModelChange(model.id);
                    onChannelChange(model.channels[0]?.id ?? selectedChannel);
                  }}
                />
              ))}
            </div>
          </section>

          <section className="min-w-0">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-xs text-[#8f8f8f]">渠道</span>
              <span className="text-xs text-[#777]">
                {selectedModelOption.channels.length} 个
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              {selectedModelOption.channels.map((channel) => (
                <button
                  key={channel.id}
                  type="button"
                  onClick={() => onChannelChange(channel.id)}
                  className={cn(
                    "rounded-md border px-3 py-2 text-left transition-colors",
                    channel.id === selectedChannel
                      ? "border-[#00CAE0]/45 bg-[#00CAE0]/10"
                      : "border-white/[0.10] bg-[#181818] hover:border-white/[0.18]",
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="min-w-0 truncate text-xs font-medium text-[#e8e8e8]">
                      {channel.label}
                    </span>
                    {channel.id === selectedChannel && (
                      <Check className="size-3.5 shrink-0 text-[#00CAE0]" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function OptionButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-8 items-center justify-between gap-2 rounded-md px-2.5 text-left text-xs transition-colors",
        active
          ? "bg-white/[0.10] text-white"
          : "text-[#a3a3a3] hover:bg-white/[0.06] hover:text-white",
      )}
    >
      <span className="truncate">{label}</span>
      {active && <Check className="size-3.5 shrink-0 text-[#00CAE0]" />}
    </button>
  );
}

function SelectPill({
  label,
  value,
  options,
  onChange,
  icon: Icon,
  showLabel = true,
}: {
  label: string;
  value: string;
  options: Array<string | { value: string; label: string }>;
  onChange: (value: string) => void;
  icon?: React.ElementType;
  showLabel?: boolean;
}) {
  const normalizedOptions = options.map((option) =>
    typeof option === "string" ? { value: option, label: option } : option,
  );
  return (
    <label className="min-w-0">
      {showLabel && (
        <span className="mb-2 block text-xs text-[#8f8f8f]">{label}</span>
      )}
      <div className="relative min-w-0">
        {Icon && (
          <Icon
            size={14}
            strokeWidth={1.5}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8f8f8f]"
          />
        )}
        <Select
          value={value}
          onValueChange={(nextValue) => {
            if (nextValue) onChange(nextValue);
          }}
        >
          <SelectTrigger
            size="sm"
            className={cn(
              CONTROL_TRIGGER_CLASS,
              Icon && "pl-7",
              "[&>span]:truncate",
            )}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent
            align="start"
            side="top"
            className="border-white/[0.12] bg-[#202020] text-[#d8d8d8]"
          >
            <SelectGroup>
              {normalizedOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="text-xs focus:bg-white/[0.08] focus:text-white"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </label>
  );
}

function ParameterSummary({
  duration,
  resolution,
  ratio,
  sound,
}: {
  duration: string;
  resolution: string;
  ratio: string;
  sound: string;
}) {
  return `${duration} / ${resolution} / ${ratio} / ${sound}`;
}

function ImageParameterSummary({
  ratio,
  count,
}: {
  ratio: string;
  count: string;
}) {
  return `${ratio} / ${count} 张`;
}
