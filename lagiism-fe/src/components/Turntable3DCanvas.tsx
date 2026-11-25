import React, { useEffect, useRef, useState } from 'react';
import { RotateCw } from 'lucide-react';
import { Product, SetInclusionMode } from '../types/store';
import { normalizeAzimuth } from '../utils/storeLogic';

interface Turntable3DCanvasProps {
  topProduct?: Product;
  bottomProduct?: Product;
  inclusionMode: SetInclusionMode | 'NONE';
}

interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export const Turntable3DCanvas: React.FC<Turntable3DCanvasProps> = ({
  topProduct,
  bottomProduct,
  inclusionMode,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [azimuth, setAzimuth] = useState(28);
  const [autoSpin, setAutoSpin] = useState(false);
  const dragRef = useRef<{ active: boolean; lastX: number }>({
    active: false,
    lastX: 0,
  });

  useEffect(() => {
    if (!autoSpin) return;
    const id = window.setInterval(() => {
      setAzimuth((prev) => (prev + 2) % 360);
    }, 32);
    return () => window.clearInterval(id);
  }, [autoSpin]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = canvas.clientWidth || 560;
    const height = canvas.clientHeight || 520;
    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    // Clinical #F4F4F4 Studio Ground
    ctx.fillStyle = '#F4F4F4';
    ctx.fillRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2 - 4;
    const rad = (azimuth * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    // Subtle 1px Architectural Turntable Floor Grid
    ctx.strokeStyle = '#DCDCDC';
    ctx.lineWidth = 1;
    for (let i = -4; i <= 4; i++) {
      const x = cx + i * 48;
      ctx.beginPath();
      ctx.moveTo(x, height - 104);
      ctx.lineTo(cx + i * 76, height - 24);
      ctx.stroke();
    }

    // Turntable calibration ring
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(cx, height - 56, 132, 22, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Rotating tick on calibration ring
    const tickX = cx + Math.sin(rad) * 132;
    const tickY = height - 56 + Math.cos(rad) * 22;
    ctx.fillStyle = '#000000';
    ctx.fillRect(tickX - 3, tickY - 3, 6, 6);

    const project = (pt: Vec3) => {
      const rx = pt.x * cos - pt.z * sin;
      const rz = pt.x * sin + pt.z * cos;
      const scale = 460 / (460 + rz);
      return {
        x: cx + rx * scale,
        y: cy + pt.y * scale,
        z: rz,
      };
    };

    type QuadPart = {
      pts: Vec3[];
      fill: string;
      stroke: string;
    };

    const makePrism = (
      x0: number,
      x1: number,
      y0: number,
      y1: number,
      z0: number,
      z1: number,
      baseFill: string,
      shadeFill: string
    ): QuadPart[] => {
      const p = [
        { x: x0, y: y0, z: z0 }, // 0
        { x: x1, y: y0, z: z0 }, // 1
        { x: x1, y: y1, z: z0 }, // 2
        { x: x0, y: y1, z: z0 }, // 3
        { x: x0, y: y0, z: z1 }, // 4
        { x: x1, y: y0, z: z1 }, // 5
        { x: x1, y: y1, z: z1 }, // 6
        { x: x0, y: y1, z: z1 }, // 7
      ];
      return [
        { pts: [p[4], p[5], p[6], p[7]], fill: baseFill, stroke: '#000000' }, // Front
        { pts: [p[1], p[0], p[3], p[2]], fill: baseFill, stroke: '#000000' }, // Back
        { pts: [p[5], p[1], p[2], p[6]], fill: shadeFill, stroke: '#000000' }, // Right
        { pts: [p[0], p[4], p[7], p[3]], fill: shadeFill, stroke: '#000000' }, // Left
        { pts: [p[0], p[1], p[5], p[4]], fill: shadeFill, stroke: '#000000' }, // Top
        { pts: [p[3], p[7], p[6], p[2]], fill: shadeFill, stroke: '#000000' }, // Bottom
      ];
    };

    const makeTaperedSleeve = (
      side: -1 | 1,
      baseFill: string,
      shadeFill: string
    ): QuadPart[] => {
      const sx0 = side * 58;
      const sx1 = side * 88;
      const syTop0 = -132;
      const syBot0 = -76;
      const syTop1 = -44;
      const syBot1 = -32;
      const zF = 18;
      const zB = -18;
      const p = [
        { x: sx0, y: syTop0, z: zB }, // 0
        { x: sx1, y: syTop1, z: zB * 0.8 }, // 1
        { x: sx1, y: syBot1, z: zB * 0.8 }, // 2
        { x: sx0, y: syBot0, z: zB }, // 3
        { x: sx0, y: syTop0, z: zF }, // 4
        { x: sx1, y: syTop1, z: zF * 0.8 }, // 5
        { x: sx1, y: syBot1, z: zF * 0.8 }, // 6
        { x: sx0, y: syBot0, z: zF }, // 7
      ];
      return [
        { pts: [p[4], p[5], p[6], p[7]], fill: baseFill, stroke: '#000000' },
        { pts: [p[1], p[0], p[3], p[2]], fill: baseFill, stroke: '#000000' },
        { pts: [p[0], p[1], p[5], p[4]], fill: shadeFill, stroke: '#000000' },
        { pts: [p[3], p[7], p[6], p[2]], fill: shadeFill, stroke: '#000000' },
        { pts: [p[5], p[1], p[2], p[6]], fill: '#111111', stroke: '#000000' },
      ];
    };

    const quads: QuadPart[] = [];
    const showTop = inclusionMode === 'BOTH' || inclusionMode === 'TOP_ONLY';
    const showBottom =
      inclusionMode === 'BOTH' || inclusionMode === 'BOTTOM_ONLY';

    if (showBottom) {
      const bottomColor = bottomProduct?.colorHex || '#1B2436';
      const bottomShade = '#151922';
      // Waistband block
      quads.push(...makePrism(-48, 48, -12, 12, -22, 22, bottomColor, bottomShade));
      // Left wide trouser leg
      quads.push(...makePrism(-50, -6, 12, 148, -24, 24, bottomColor, bottomShade));
      // Right wide trouser leg
      quads.push(...makePrism(6, 50, 12, 148, -24, 24, bottomColor, bottomShade));
    }

    if (showTop) {
      const topColor = topProduct?.colorHex || '#2C2C2E';
      const topShade = '#1C1C1E';
      // Boxy torso
      quads.push(...makePrism(-58, 58, -136, -12, -23, 23, topColor, topShade));
      // Mock-neck / collar ring
      quads.push(...makePrism(-22, 22, -152, -136, -16, 16, '#141414', '#0A0A0A'));
      // Left & Right dropped sleeves
      quads.push(...makeTaperedSleeve(-1, topColor, topShade));
      quads.push(...makeTaperedSleeve(1, topColor, topShade));
    }

    // Painter's algorithm sort all projected quads by centroid Z
    const projectedQuads = quads
      .map((q) => {
        const projPts = q.pts.map(project);
        const avgZ = projPts.reduce((sum, pt) => sum + pt.z, 0) / projPts.length;
        return { projPts, avgZ, fill: q.fill, stroke: q.stroke };
      })
      .sort((a, b) => b.avgZ - a.avgZ);

    projectedQuads.forEach((q) => {
      ctx.beginPath();
      q.projPts.forEach((pt, idx) => {
        if (idx === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.closePath();
      ctx.fillStyle = q.fill;
      ctx.fill();
      ctx.strokeStyle = q.stroke;
      ctx.lineWidth = 1.25;
      ctx.stroke();
    });

    // Subtle vertical center axis seam indicator on front
    if (showTop) {
      const seamTop = project({ x: 0, y: -136, z: 24 });
      const seamBot = project({ x: 0, y: -12, z: 24 });
      if (seamTop.z < 10) {
        ctx.strokeStyle = 'rgba(255,255,255,0.22)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(seamTop.x, seamTop.y);
        ctx.lineTo(seamBot.x, seamBot.y);
        ctx.stroke();
      }
    }

    ctx.restore();
  }, [azimuth, topProduct, bottomProduct, inclusionMode]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setAutoSpin(false);
    dragRef.current = { active: true, lastX: e.clientX };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.lastX;
    dragRef.current.lastX = e.clientX;
    setAzimuth((prev) => normalizeAzimuth(prev + dx * 0.75));
  };

  const handlePointerUp = () => {
    dragRef.current.active = false;
  };

  return (
    <div className="relative w-full h-full min-h-[460px] lg:min-h-[540px] bg-[#F4F4F4] flex flex-col justify-between select-none">
      {/* Top 3D Viewport Metadata Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E0E0E0] bg-white/90">
        <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-black">
          360° TURNTABLE VIEWPORT // .GLB MESH SLOT READY
        </span>
        <span
          data-testid="azimuth-readout"
          className="font-mono-tabular text-[11px] font-bold text-black"
        >
          {String(azimuth).padStart(3, '0')}°
        </span>
      </div>

      {/* Interactive Rotatable Canvas */}
      <canvas
        ref={canvasRef}
        data-testid="set-3d-canvas"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="w-full flex-1 cursor-grab active:cursor-grabbing touch-none"
      />

      {/* Bottom 3D Controls & GLB Slot Readout */}
      <div className="px-4 py-3 border-t border-[#E0E0E0] bg-white flex flex-wrap items-center justify-between gap-2">
        <div className="font-mono text-[10px] uppercase text-[#555555] truncate max-w-[260px]">
          {inclusionMode !== 'BOTTOM_ONLY' && topProduct
            ? topProduct.glbModelSlot
            : ''}
          {inclusionMode === 'BOTH' ? ' + ' : ''}
          {inclusionMode !== 'TOP_ONLY' && bottomProduct
            ? bottomProduct.glbModelSlot
            : ''}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setAzimuth((prev) => normalizeAzimuth(prev - 45))}
            className="font-mono text-[10px] font-bold px-2.5 py-1 border border-black bg-white hover:bg-black hover:text-white cursor-pointer"
          >
            -45°
          </button>
          <button
            type="button"
            onClick={() => setAzimuth((prev) => normalizeAzimuth(prev + 45))}
            className="font-mono text-[10px] font-bold px-2.5 py-1 border border-black bg-white hover:bg-black hover:text-white cursor-pointer"
          >
            +45°
          </button>
          <button
            type="button"
            onClick={() => setAutoSpin((prev) => !prev)}
            aria-pressed={autoSpin}
            className={`flex items-center gap-1 font-mono text-[10px] font-bold px-2.5 py-1 border border-black cursor-pointer ${
              autoSpin
                ? 'bg-black text-white'
                : 'bg-white text-black hover:bg-[#F4F4F4]'
            }`}
          >
            <RotateCw size={11} />
            AUTO
          </button>
        </div>
      </div>
    </div>
  );
};
