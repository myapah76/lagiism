import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ZoomIn } from 'lucide-react';
import { RunwayLook } from '../data/runwayLooks';
import {
  BodySpringState,
  CLASSIC_PHONE,
  computeClassicPhonePose,
  computeDesktopRingPose,
  createInitialBodies,
  getClassicUnit,
  getRingUnit,
  stepBodySpring,
  wrapN,
} from '../utils/runwayPhysics';

interface RunwayStageProps {
  looks: RunwayLook[];
  activeIndex: number;
  target: number;
  isMobile: boolean;
  reducedMotion: boolean;
  sweepKey: number;
  hotProductId: string | null;
  onMoveTo: (newTarget: number) => void;
  onNext: () => void;
  onPrev: () => void;
  onGo: (index: number) => void;
  onDragStateChange: (dragging: boolean) => void;
  onHoverPin: (productId: string | null) => void;
  onClickPin: (productId: string) => void;
  onOpenLightbox: (triggerEl: HTMLElement | null) => void;
}

export const RunwayStage: React.FC<RunwayStageProps> = ({
  looks,
  activeIndex,
  target,
  isMobile,
  reducedMotion,
  sweepKey,
  hotProductId,
  onMoveTo,
  onNext,
  onPrev,
  onGo,
  onDragStateChange,
  onHoverPin,
  onClickPin,
  onOpenLightbox,
}) => {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const heroWrapRef = useRef<HTMLDivElement | null>(null);
  const actorRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const cursorRef = useRef<HTMLDivElement | null>(null);

  const count = looks.length;
  const targetRef = useRef(target);
  const activeIndexRef = useRef(activeIndex);
  const isMobileRef = useRef(isMobile);
  const reducedMotionRef = useRef(reducedMotion);
  const bodiesRef = useRef<BodySpringState[]>(createInitialBodies(count, target, isMobile));
  const stageWidthRef = useRef(960);
  const isVisibleRef = useRef(true);
  const isMovingRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Drag gesture tracking (no React renders during drag)
  const dragRef = useRef<{
    pointerId: number | null;
    startX: number;
    startY: number;
    startTarget: number;
    active: boolean;
    abandoned: boolean;
    samples: { t: number; x: number }[];
    suppressClickUntil: number;
  }>({
    pointerId: null,
    startX: 0,
    startY: 0,
    startTarget: 0,
    active: false,
    abandoned: false,
    samples: [],
    suppressClickUntil: 0,
  });

  // Trackpad wheel accumulation
  const wheelRef = useRef<{ accum: number; lockUntil: number }>({
    accum: 0,
    lockUntil: 0,
  });

  // Custom desktop cursor state
  const [finePointer, setFinePointer] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(false);
  const [cursorMode, setCursorMode] = useState<'DRAG' | 'VIEW' | 'DOT' | 'DRAGGING'>('DRAG');
  const cursorPosRef = useRef({ x: 0, y: 0, tx: 0, ty: 0, raf: 0 as number | null, init: false });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    setFinePointer(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setFinePointer(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Sync refs when props change
  targetRef.current = target;
  activeIndexRef.current = activeIndex;
  reducedMotionRef.current = reducedMotion;

  const applyPosesToDom = useCallback((stillMoving: boolean) => {
    const mobile = isMobileRef.current;
    const width = stageWidthRef.current;
    const activeIdx = activeIndexRef.current;

    // Hero/body hand-off: hero visible ONLY when settled; front body hidden at rest
    if (heroWrapRef.current) {
      heroWrapRef.current.style.opacity = stillMoving ? '0' : '1';
      heroWrapRef.current.style.pointerEvents = stillMoving ? 'none' : 'auto';
      const heroX = mobile ? width * CLASSIC_PHONE.ax : width * 0.5;
      const heroBottom = mobile ? CLASSIC_PHONE.ay : 18;
      heroWrapRef.current.style.transform = `translate3d(${heroX}px, 0, 0) translateX(-50%)`;
      heroWrapRef.current.style.bottom = `${heroBottom}px`;
    }

    bodiesRef.current.forEach((body, idx) => {
      const el = actorRefs.current[idx];
      if (!el) return;
      const isRestingFront = !stillMoving && idx === activeIdx;
      const pose = mobile
        ? computeClassicPhonePose(body, width, isRestingFront)
        : computeDesktopRingPose(body, count, width, isRestingFront);

      if (pose.culled) {
        el.style.visibility = 'hidden';
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';
        el.tabIndex = -1;
        return;
      }

      el.style.visibility = pose.opacity <= 0.01 ? 'hidden' : 'visible';
      el.style.opacity = pose.opacity.toFixed(3);
      el.style.bottom = `${pose.bottomPx.toFixed(1)}px`;
      el.style.zIndex = String(pose.zIndex);
      el.style.transform = `translate3d(${pose.xPx.toFixed(1)}px, 0, 0) translateX(-50%) scale(${pose.scale.toFixed(4)})`;
      el.style.filter = pose.blurPx > 0.05 ? `blur(${pose.blurPx.toFixed(2)}px)` : 'none';
      const clickable = !isRestingFront && pose.opacity > 0.25 && idx !== activeIdx;
      el.style.pointerEvents = clickable ? 'auto' : 'none';
      el.tabIndex = clickable ? 0 : -1;
    });
  }, [count]);

  const stopLoop = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, []);

  const tick = useCallback(
    (now: number) => {
      rafIdRef.current = null;
      if (!isVisibleRef.current || document.hidden) {
        return;
      }

      const dt = lastTimeRef.current ? Math.max(0.001, (now - lastTimeRef.current) / 1000) : 0.016;
      lastTimeRef.current = now;

      const dragging = dragRef.current.active;
      const snap = reducedMotionRef.current;
      let anyMoving = dragging;

      for (const body of bodiesRef.current) {
        const moving = stepBodySpring(
          body,
          targetRef.current,
          count,
          dt,
          dragging,
          isMobileRef.current,
          snap
        );
        if (moving) anyMoving = true;
      }

      isMovingRef.current = anyMoving;
      applyPosesToDom(anyMoving);

      if (anyMoving) {
        rafIdRef.current = requestAnimationFrame(tick);
      } else {
        lastTimeRef.current = 0;
      }
    },
    [applyPosesToDom, count]
  );

  const kick = useCallback(() => {
    if (!isVisibleRef.current || document.hidden) return;
    if (rafIdRef.current === null) {
      lastTimeRef.current = 0;
      rafIdRef.current = requestAnimationFrame(tick);
    }
  }, [tick]);

  // Re-initialize spring coordinate frame cleanly when crossing 749/750px breakpoint
  useEffect(() => {
    if (isMobileRef.current !== isMobile) {
      isMobileRef.current = isMobile;
      bodiesRef.current = createInitialBodies(count, targetRef.current, isMobile);
    }
    kick();
  }, [isMobile, count, kick]);

  // Kick physics whenever target or reducedMotion changes
  useEffect(() => {
    kick();
  }, [target, reducedMotion, kick]);

  // IntersectionObserver + Page Visibility + ResizeObserver (debounced 120ms)
  useEffect(() => {
    const stageEl = stageRef.current;
    if (!stageEl) return;

    stageWidthRef.current = stageEl.clientWidth || 960;
    applyPosesToDom(false);

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((e) => e.isIntersecting);
        isVisibleRef.current = visible;
        if (visible) kick();
        else stopLoop();
      },
      { threshold: 0 }
    );
    io.observe(stageEl);

    let resizeTimer: number | null = null;
    const ro = new ResizeObserver(() => {
      if (resizeTimer !== null) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (!stageRef.current) return;
        stageWidthRef.current = stageRef.current.clientWidth || 960;
        applyPosesToDom(isMovingRef.current);
        kick();
      }, 120);
    });
    ro.observe(stageEl);

    const onVisibility = () => {
      if (document.hidden) stopLoop();
      else kick();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stopLoop();
      io.disconnect();
      ro.disconnect();
      if (resizeTimer !== null) window.clearTimeout(resizeTimer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [applyPosesToDom, kick, stopLoop]);

  // Custom desktop cursor lerp loop (stops when settled)
  const kickCursor = useCallback(() => {
    const st = cursorPosRef.current;
    if (st.raf) return;
    const step = () => {
      st.raf = null;
      const el = cursorRef.current;
      if (!el) return;
      if (reducedMotionRef.current) {
        st.x = st.tx;
        st.y = st.ty;
      } else {
        st.x += (st.tx - st.x) * 0.18;
        st.y += (st.ty - st.y) * 0.18;
      }
      el.style.transform = `translate3d(${st.x.toFixed(1)}px, ${st.y.toFixed(1)}px, 0)`;
      if (Math.hypot(st.tx - st.x, st.ty - st.y) > 0.4) {
        st.raf = requestAnimationFrame(step);
      }
    };
    st.raf = requestAnimationFrame(step);
  }, []);

  useEffect(() => {
    const st = cursorPosRef.current;
    return () => {
      if (st.raf) cancelAnimationFrame(st.raf);
    };
  }, []);

  // Pointer Drag Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    const el = e.target as HTMLElement;
    if (el.closest('button[data-pin-btn], button[data-zoom-btn]')) return;

    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startTarget: targetRef.current,
      active: false,
      abandoned: false,
      samples: [{ t: performance.now(), x: e.clientX }],
      suppressClickUntil: dragRef.current.suppressClickUntil,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (finePointer) {
      const st = cursorPosRef.current;
      st.tx = e.clientX;
      st.ty = e.clientY;
      if (!st.init) {
        st.x = e.clientX;
        st.y = e.clientY;
        st.init = true;
      }
      kickCursor();
    }

    const d = dragRef.current;
    if (d.pointerId !== e.pointerId || d.abandoned) return;

    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;

    if (!d.active) {
      if (Math.abs(dy) > 10 && Math.abs(dy) >= Math.abs(dx)) {
        d.abandoned = true;
        return;
      }
      if (Math.abs(dx) > 8 && Math.abs(dx) > 1.2 * Math.abs(dy)) {
        d.active = true;
        stageRef.current?.setPointerCapture?.(e.pointerId);
        onDragStateChange(true);
        setCursorMode('DRAGGING');
      } else {
        return;
      }
    }

    const unit = isMobileRef.current
      ? getClassicUnit(stageWidthRef.current)
      : getRingUnit(stageWidthRef.current);

    const nextTarget = d.startTarget - dx / unit;
    targetRef.current = nextTarget;

    const now = performance.now();
    d.samples.push({ t: now, x: e.clientX });
    if (d.samples.length > 6) d.samples.shift();

    kick();
  };

  const finishDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (d.pointerId !== e.pointerId) return;
    d.pointerId = null;

    if (!d.active) return;

    d.active = false;
    d.suppressClickUntil = performance.now() + 60;
    onDragStateChange(false);
    setCursorMode('DRAG');

    try {
      stageRef.current?.releasePointerCapture?.(e.pointerId);
    } catch {
      // ignore if already released
    }

    const samples = d.samples;
    let vx = 0;
    if (samples.length >= 2) {
      const first = samples[0];
      const last = samples[samples.length - 1];
      const dtMs = Math.max(1, last.t - first.t);
      vx = ((last.x - first.x) / dtMs) * 1000; // px/sec
    }

    const dx = e.clientX - d.startX;
    const base = Math.round(d.startTarget);

    if (isMobileRef.current) {
      // Mobile: 1 swipe = 1 look
      if (dx < -35 || vx < -280) {
        onMoveTo(base + 1);
      } else if (dx > 35 || vx > 280) {
        onMoveTo(base - 1);
      } else {
        onMoveTo(base);
      }
    } else {
      // Desktop: momentum clamped to at most 2 looks
      const unit = getRingUnit(stageWidthRef.current);
      const projected = targetRef.current - (vx * 0.18) / unit;
      let dest = Math.round(projected);
      const delta = dest - base;
      if (delta === 0 && Math.abs(vx) > 320) {
        dest = base + (vx < 0 ? 1 : -1);
      }
      const clampedDelta = Math.max(-2, Math.min(2, dest - base));
      onMoveTo(base + clampedDelta);
    }
  };

  // Trackpad Horizontal Wheel Navigation (preserves vertical page scrolling!)
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    const now = performance.now();
    if (now < wheelRef.current.lockUntil) return;

    wheelRef.current.accum += e.deltaX;
    if (Math.abs(wheelRef.current.accum) > 45) {
      const dir = wheelRef.current.accum > 0 ? 1 : -1;
      wheelRef.current.accum = 0;
      wheelRef.current.lockUntil = now + 520;
      if (dir > 0) onNext();
      else onPrev();
    }
  };

  // Keyboard Navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      onNext();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      onPrev();
    }
  };

  const activeLook = looks[wrapN(activeIndex, count)] ?? looks[0];

  return (
    <div
      ref={stageRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="LAGIISM Runway Stage"
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
      onPointerEnter={() => finePointer && setCursorVisible(true)}
      onPointerLeave={() => {
        setCursorVisible(false);
        setCursorMode('DRAG');
      }}
      onWheel={handleWheel}
      onKeyDown={handleKeyDown}
      className="relative w-full h-[54svh] sm:h-[62svh] lg:h-[72svh] min-h-[380px] max-h-[780px] overflow-hidden select-none touch-pan-y cursor-grab active:cursor-grabbing focus-visible:outline-2 focus-visible:outline-[#9E3E24]"
    >
      {/* Subtle architectural floor horizon line */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-5 h-px bg-[#D4D2CA]"
      />

      {/* Light Sweep on Look Changes */}
      {!reducedMotion && sweepKey > 0 && (
        <div
          key={sweepKey}
          aria-hidden="true"
          className="rw-stage-sweep rw-stage-sweep--active"
        />
      )}

      {/* Queue Actors (Spring-Physics Driven via Direct Refs — 0 React renders/frame) */}
      {looks.map((look, idx) => (
        <button
          key={look.id}
          ref={(el) => {
            actorRefs.current[idx] = el;
          }}
          type="button"
          aria-label={`Jump to Look 0${look.number}: ${look.name}`}
          onClick={() => {
            if (performance.now() < dragRef.current.suppressClickUntil) return;
            onGo(idx);
          }}
          onMouseEnter={() => setCursorMode('DOT')}
          onMouseLeave={() => setCursorMode('DRAG')}
          className="absolute left-0 h-[78%] sm:h-[82%] w-[210px] sm:w-[270px] lg:w-[320px] flex items-end justify-center bg-transparent border-0 p-0 cursor-pointer will-change-transform"
          style={{ bottom: '18px' }}
        >
          <img
            src={look.model.image}
            alt={look.model.alt}
            loading={Math.abs(idx - activeIndex) <= 1 ? 'eager' : 'lazy'}
            decoding="async"
            draggable={false}
            className="w-full h-full object-contain object-bottom drop-shadow-[0_12px_18px_rgba(14,14,14,0.12)]"
          />
        </button>
      ))}

      {/* Active Front Hero (Visible ONLY while settled — invisible swap with front body!) */}
      <div
        ref={heroWrapRef}
        className="absolute left-0 h-[78%] sm:h-[82%] w-[210px] sm:w-[270px] lg:w-[320px] z-[1050] flex items-end justify-center will-change-transform"
        style={{ bottom: '18px' }}
      >
        <div className="relative w-full h-full flex items-end justify-center">
          <button
            type="button"
            data-zoom-btn
            aria-label={`View current look: Look 0${activeLook.number} ${activeLook.name}`}
            onClick={(e) => {
              if (performance.now() < dragRef.current.suppressClickUntil) return;
              onOpenLightbox(e.currentTarget);
            }}
            onMouseEnter={() => setCursorMode('VIEW')}
            onMouseLeave={() => setCursorMode('DRAG')}
            className="group relative w-full h-full bg-transparent border-0 p-0 cursor-pointer"
          >
            <img
              src={activeLook.hero.image}
              alt={activeLook.hero.alt}
              decoding="async"
              draggable={false}
              className="w-full h-full object-contain object-bottom drop-shadow-[0_14px_22px_rgba(14,14,14,0.16)]"
            />
            <span className="sr-only">Open full-screen look view</span>
            <span
              aria-hidden="true"
              className="absolute top-3 right-3 w-8 h-8 bg-[#F4F3EF]/85 border border-[#111111] inline-flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity"
            >
              <ZoomIn className="w-3.5 h-3.5 text-[#111111]" />
            </span>
          </button>

          {/* Product Pins (Normalized % coordinates relative to active model box) */}
          {activeLook.products.map((prod, pIdx) => {
            const isHot = hotProductId === prod.id;
            return (
              <button
                key={prod.id}
                type="button"
                data-pin-btn
                aria-label={`Inspect ${prod.name} in this look`}
                onMouseEnter={() => {
                  onHoverPin(prod.id);
                  setCursorMode('DOT');
                }}
                onMouseLeave={() => {
                  onHoverPin(null);
                  setCursorMode('DRAG');
                }}
                onFocus={() => onHoverPin(prod.id)}
                onBlur={() => onHoverPin(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  onClickPin(prod.id);
                }}
                style={{
                  left: `${prod.pin.x}%`,
                  top: `${prod.pin.y}%`,
                }}
                className="group/pin absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 inline-flex items-center justify-center cursor-pointer z-20"
              >
                {!reducedMotion && (
                  <>
                    <span className="rw-pin-ring" aria-hidden="true" />
                    <span className="rw-pin-ring rw-pin-ring--delayed" aria-hidden="true" />
                  </>
                )}
                <span
                  className={`rw-pin-dot relative w-5 h-5 border border-[#111111] font-mono text-[9px] font-bold inline-flex items-center justify-center transition-colors ${
                    isHot
                      ? 'bg-[#9E3E24] text-[#F4F3EF] border-[#9E3E24]'
                      : 'bg-[#F4F3EF] text-[#111111] group-hover/pin:bg-[#0E0E0E] group-hover/pin:text-[#F4F3EF]'
                  }`}
                >
                  {pIdx + 1}
                </span>

                {/* Tooltip */}
                <span
                  className={`pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 whitespace-nowrap bg-[#0E0E0E] text-[#F4F3EF] border border-[#111111] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.08em] transition-opacity ${
                    isHot ? 'opacity-100' : 'opacity-0 group-hover/pin:opacity-100 group-focus-visible/pin:opacity-100'
                  }`}
                >
                  {prod.pin.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Editorial Desktop Cursor (hover: hover & pointer: fine only) */}
      {finePointer && cursorVisible && (
        <div
          ref={cursorRef}
          aria-hidden="true"
          className={`rw-custom-cursor ${
            cursorMode === 'DOT'
              ? 'rw-custom-cursor--dot'
              : cursorMode === 'DRAGGING'
                ? 'rw-custom-cursor--drag'
                : ''
          }`}
        >
          {cursorMode !== 'DOT' && (
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em]">
              {cursorMode === 'DRAGGING' ? '•••' : cursorMode}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
