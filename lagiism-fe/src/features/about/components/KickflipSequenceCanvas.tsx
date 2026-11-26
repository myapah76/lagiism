import React, { useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import { KICKFLIP_SEQUENCE } from '../data/aboutEditorialData';

export interface KickflipCanvasHandle {
  drawFrame: (frameIndex: number) => void;
}

interface KickflipSequenceCanvasProps {
  ref?: React.Ref<KickflipCanvasHandle>;
  initialFrame?: number;
  className?: string;
}

/**
 * Ref-driven HiDPI <canvas> frame player for the kickflip image sequence.
 * Updates frames directly via imperative drawFrame(index) so GSAP ScrollTrigger
 * triggers ZERO React re-renders during 60fps scroll scrubbing.
 */
export const KickflipSequenceCanvas: React.FC<KickflipSequenceCanvasProps> = ({
  ref,
  initialFrame = 0,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const lastDrawnRef = useRef<number>(-1);
  const targetFrameRef = useRef<number>(initialFrame);

  const renderIndex = useCallback((rawIndex: number, force = false) => {
    const clamped = Math.max(0, Math.min(KICKFLIP_SEQUENCE.length - 1, Math.round(rawIndex)));
    targetFrameRef.current = clamped;

    if (!force && clamped === lastDrawnRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const img = imagesRef.current[clamped];
    if (!canvas || !img || !img.complete || img.naturalWidth === 0) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    const targetW = Math.max(1, Math.round(rect.width * dpr));
    const targetH = Math.max(1, Math.round(rect.height * dpr));

    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Contain-fit inside canvas while preserving crisp aspect ratio
    const imgAspect = img.naturalWidth / img.naturalHeight;
    const canvasAspect = canvas.width / canvas.height;
    let drawW = canvas.width;
    let drawH = canvas.height;
    let offsetX = 0;
    let offsetY = 0;

    if (imgAspect > canvasAspect) {
      drawH = canvas.width / imgAspect;
      offsetY = (canvas.height - drawH) * 0.5;
    } else {
      drawW = canvas.height * imgAspect;
      offsetX = (canvas.width - drawW) * 0.5;
    }

    ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
    lastDrawnRef.current = clamped;
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      drawFrame: (frameIndex: number) => {
        renderIndex(frameIndex);
      },
    }),
    [renderIndex]
  );

  // Preload & decode all sequence frames once
  useEffect(() => {
    let active = true;
    const loaded: (HTMLImageElement | null)[] = new Array(KICKFLIP_SEQUENCE.length).fill(null);

    KICKFLIP_SEQUENCE.forEach((frame, idx) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        if (!active) return;
        loaded[idx] = img;
        imagesRef.current = loaded;
        if (idx === targetFrameRef.current) {
          renderIndex(idx, true);
        }
      };
      img.src = frame.src;
    });

    const handleResize = () => {
      renderIndex(targetFrameRef.current, true);
    };
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      active = false;
      window.removeEventListener('resize', handleResize);
    };
  }, [renderIndex]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label="Frame-by-frame illustrated kickflip sequence"
      className={className}
    />
  );
};
