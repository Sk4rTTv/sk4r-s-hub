import { useEffect, useState, type RefObject } from "react";

export function useProjectionFps(player: RefObject<HTMLVideoElement>, active: boolean) {
  const [fps, setFps] = useState<number | null>(null);
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    const video = player.current;
    setFps(null);
    if (!video || !active) return;
    const frameCallbacks = typeof video.requestVideoFrameCallback === "function";
    const qualityCounter = typeof video.getVideoPlaybackQuality === "function";
    setAvailable(frameCallbacks || qualityCounter);
    if (!frameCallbacks && !qualityCounter) return;
    let frameId = 0;
    let frames = 0;
    let lastPresented: number | null = null;
    const countFrame: VideoFrameRequestCallback = (_now, metadata) => {
      frames += lastPresented === null ? 1 : Math.max(0, metadata.presentedFrames - lastPresented);
      lastPresented = metadata.presentedFrames;
      frameId = video.requestVideoFrameCallback(countFrame);
    };
    const displayedFrames = () => {
      const quality = video.getVideoPlaybackQuality();
      return quality.totalVideoFrames - quality.droppedVideoFrames;
    };
    let lastQuality = !frameCallbacks ? displayedFrames() : 0;
    let previousTime = performance.now();
    if (frameCallbacks) frameId = video.requestVideoFrameCallback(countFrame);
    const timer = window.setInterval(() => {
      const now = performance.now();
      let count = frames;
      if (!frameCallbacks) {
        const current = displayedFrames();
        count = Math.max(0, current - lastQuality);
        lastQuality = current;
      }
      setFps(document.hidden ? null : Math.round(count * 1000 / (now - previousTime)));
      frames = 0;
      previousTime = now;
    }, 1000);
    return () => {
      window.clearInterval(timer);
      if (frameCallbacks) video.cancelVideoFrameCallback(frameId);
    };
  }, [active, player]);

  return { fps: active ? fps : null, available };
}
