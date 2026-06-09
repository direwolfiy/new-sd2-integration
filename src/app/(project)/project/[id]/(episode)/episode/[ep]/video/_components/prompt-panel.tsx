import { Clock, Coins, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { calcVideoCost } from "@/lib/pricing";
import type { VideoShot } from "./types";

export function PromptPanel({
  selectedShot,
  selectedPrompt,
  selectedModel,
  selectedDuration,
  selectedResolution,
  selectedRatio,
  selectedSound,
  onPromptChange,
  onModelChange,
  onDurationChange,
  onResolutionChange,
  onRatioChange,
  onSoundChange,
}: {
  selectedShot: VideoShot;
  selectedPrompt: string;
  selectedModel: string;
  selectedDuration: string;
  selectedResolution: string;
  selectedRatio: string;
  selectedSound: string;
  onPromptChange: (value: string) => void;
  onModelChange: (value: string) => void;
  onDurationChange: (value: string) => void;
  onResolutionChange: (value: string) => void;
  onRatioChange: (value: string) => void;
  onSoundChange: (value: string) => void;
}) {
  return (
    <section className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-white/[0.12] bg-[#181818]">
      <div className="flex h-11 shrink-0 items-center justify-between gap-3 border-b border-white/[0.12] px-4">
        <h3 className="text-sm font-medium text-white">
          镜头 {selectedShot.number}
        </h3>
        <Badge
          variant={selectedShot.hasVideo ? "success" : "muted"}
          className="shrink-0"
        >
          {selectedShot.hasVideo ? "已有视频" : "待生成"}
        </Badge>
      </div>

      <ScrollArea className="min-h-0 flex-1" contentClassName="[&>div]:!h-full">
        <div className="flex h-full min-h-0 flex-col p-4">
          <textarea
            value={selectedPrompt}
            onChange={(event) => onPromptChange(event.target.value)}
            placeholder="描述镜头运动、角色动作、画面氛围和视频节奏"
            className="min-h-0 w-full flex-1 resize-none rounded-md border border-white/[0.14] bg-[#101010] px-3 py-3 text-sm leading-[1.7] text-[#d8d8d8] outline-none transition-colors duration-200 placeholder:text-white/25 focus:border-[#00CAE0]/60"
          />
        </div>
      </ScrollArea>

      <div className="flex shrink-0 items-center justify-between gap-3 border-t border-white/[0.12] px-4 py-3">
        <div className="grid min-w-0 flex-1 grid-cols-2 gap-2">
          <SelectPill
            label="模型"
            value={selectedModel}
            options={["Seedance 2.0"]}
            onChange={onModelChange}
            showLabel={false}
          />
          <div className="min-w-0">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="h-8 w-full truncate rounded-md border border-white/[0.14] bg-[#202020] px-3 text-left text-xs text-[#d8d8d8] outline-none transition-colors duration-200 hover:border-white/[0.22] focus-visible:border-[#00CAE0]/60"
                >
                  {ParameterSummary({
                    duration: selectedDuration,
                    resolution: selectedResolution,
                    ratio: selectedRatio,
                    sound: selectedSound,
                  })}
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" side="top" className="w-72">
                <div className="grid grid-cols-2 gap-2">
                  <SelectPill
                    label="时长"
                    value={selectedDuration}
                    options={["5s", "10s"]}
                    onChange={onDurationChange}
                    icon={Clock}
                  />
                  <SelectPill
                    label="分辨率"
                    value={selectedResolution}
                    options={["720p", "1080p"]}
                    onChange={onResolutionChange}
                  />
                  <SelectPill
                    label="比例"
                    value={selectedRatio}
                    options={["16:9", "9:16"]}
                    onChange={onRatioChange}
                  />
                  <SelectPill
                    label="声音"
                    value={selectedSound}
                    options={["有声", "无声"]}
                    onChange={onSoundChange}
                  />
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3 pb-1">
          <span className="flex items-center gap-2 text-xs text-[#a3a3a3]">
            <Coins size={14} strokeWidth={1.5} className="text-[#00CAE0]" />
            {calcVideoCost(selectedDuration)} 积分
          </span>
          <Button size="lg">
            <Send />
            生成视频
          </Button>
        </div>
      </div>
    </section>
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
  options: string[];
  onChange: (value: string) => void;
  icon?: React.ElementType;
  showLabel?: boolean;
}) {
  return (
    <label className="min-w-0">
      {showLabel && (
        <span className="mb-2 block text-xs text-[#8f8f8f]">{label}</span>
      )}
      <div className="relative">
        {Icon && (
          <Icon
            size={14}
            strokeWidth={1.5}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8f8f8f]"
          />
        )}
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`h-8 w-full appearance-none rounded-md border border-white/[0.14] bg-[#202020] pr-7 text-xs text-[#d8d8d8] outline-none transition-colors duration-200 hover:border-white/[0.22] focus:border-[#00CAE0]/60 ${
            Icon ? "pl-7" : "pl-3"
          }`}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
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
