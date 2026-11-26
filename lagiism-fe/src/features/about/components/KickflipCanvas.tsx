import React, { useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import { KICKFLIP_FRAMES } from '../data/aboutStory';

export interface KickflipCanvasHandle {
  drawFrame: (frameIndex: number) => void;
}

interface KickflipCanvasProps {
  ref?: React.Ref<KickflipCanvasHandle>;
  initialFrame?: number;
  className?: string;
}

/**
 * Ref-driven HiDPI <canvas> frame player for the kickflip image sequence.
 * Draws frames imperatively from the master GSAP timeline with zero React re-renders.
 */
export const KickflipCanvas: React.FC<KickflipCanvasProps> = ({
  ref,
  initialFrame = 0,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const lastDrawnRef = useRef(-1);
  const currentIdxRef = useRef(initialFrame);

  const renderFrame = useCallback((rawIdx: number, force = false) => {
    const idx = Math.max(0, Math.min(KICKFLIP_FRAMES.length - 1, Math.round(rawIdx)));
    currentIdxRef.current = idx;
    if (!force && idx === lastDrawnRef.current) return;

    const canvas = canvasRef.current;
    const img = imagesRef.current[idx];
    if (!canvas || !img || !img.complete || img.naturalWidth === 0) return;

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

    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = canvas.width / canvas.height;
    let drawW = canvas.width;
    let drawH = canvas.height;
    let dx = 0;
    let dy = 0;

    if (imgRatio > canvasRatio) {
      drawH = canvas.width / imgRatio;
      dy = (canvas.height - drawH) * 0.5;
    } else {
      drawW = canvas.height * imgRatio;
      dx = (canvas.width - drawW) * 0.5;
    }

    ctx.drawImage(img, dx, dy, drawW, drawH);
    lastDrawnRef.current = idx;
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      drawFrame: (frameIndex: number) => renderFrame(frameIndex),
    }),
    [renderFrame]
  );

  useEffect(() => {
    let mounted = true;
    const imgs: (HTMLImageElement | null)[] = new Array(KICKFLIP_FRAMES.length).fill(null);

    KICKFLIP_FRAMES.forEach((src, i) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        if (!mounted) return;
        imgs[i] = img;
        imagesRef.current = imgs;
        if (i === currentIdxRef.current) {
          renderFrame(i, true);
        }
      };
      img.src = src;
    });

    const onResize = () => renderFrame(currentIdxRef.current, true);
    window.addEventListener('resize', onResize, { passive: true });
    return () => {
      mounted = false;
      window.removeEventListener('resize', onResize);
    };
  }, [renderFrame]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label="Illustrated skateboard kickflip sequence"
      className={className}
    />
  );
};
