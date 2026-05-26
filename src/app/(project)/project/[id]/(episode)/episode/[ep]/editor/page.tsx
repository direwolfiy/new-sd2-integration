"use client";

import dynamic from "next/dynamic";
import { TooltipProvider } from "@openreel/ui";
import "@/openreel-editor/editor-theme.css";

function LoadingEditor() {
  return (
    <div className="openreel-theme-dark h-full flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-text-muted">Loading editor...</p>
      </div>
    </div>
  );
}

const EditorInterface = dynamic(
  () =>
    import("@/openreel-editor/EditorInterface").then((m) => ({
      default: m.EditorInterface,
    })),
  {
    ssr: false,
    loading: () => <LoadingEditor />,
  },
);

export default function EditorPage() {
  return (
    <TooltipProvider>
      <div className="openreel-theme-dark h-full w-full bg-background text-text-primary overflow-hidden">
        <EditorInterface />
      </div>
    </TooltipProvider>
  );
}
