'use client';

import { useRef, useCallback, type RefObject, type CSSProperties } from 'react';

interface TiltOptions {
  maxTilt?: number;
  perspective?: number;
  scale?: number;
  transitionSpeed?: number;
}

interface TiltResult<T extends HTMLElement> {
  ref: RefObject<T | null>;
  style: CSSProperties;
  onMouseMove: (e: React.MouseEvent<T>) => void;
  onMouseLeave: () => void;
}

export function useTilt<T extends HTMLElement = HTMLElement>(
  options: TiltOptions = {}
): TiltResult<T> {
  const {
    maxTilt = 8,
    perspective = 1000,
    scale = 1.02,
    transitionSpeed = 400,
  } = options;

  const ref = useRef<T | null>(null);
  const frameRef = useRef<number>(0);

  const getTransform = useCallback(
    (e: React.MouseEvent<T>) => {
      const el = ref.current;
      if (!el) return { rotateX: 0, rotateY: 0, scale: 1 };

      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -maxTilt;
      const rotateY = ((x - centerX) / centerX) * maxTilt;

      return { rotateX, rotateY, scale };
    },
    [maxTilt]
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent<T>) => {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(() => {
        const el = ref.current;
        if (!el) return;
        const { rotateX, rotateY, scale: s } = getTransform(e);
        el.style.transform = `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${s},${s},1)`;
        el.style.transition = 'transform 50ms ease-out';
      });
    },
    [getTransform, perspective]
  );

  const onMouseLeave = useCallback(() => {
    cancelAnimationFrame(frameRef.current);
    const el = ref.current;
    if (!el) return;
    el.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)`;
    el.style.transition = `transform ${transitionSpeed}ms cubic-bezier(0.16, 1, 0.3, 1)`;
  }, [perspective, transitionSpeed]);

  const style: CSSProperties = {
    transformStyle: 'preserve-3d',
    willChange: 'transform',
  };

  return { ref, style, onMouseMove, onMouseLeave };
}
