import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";

import { Toolbar } from "./Toolbar";
import { AssetsPanel } from "./AssetsPanel";
import { Preview } from "./Preview";
import { InspectorPanel } from "./InspectorPanel";
import { Timeline } from "./Timeline";
import { KeyframeEditorPanel } from "./KeyframeEditorPanel";
import { AudioMixer } from "../openreel-audio-mixer";
import { KeyboardShortcutsOverlay } from "./KeyboardShortcutsOverlay";
import { PanelErrorBoundary } from "./ErrorBoundary";
import { SpotlightTour, MoGraphTour } from "./tour";
import { useProjectStore } from "../openreel-stores/project-store";
import { useUIStore } from "../openreel-stores/ui-store";
import { useEngineStore } from "../openreel-stores/engine-store";
import { useKeyboardShortcuts } from "../openreel-hooks/useKeyboardShortcuts";
import { loadShotMediaItems } from "../openreel-services/shot-bridge";
import { saveEpisodeProject, loadEpisodeProject } from "../openreel-services/episode-project-store";
import { loadProjectMedia } from "../openreel-services/media-storage";
import { restoreMediaItem } from "../openreel-utils/media-recovery";
import {
  initializePlaybackBridge,
  disposePlaybackBridge,
} from "../openreel-bridges/playback-bridge";
import {
  initializeMediaBridge,
  disposeMediaBridge,
} from "../openreel-bridges/media-bridge";
import {
  initializeRenderBridge,
  disposeRenderBridge,
} from "../openreel-bridges/render-bridge";
import {
  initializeEffectsBridge,
  disposeEffectsBridge,
} from "../openreel-bridges/effects-bridge";
import {
  initializeTransitionBridge,
  disposeTransitionBridge,
} from "../openreel-bridges/transition-bridge";

const DEFAULT_TIMELINE_HEIGHT = 320;
const MIN_TIMELINE_HEIGHT = 220;
const MIN_TOP_WORKSPACE_HEIGHT = 280;
const DEFAULT_ASSETS_WIDTH = 320;
const MIN_ASSETS_WIDTH = 240;
const MAX_ASSETS_WIDTH = 520;
const DEFAULT_INSPECTOR_WIDTH = 320;
const MIN_INSPECTOR_WIDTH = 260;
const MAX_INSPECTOR_WIDTH = 520;
const MIN_PREVIEW_WIDTH = 420;
const SIDE_RESIZE_HANDLE_WIDTH = 6;
const HORIZONTAL_RESIZE_HANDLE_HEIGHT = 4;

type ResizeTarget = "timeline" | "assets" | "inspector";

const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Auto-save initialization hook
 */
const useAutoSave = () => {
  const { initializeAutoSave } = useProjectStore();

  useEffect(() => {
    initializeAutoSave().catch(console.error);
  }, [initializeAutoSave]);
};

/**
 * Shot material loader hook
 * Fetches episode shot data and injects shot video versions as media items
 */
const useEpisodeProject = (episodeId: string) => {
  const loadProject = useProjectStore((s) => s.loadProject);
  const createNewProject = useProjectStore((s) => s.createNewProject);
  const [projectReady, setProjectReady] = useState(false);
  const prevEpisodeRef = useRef<string | null>(null);
  const episodeRef = useRef(episodeId);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep episodeRef in sync
  useEffect(() => {
    episodeRef.current = episodeId;
  }, [episodeId]);

  // Switch episode: save old, load/create new
  useEffect(() => {
    const prevEp = prevEpisodeRef.current;

    if (prevEp && prevEp !== episodeId) {
      // Flush any pending debounced save before switching
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
      const state = useProjectStore.getState();
      const titleEngine = useEngineStore.getState().getTitleEngine();
      const graphicsEngine = useEngineStore.getState().getGraphicsEngine();
      saveEpisodeProject(prevEp, {
        ...state.project,
        textClips: titleEngine?.getAllTextClips() || [],
        shapeClips: graphicsEngine?.getAllShapeClips() || [],
        svgClips: graphicsEngine?.getAllSVGClips() || [],
        stickerClips: graphicsEngine?.getAllStickerClips() || [],
      });
    }

    prevEpisodeRef.current = episodeId;
    setProjectReady(false);

    createNewProject(`分集 ${episodeId}`);

    let cancelled = false;
    loadEpisodeProject(episodeId).then(async (saved) => {
      if (cancelled) return;
      let project = saved;
      if (project) {
        try {
          const storedMedia = await loadProjectMedia(project.id);
          const blobMap = new Map(storedMedia.map((m) => [m.id, m.blob]));
          const restoredItems = await Promise.all(
            project.mediaLibrary.items.map((item) =>
              restoreMediaItem(item, blobMap.get(item.id)),
            ),
          );
          project = {
            ...project,
            mediaLibrary: { ...project.mediaLibrary, items: restoredItems },
          };
        } catch (err) {
          console.warn("[EpisodeProject] Failed to restore media blobs:", err);
        }
        loadProject(project);
      }
      setProjectReady(true);
    });

    return () => { cancelled = true; };
  }, [episodeId]);

  // Persist project to episode store on every change (debounced 2s)
  useEffect(() => {
    if (!projectReady) return;

    const unsub = useProjectStore.subscribe(
      (s) => s.project,
      () => {
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => {
          const ep = episodeRef.current;
          if (!ep) return;
          const state = useProjectStore.getState();
          const titleEngine = useEngineStore.getState().getTitleEngine();
          const graphicsEngine = useEngineStore.getState().getGraphicsEngine();
          saveEpisodeProject(ep, {
            ...state.project,
            textClips: titleEngine?.getAllTextClips() || [],
            shapeClips: graphicsEngine?.getAllShapeClips() || [],
            svgClips: graphicsEngine?.getAllSVGClips() || [],
            stickerClips: graphicsEngine?.getAllStickerClips() || [],
          });
        }, 2000);
      },
    );

    return () => {
      unsub();
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [projectReady]);

  // Immediate save on page hide (refresh / close / navigate away)
  useEffect(() => {
    if (!projectReady) return;

    const handleHide = () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
      const ep = episodeRef.current;
      if (!ep) return;
      const state = useProjectStore.getState();
      const titleEngine = useEngineStore.getState().getTitleEngine();
      const graphicsEngine = useEngineStore.getState().getGraphicsEngine();
      saveEpisodeProject(ep, {
        ...state.project,
        textClips: titleEngine?.getAllTextClips() || [],
        shapeClips: graphicsEngine?.getAllShapeClips() || [],
        svgClips: graphicsEngine?.getAllSVGClips() || [],
        stickerClips: graphicsEngine?.getAllStickerClips() || [],
      });
    };

    document.addEventListener("visibilitychange", handleHide);
    return () => document.removeEventListener("visibilitychange", handleHide);
  }, [projectReady]);

  return projectReady;
};

const useShotMaterialLoader = (episodeId: string, projectReady: boolean) => {
  const addPlaceholderMedia = useProjectStore((s) => s.addPlaceholderMedia);
  const mediaItems = useProjectStore((s) => s.project.mediaLibrary.items);
  const [loaded, setLoaded] = useState(false);

  // Reset loaded state when episode changes
  useEffect(() => {
    setLoaded(false);
  }, [episodeId]);

  useEffect(() => {
    if (!projectReady || !episodeId || loaded) return;

    let cancelled = false;
    console.log("[ShotBridge] Loading shot materials for episode:", episodeId);
    loadShotMediaItems(episodeId).then(({ allItems, groups }) => {
      if (cancelled) return;
      console.log("[ShotBridge] Loaded groups:", groups.length, "items:", allItems.length);
      const existingIds = new Set(mediaItems.map((i) => i.id));
      for (const item of allItems) {
        if (!existingIds.has(item.id)) {
          console.log("[ShotBridge] Adding item:", item.id, item.name);
          addPlaceholderMedia(item);
        }
      }
      setLoaded(true);
    }).catch((err) => {
      console.error("[ShotBridge] Failed to load shot materials:", err);
    });

    return () => { cancelled = true; };
  }, [projectReady, episodeId, loaded]);
};

/**
 * Engine and bridge initialization hook
 * Ensures all engines and bridges are fully initialized before rendering editor
 */
const useEngineInitialization = () => {
  const { initialize, initialized, initializing, initError } = useEngineStore();
  const [bridgesReady, setBridgesReady] = useState(false);
  const [initStatus, setInitStatus] = useState("Starting...");
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initAll = async () => {
      try {
        const currentState = useEngineStore.getState();
        if (!currentState.initialized && !currentState.initializing) {
          setInitStatus("Initializing video engine...");
          await initialize();
        } else if (currentState.initializing) {
          await new Promise<void>((resolve) => {
            const unsubscribe = useEngineStore.subscribe((state) => {
              if (state.initialized || state.initError) {
                unsubscribe();
                resolve();
              }
            });
          });
        }

        if (!isMounted) return;

        const engineState = useEngineStore.getState();
        if (!engineState.initialized) {
          throw new Error(
            engineState.initError || "Engine initialization failed",
          );
        }

        setInitStatus("Initializing media bridge...");
        await initializeMediaBridge();
        if (!isMounted) return;

        setInitStatus("Initializing playback bridge...");
        await initializePlaybackBridge();
        if (!isMounted) return;

        setInitStatus("Initializing render bridge...");
        await initializeRenderBridge();
        if (!isMounted) return;

        setInitStatus("Initializing effects bridge...");
        const projectState = useProjectStore.getState();
        const { width, height } = projectState.project.settings;
        try {
          await initializeEffectsBridge(width, height);
        } catch (effectsError) {
          console.error(
            "[EditorInterface] EffectsBridge initialization failed:",
            effectsError,
          );
        }
        if (!isMounted) return;

        setInitStatus("Initializing transition bridge...");
        try {
          initializeTransitionBridge(width, height);
        } catch (transitionError) {
          console.error(
            "[EditorInterface] TransitionBridge initialization failed:",
            transitionError,
          );
        }
        if (!isMounted) return;

        setBridgesReady(true);
      } catch (error) {
        console.error("Failed to initialize engines/bridges:", error);
        if (isMounted) {
          setLocalError(
            error instanceof Error ? error.message : "Unknown error",
          );
          setInitStatus(
            `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
          );
        }
      }
    };

    initAll();

    return () => {
      isMounted = false;
      disposePlaybackBridge();
      disposeMediaBridge();
      disposeRenderBridge();
      disposeEffectsBridge();
      disposeTransitionBridge();
    };
  }, [initialize, initialized, initializing]);

  return {
    initialized: initialized && bridgesReady,
    initializing: initializing || (!bridgesReady && initialized),
    initError: initError || localError,
    initStatus,
  };
};

/**
 * Main Editor Interface Component
 */
export const EditorInterface: React.FC = () => {
  const { initialized, initializing, initError, initStatus } =
    useEngineInitialization();

  const { showShortcutsOverlay, setShowShortcutsOverlay } =
    useKeyboardShortcuts();
  useAutoSave();

  const params = useParams<{ ep: string }>();
  const projectReady = useEpisodeProject(params.ep);

  useShotMaterialLoader(params.ep, projectReady && initialized);

  const {
    keyframeEditorOpen,
    setKeyframeEditorOpen,
    getSelectedClipIds,
    panels,
    setPanelVisible,
  } = useUIStore();
  const { project, updateClipKeyframes } = useProjectStore();
  const tracks = project.timeline.tracks;

  const [selectedKeyframeIds, setSelectedKeyframeIds] = React.useState<string[]>([]);
  const [copiedKeyframes, setCopiedKeyframes] = React.useState<import("@openreel/core").Keyframe[]>([]);

  const selectedClip = React.useMemo(() => {
    const selectedIds = getSelectedClipIds();
    if (selectedIds.length === 0) return null;
    const clipId = selectedIds[0];
    for (const track of tracks) {
      const clip = track.clips.find((c) => c.id === clipId);
      if (clip) return clip;
    }
    return null;
  }, [getSelectedClipIds, tracks]);

  const handleUpdateKeyframe = React.useCallback(
    (keyframeId: string, updates: Partial<import("@openreel/core").Keyframe>) => {
      if (!selectedClip?.keyframes) return;
      const keyframes = selectedClip.keyframes.map((kf) =>
        kf.id === keyframeId ? { ...kf, ...updates } : kf
      );
      updateClipKeyframes(selectedClip.id, keyframes);
    },
    [selectedClip, updateClipKeyframes]
  );

  const handleDeleteKeyframe = React.useCallback(
    (keyframeId: string) => {
      if (!selectedClip?.keyframes) return;
      const keyframes = selectedClip.keyframes.filter((kf) => kf.id !== keyframeId);
      updateClipKeyframes(selectedClip.id, keyframes);
      setSelectedKeyframeIds((prev) => prev.filter((id) => id !== keyframeId));
    },
    [selectedClip, updateClipKeyframes]
  );

  const handleCopyKeyframes = React.useCallback(
    (keyframeIds: string[]) => {
      if (!selectedClip?.keyframes) return;
      const toCopy = selectedClip.keyframes.filter((kf) => keyframeIds.includes(kf.id));
      setCopiedKeyframes(toCopy);
    },
    [selectedClip]
  );

  const handlePasteKeyframes = React.useCallback(
    (clipId: string, time: number) => {
      const targetClip = tracks.flatMap((t) => t.clips).find((c) => c.id === clipId);
      if (!targetClip) return;
      const newKeyframes = copiedKeyframes.map((kf) => ({
        ...kf,
        id: `kf-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        time: kf.time + time,
      }));
      updateClipKeyframes(clipId, [...(targetClip.keyframes || []), ...newKeyframes]);
    },
    [copiedKeyframes, tracks, updateClipKeyframes]
  );

  const handleSelectKeyframe = React.useCallback(
    (keyframeId: string, addToSelection: boolean) => {
      if (addToSelection) {
        setSelectedKeyframeIds((prev) =>
          prev.includes(keyframeId)
            ? prev.filter((id) => id !== keyframeId)
            : [...prev, keyframeId]
        );
      } else {
        setSelectedKeyframeIds([keyframeId]);
      }
    },
    []
  );

  const editorBodyRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const audioMixerRef = useRef<HTMLDivElement>(null);
  const keyframePanelRef = useRef<HTMLDivElement>(null);
  const resizeStateRef = useRef<ResizeTarget | null>(null);

  const [timelineHeight, setTimelineHeight] = useState(DEFAULT_TIMELINE_HEIGHT);
  const [assetsWidth, setAssetsWidth] = useState(DEFAULT_ASSETS_WIDTH);
  const [inspectorWidth, setInspectorWidth] = useState(DEFAULT_INSPECTOR_WIDTH);

  const timelineHeightRef = useRef(DEFAULT_TIMELINE_HEIGHT);
  const assetsWidthRef = useRef(DEFAULT_ASSETS_WIDTH);
  const inspectorWidthRef = useRef(DEFAULT_INSPECTOR_WIDTH);

  useEffect(() => {
    timelineHeightRef.current = timelineHeight;
  }, [timelineHeight]);

  useEffect(() => {
    assetsWidthRef.current = assetsWidth;
  }, [assetsWidth]);

  useEffect(() => {
    inspectorWidthRef.current = inspectorWidth;
  }, [inspectorWidth]);

  const beginResize = useCallback(
    (target: ResizeTarget) => (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      resizeStateRef.current = target;
      document.body.style.cursor =
        target === "timeline" ? "row-resize" : "col-resize";
      document.body.style.userSelect = "none";
    },
    [],
  );

  const clampLayout = useCallback(() => {
    const workspaceRect = workspaceRef.current?.getBoundingClientRect();
    if (workspaceRect) {
      const keyframeWidth =
        keyframePanelRef.current?.getBoundingClientRect().width ?? 0;
      const maxResizableWidth =
        workspaceRect.width -
        keyframeWidth -
        MIN_PREVIEW_WIDTH -
        SIDE_RESIZE_HANDLE_WIDTH * 2;

      const nextAssetsWidth = clamp(
        assetsWidthRef.current,
        MIN_ASSETS_WIDTH,
        Math.max(
          MIN_ASSETS_WIDTH,
          Math.min(
            MAX_ASSETS_WIDTH,
            maxResizableWidth - inspectorWidthRef.current,
          ),
        ),
      );

      const nextInspectorWidth = clamp(
        inspectorWidthRef.current,
        MIN_INSPECTOR_WIDTH,
        Math.max(
          MIN_INSPECTOR_WIDTH,
          Math.min(
            MAX_INSPECTOR_WIDTH,
            maxResizableWidth - nextAssetsWidth,
          ),
        ),
      );

      if (nextAssetsWidth !== assetsWidthRef.current) {
        setAssetsWidth(nextAssetsWidth);
      }

      if (nextInspectorWidth !== inspectorWidthRef.current) {
        setInspectorWidth(nextInspectorWidth);
      }
    }

    const bodyRect = editorBodyRef.current?.getBoundingClientRect();
    if (bodyRect) {
      const audioMixerHeight =
        audioMixerRef.current?.getBoundingClientRect().height ?? 0;
      const maxTimelineHeight = Math.max(
        MIN_TIMELINE_HEIGHT,
        bodyRect.height -
          audioMixerHeight -
          MIN_TOP_WORKSPACE_HEIGHT -
          HORIZONTAL_RESIZE_HANDLE_HEIGHT,
      );
      const nextTimelineHeight = clamp(
        timelineHeightRef.current,
        MIN_TIMELINE_HEIGHT,
        maxTimelineHeight,
      );

      if (nextTimelineHeight !== timelineHeightRef.current) {
        setTimelineHeight(nextTimelineHeight);
      }
    }
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const resizeTarget = resizeStateRef.current;
      if (!resizeTarget) return;

      if (resizeTarget === "timeline") {
        const bodyRect = editorBodyRef.current?.getBoundingClientRect();
        if (!bodyRect) return;

        const audioMixerHeight =
          audioMixerRef.current?.getBoundingClientRect().height ?? 0;
        const maxTimelineHeight = Math.max(
          MIN_TIMELINE_HEIGHT,
          bodyRect.height -
            audioMixerHeight -
            MIN_TOP_WORKSPACE_HEIGHT -
            HORIZONTAL_RESIZE_HANDLE_HEIGHT,
        );
        const desiredTimelineHeight =
          bodyRect.bottom - e.clientY - audioMixerHeight;

        setTimelineHeight(
          clamp(
            desiredTimelineHeight,
            MIN_TIMELINE_HEIGHT,
            maxTimelineHeight,
          ),
        );
        return;
      }

      const workspaceRect = workspaceRef.current?.getBoundingClientRect();
      if (!workspaceRect) return;

      const keyframeWidth =
        keyframePanelRef.current?.getBoundingClientRect().width ?? 0;
      const maxResizableWidth =
        workspaceRect.width -
        keyframeWidth -
        MIN_PREVIEW_WIDTH -
        SIDE_RESIZE_HANDLE_WIDTH * 2;

      if (resizeTarget === "assets") {
        const maxAssetsWidth = Math.max(
          MIN_ASSETS_WIDTH,
          Math.min(
            MAX_ASSETS_WIDTH,
            maxResizableWidth - inspectorWidthRef.current,
          ),
        );
        const desiredAssetsWidth = e.clientX - workspaceRect.left;
        setAssetsWidth(
          clamp(desiredAssetsWidth, MIN_ASSETS_WIDTH, maxAssetsWidth),
        );
        return;
      }

      const maxInspectorWidth = Math.max(
        MIN_INSPECTOR_WIDTH,
        Math.min(
          MAX_INSPECTOR_WIDTH,
          maxResizableWidth - assetsWidthRef.current,
        ),
      );
      const desiredInspectorWidth = workspaceRect.right - e.clientX;
      setInspectorWidth(
        clamp(desiredInspectorWidth, MIN_INSPECTOR_WIDTH, maxInspectorWidth),
      );
    };

    const handleMouseUp = () => {
      resizeStateRef.current = null;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  useEffect(() => {
    clampLayout();

    const handleResize = () => {
      clampLayout();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [clampLayout, keyframeEditorOpen, panels.audioMixer?.visible]);

  if (initializing || !initialized) {
    return (
      <div className="w-full h-full bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary text-sm">Initializing editor...</p>
          <p className="text-text-muted text-xs mt-2">{initStatus}</p>
          {initError && (
            <p className="text-red-500 text-xs mt-2">{initError}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-background flex flex-col overflow-hidden font-sans select-none relative z-20 text-xs text-text-secondary">
      {/* Main App Toolbar */}
      <Toolbar />

      <div ref={editorBodyRef} className="min-h-0 flex-1 flex flex-col overflow-hidden">
        <div ref={workspaceRef} className="min-h-0 flex-1 flex overflow-hidden">
          <div
            className="h-full shrink-0 min-w-0 overflow-hidden"
            style={{ width: assetsWidth }}
          >
            <PanelErrorBoundary name="Assets Panel">
              <AssetsPanel />
            </PanelErrorBoundary>
          </div>

          <div
            className="relative h-full shrink-0 cursor-col-resize bg-border/80 transition-colors hover:bg-primary/50"
            style={{ width: SIDE_RESIZE_HANDLE_WIDTH }}
            onMouseDown={beginResize("assets")}
          >
            <div className="absolute inset-y-0 -left-1 -right-1" />
          </div>

          <div className="min-h-0 min-w-0 flex-1 flex overflow-hidden">
            <PanelErrorBoundary name="Preview">
              <Preview />
            </PanelErrorBoundary>
          </div>

          <div
            className="relative h-full shrink-0 cursor-col-resize bg-border/80 transition-colors hover:bg-primary/50"
            style={{ width: SIDE_RESIZE_HANDLE_WIDTH }}
            onMouseDown={beginResize("inspector")}
          >
            <div className="absolute inset-y-0 -left-1 -right-1" />
          </div>

          <div
            className="h-full shrink-0 min-w-0 overflow-hidden"
            style={{ width: inspectorWidth }}
          >
            <PanelErrorBoundary name="Inspector">
              <InspectorPanel />
            </PanelErrorBoundary>
          </div>

          {keyframeEditorOpen && (
            <div
              ref={keyframePanelRef}
              className="h-full shrink-0 min-w-0 overflow-hidden"
            >
              <PanelErrorBoundary name="Keyframe Editor">
                <KeyframeEditorPanel
                  clip={selectedClip}
                  onClose={() => setKeyframeEditorOpen(false)}
                  onUpdateKeyframe={handleUpdateKeyframe}
                  onDeleteKeyframe={handleDeleteKeyframe}
                  onCopyKeyframes={handleCopyKeyframes}
                  onPasteKeyframes={handlePasteKeyframes}
                  selectedKeyframeIds={selectedKeyframeIds}
                  onSelectKeyframe={handleSelectKeyframe}
                  copiedKeyframes={copiedKeyframes}
                />
              </PanelErrorBoundary>
            </div>
          )}
        </div>

        <div
          className="shrink-0 bg-border transition-colors hover:bg-primary/50 cursor-row-resize z-10 relative"
          style={{ height: HORIZONTAL_RESIZE_HANDLE_HEIGHT }}
          onMouseDown={beginResize("timeline")}
        >
          <div className="absolute inset-x-0 -top-1 -bottom-1 bg-transparent" />
        </div>

        {panels.audioMixer?.visible && (
          <div ref={audioMixerRef} className="shrink-0">
            <PanelErrorBoundary name="Audio Mixer">
              <AudioMixer
                visible
                onClose={() => setPanelVisible("audioMixer", false)}
              />
            </PanelErrorBoundary>
          </div>
        )}

        <div
          style={{ height: timelineHeight }}
          className="min-h-0 shrink-0 flex flex-col overflow-hidden"
        >
          <PanelErrorBoundary name="Timeline">
            <Timeline />
          </PanelErrorBoundary>
        </div>
      </div>

      <KeyboardShortcutsOverlay
        isOpen={showShortcutsOverlay}
        onClose={() => setShowShortcutsOverlay(false)}
      />

      <SpotlightTour />
      <MoGraphTour />
    </div>
  );
};

export default EditorInterface;
